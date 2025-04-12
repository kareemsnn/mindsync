from fastapi import FastAPI, HTTPException
from supabase import create_client, Client
from dotenv import load_dotenv
import os
from sklearn.neighbors import NearestNeighbors
from models import customGNN, PSYCHBERT, GeneticAlgorithm  
import numpy as np
import torch
from torch_geometric.data import Data
from contextlib import asynccontextmanager

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
@app.get("/run-gnn")
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




#pschbert for personality classification based on psychbert paper "https://ieeexplore.ieee.org/document/9669469"
@app.post("/classifyUser")
async def classify_user(user_id: int):
    try:
        psychbert = PSYCHBERT()  
        
        response = supabase.table("users").select("text").eq("id", user_id).execute()
        if not response.get("data"):
            raise HTTPException(status_code=404, detail="User not found")
        
        user_text = response["data"][0]["text"]
        results = psychbert.classify_personality(user_text)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



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
        return {"group_assignments": group_assignments, "user_ids": user_ids}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
