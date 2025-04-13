from fastapi import FastAPI, HTTPException
from supabase import create_client, Client
from dotenv import load_dotenv
import os
from pydantic import BaseModel
from typing import List
from sklearn.neighbors import NearestNeighbors
from models import customGNN, PSYCHBERT, GeneticAlgorithm  
import numpy as np
import torch
from torch_geometric.data import Data
from contextlib import asynccontextmanager
import math

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # on startup cache the model
    device = torch.device("cpu")
    try:
        model = customGNN(input_size=768, hidden_size=512, output_size=768).to(device)
        model.load_state_dict(torch.load("trained_customGNN.pth", map_location=device))
        model.eval()  # model on evaluation mode
        app.state.cached_model = model
        print("Cached model loaded successfully.")
    except Exception as e:
        print("Error loading cached model:", e)
        app.state.cached_model = None
    yield
    # cleanup if necessary.
    
    print("Shutting down")

# fastapi app with lifespan handler
app = FastAPI(lifespan=lifespan)


supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)


model = SentenceTransformer('all-mpnet-base-v2')


def process_users(users: List[UserResponses]):
    all_embeddings = []
    user_ids = []
    
    for user in users:
        # Per-user embedding
        user_embeddings = [model.encode(text) for text in user.list]
        avg_embedding = np.mean(user_embeddings, axis=0)  # Average THIS USER's responses
        all_embeddings.append(avg_embedding)
        user_ids.append(user.id)
        
    return np.array(all_embeddings), user_ids

    


#util function to generate edge list of k nearest neighbors for all users using sklearn but pgvector is also an option and probably faster
def knn(embeddings: np.ndarray, k=10):
    nbrs = NearestNeighbors(n_neighbors=k+1, metric="cosine").fit(embeddings)
    distances, indices = nbrs.kneighbors(embeddings)
    edge_list = []
    for i, neighbors in enumerate(indices):
        for neighbor in neighbors[1:]:
            edge_list.append((i, neighbor))
    return edge_list



def create_data_object(embeddings: np.ndarray, edge_list: list):
    edge_index = torch.tensor(edge_list, dtype=torch.long).t().contiguous()
    x = torch.tensor(embeddings, dtype=torch.float)
    data = Data(x=x, edge_index=edge_index)
    return data



#gnn for group cohesion and retrieving refined embeddings

async def run_gnn(embeddings: np.ndarray, user_ids: list):  # Add parameters here
    try:
        edge_list = knn(embeddings, k=10)
        data = create_data_object(embeddings, edge_list)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    device = torch.device("cpu")
    global cached_model
    if cached_model is None:
        raise HTTPException(status_code=500, detail="Model is not loaded.")
    
    data = data.to(device)
    with torch.no_grad():
        refined_embedding = cached_model(data)
    
    refined_embedding = refined_embedding.cpu().numpy().tolist()
    return {"embeddings": refined_embedding, "user_ids": user_ids}  # Return the same user_ids

@app.post("/groupUsers")
async def group_users(request: GroupingRequest):  # Add type hint
    try:
        # 1. Process all users
        embeddings, user_ids = process_users(request.users)  # Changed from request.texts
        
        # 2. Run GNN with the processed data
        gnn_results = await run_gnn(embeddings, user_ids)  # Pass the parameters
        
        # 3. Genetic Algorithm
        ga = GeneticAlgorithm(
            NUsers=len(user_ids),
            embeddings=gnn_results["embeddings"],
            minK=3,
            maxK=5
        )
        
        best_individual, _ = ga.run_genetic_algorithm(pop_size=50, n_gen=40)
        
        # 4. Format groups
        groups = {}
        for uid, grp in zip(user_ids, list(best_individual)):
            groups.setdefault(grp, []).append(uid)
            
        for group in groups:
            for uid in groups[group]:
                supabase.table("group_members").insert({
                    "group_id": group,
                    "user_id": uid
                }).execute()

        return {"success": True}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


