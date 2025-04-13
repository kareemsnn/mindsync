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

"""
supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)



#util function
def fetchEmbeddings():
    response = supabase.table("users").select("id, embedding").execute()
    if not response.get("data"):
        raise Exception("No data returned from Supabase")
    
    data = response["data"]
    user_ids = [row["id"] for row in data]
    embeddings = []
    for row in data:
        emb_str = row["embedding"]  # e.g. "[0.1, 0.2, ..., 0.768]"
        emb_str = emb_str.strip("[]")
        emb_values = list(map(float, emb_str.split(",")))
        embeddings.append(emb_values)
    return np.array(embeddings), user_ids


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

async def run_gnn():
    try:
        embeddings, user_ids = fetchEmbeddings()
        edge_list = knn(embeddings, k=10)
        data = create_data_object(embeddings, edge_list)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    device = torch.device("cpu")
    # Use the cached model instead of reloading every time.
    global cached_model
    if cached_model is None:
        raise HTTPException(status_code=500, detail="Model is not loaded.")
    
    data = data.to(device)
    with torch.no_grad():
        refined_embedding = cached_model(data)
    
    refined_embedding = refined_embedding.cpu().numpy().tolist()
    return {"embeddings": refined_embedding, "user_ids": user_ids}



# heuristic genetic algorithm for group assignment
@app.post("/groupUsers")
async def group_users():
    try:
        
        gnn_results = await run_gnn()
        user_ids = gnn_results["user_ids"]
        
        ga = GeneticAlgorithm(NUsers=len(user_ids), embeddings=gnn_results["embeddings"], minK=3, maxK=5)

        best_individual, logbook = ga.run_genetic_algorithm(pop_size=50, n_gen=40)

        # Process best_individual to extract final group assignments

        group_assignments = list(best_individual)  # This is a list of group ids corresponding to each user

        # k means clustering to validate group assignments could be used here
        groups = {}
        for uid, grp in zip(user_ids, group_assignments):
            if grp in groups:
                groups[grp].append(uid)
            else:
                groups[grp] = [uid]
        return groups

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



class ClassificationRequest(BaseModel):
    user_id: int
    texts: List[str]



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





"""


# -------------------------
# Define a Pydantic model for the dummy user input.
# -------------------------
class DummyUser(BaseModel):
    id: int
    text: str

# -------------------------
# Dummy embedding function: This function simulates generating a 768-dimensional embedding
# from a text response. For consistency during testing, it uses a seeded random vector.
# In production, you would replace this with your actual text encoder.
# -------------------------
def dummy_embedding(text: str, dim: int = 768):
    # Use the hash of the text to seed the randomness for consistency
    np.random.seed(abs(hash(text)) % (2**32))
    return np.random.rand(dim)

# -------------------------
# Reuse your KNN function.
# -------------------------
def knn(embeddings: np.ndarray, k: int = 10):
    nbrs = NearestNeighbors(n_neighbors=k+1, metric="cosine").fit(embeddings)
    distances, indices = nbrs.kneighbors(embeddings)
    edge_list = []
    for i, neighbors in enumerate(indices):
        for neighbor in neighbors[1:]:
            edge_list.append((i, neighbor))
    return edge_list

# -------------------------
# Reuse your create_data_object function.
# -------------------------
def create_data_object(embeddings: np.ndarray, edge_list: list):
    edge_index = torch.tensor(edge_list, dtype=torch.long).t().contiguous()
    x = torch.tensor(embeddings, dtype=torch.float)
    data = Data(x=x, edge_index=edge_index)
    return data

# -------------------------
# New endpoint to test the flow using dummy data from Postman.
# This endpoint expects a JSON array of dummy users with "id" and "text" fields.
# -------------------------
@app.post("/groupUsersTest")
async def group_users_test(users: List[DummyUser]):
    try:
        # 1. Convert dummy texts to embeddings.
        user_ids = [user.id for user in users]
        embeddings = [dummy_embedding(user.text) for user in users]
        embeddings_np = np.array(embeddings)
        
        # 2. Build the KNN graph using the generated embeddings.
        edge_list = knn(embeddings_np, k=10)
        data_obj = create_data_object(embeddings_np, edge_list)
        
        # 3. Run the GNN to get refined embeddings.
        device = torch.device("cpu")
        # Use app.state.cached_model instead of global cached_model
        if app.state.cached_model is None:
            raise HTTPException(status_code=500, detail="Model is not loaded.")
        data_obj = data_obj.to(device)
        with torch.no_grad():
            refined_embeddings = app.state.cached_model(data_obj)  # Use app.state.cached_model
        refined_embeddings = refined_embeddings.cpu().numpy().tolist()
        
        # 4. Run the Genetic Algorithm to obtain grouping.
        ga = GeneticAlgorithm(NUsers=len(user_ids), embeddings=refined_embeddings, minK=3, maxK=5)
        best_individual, _ = ga.run_genetic_algorithm(pop_size=50, n_gen=40)
        group_assignments = list(best_individual)

        
        
        groups = {}
        for uid, grp in zip(user_ids, group_assignments):
            if grp in groups:
                groups[grp].append(uid)
            else:
                groups[grp] = [uid]
        return groups

        

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))






