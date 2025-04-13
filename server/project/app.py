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
from sentence_transformers import SentenceTransformer
import math
from huggingface_hub import hf_hub_download, snapshot_download

load_dotenv()


class UserResponses(BaseModel):
    id: int
    list: List[str]

class GroupingRequest(BaseModel):
    users: List[UserResponses]

class ClassificationRequest(BaseModel):
    user_id: int
    texts: List[str]


@asynccontextmanager
async def lifespan(app: FastAPI):
    # on startup cache the model
    device = torch.device("cpu")
    try:
        # Download models from HuggingFace
        print("Downloading models from HuggingFace...")
        gnn_path = hf_hub_download(
            repo_id="mmannan17/mindsync",
            filename="trained_customGNN.pth",
            local_dir=".",
            token=os.environ.get("HF_TOKEN")
        )
        
        # Load the GNN model
        model = customGNN(input_size=768, hidden_size=512, output_size=768).to(device)
        model.load_state_dict(torch.load(gnn_path, map_location=device))
        model.eval()  # model on evaluation mode
        app.state.cached_model = model
        
        # Download PersonalityLM model
        print("Downloading PersonalityLM model...")
        personality_lm_path = snapshot_download(
            repo_id="mmannan17/mindsync",
            allow_patterns="trained_PersonalityLM_best/**",
            local_dir=".",
            token=os.environ.get("HF_TOKEN")
        )
        
        # Store paths in app state for later use
        app.state.personality_lm_path = personality_lm_path
        
        print("All models loaded successfully.")
    except Exception as e:
        print("Error loading models:", e)
        app.state.cached_model = None
        app.state.personality_lm_path = None
        raise RuntimeError(f"Failed to load models: {str(e)}")
    
    yield
    # cleanup if necessary.
    print("Shutting down")

# fastapi app with lifespan handler
app = FastAPI(lifespan=lifespan)


supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)


sentence_model = SentenceTransformer('all-mpnet-base-v2')


def process_users(users: List[UserResponses]):
    all_embeddings = []
    user_ids = []
    
    for user in users:
        # Per-user embedding
        user_embeddings = [sentence_model.encode(text) for text in user.list]
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
    cached_model = app.state.cached_model
    if cached_model is None:
        raise HTTPException(status_code=500, detail="Model is not loaded.")
    
    data = data.to(device)
    with torch.no_grad():
        refined_embedding = cached_model(data)
    
    refined_embedding = refined_embedding.cpu().numpy().tolist()
    return {"embeddings": refined_embedding, "user_ids": user_ids}  # Return the same user_ids


@app.post("/groupUsers")
async def group_users(request: GroupingRequest):
    try:
        # 1. Process all users
        embeddings, user_ids = process_users(request.users)
        
        # 2. Run GNN with the processed data
        gnn_results = await run_gnn(embeddings, user_ids)
        
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
            groups.setdefault(int(grp), []).append(uid)
        
        # 5. Create groups and add members
        for group_number in groups:
            # First create the group
            group_result = supabase.table("groups").insert({
                "created_at": "now()",
            }).execute()
            
            # Get the created group's ID
            group_id = group_result.data[0]['id']
            
            # Add members to the group
            for user_id in groups[group_number]:
                supabase.table("group_members").insert({
                    "group_id": group_id,
                    "user_id": user_id,
                    "created_at": "now()"
                }).execute()

        return {
            "status": 200,
            "groups": {str(k): v for k, v in groups.items()}
        }

    except Exception as e:
        print(f"Error in group_users: {str(e)}")  # Add logging
        raise HTTPException(status_code=500, detail=str(e))



def sigmoid_scale(x, steepness=25):
    return 1 / (1 + math.exp(-steepness * (x - 0.5)))


categories = ['O','C','E','A','N']

@app.post("/classifyUser")
async def classify_user(request: ClassificationRequest):
    try:
        psychbert = PSYCHBERT()
        aggregated_result = psychbert.aggregate_classification(request.texts)
        for char in categories:
            aggregated_result['personality_results'][char] = sigmoid_scale(aggregated_result['personality_results'][char])
        return aggregated_result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

