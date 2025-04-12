from datasets import load_dataset
from sentence_transformers import SentenceTransformer
import pandas as pd
from models import customGNN
import numpy as np
import torch
import torch.optim as optim
import torch.nn.functional as F
from sklearn.neighbors import NearestNeighbors
from torch_geometric.data import Data
import random
import logging

# logging setup write to console and file
logger = logging.getLogger("train_logger")
logger.setLevel(logging.INFO)
c_handler = logging.StreamHandler()
f_handler = logging.FileHandler("train.log")
c_handler.setLevel(logging.INFO)
f_handler.setLevel(logging.INFO)
formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")
c_handler.setFormatter(formatter)
f_handler.setFormatter(formatter)
logger.addHandler(c_handler)
logger.addHandler(f_handler)

# random seeds for reproducibility
def set_seeds(seed=42):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)
    logger.info(f"Random seeds set to {seed}")

set_seeds(42)

"""

using huggingface dataset to load data
generating user_id,embedding for each user
saving embeddings to user_embeddings.csv

this function is to initially train the model

later on user data will be used to train the model


"""
def generate_and_save_embeddings():
    logger.info("Loading dataset 'jingjietan/essays-big5'...")
    ds = load_dataset("jingjietan/essays-big5")
    all_data = (
        [
            {"user_id": f"train_{idx + 1}", "text": row["text"]}
            for idx, row in enumerate(ds["train"])
        ]
        + [
            {"user_id": f"val_{idx + 1}", "text": row["text"]}
            for idx, row in enumerate(ds["validation"])
        ]
        + [
            {"user_id": f"test_{idx + 1}", "text": row["text"]}
            for idx, row in enumerate(ds["test"])
        ]
    )

    logger.info("Generating embeddings with SentenceTransformer (all-mpnet-base-v2)...")
    model = SentenceTransformer('all-mpnet-base-v2')
    texts = [item["text"] for item in all_data]
    embeddings = model.encode(texts, show_progress_bar=True)

    for i, item in enumerate(all_data):
        item["embedding"] = embeddings[i].tolist()

    pd.DataFrame(all_data).to_csv("user_embeddings.csv", index=False)
    logger.info("Embeddings saved to user_embeddings.csv.")


generate_and_save_embeddings()

#util function to load embeddings from csv
def load_embeddings_from_csv(csv_path="user_embeddings.csv"):
    logger.info("Loading embeddings from CSV...")
    df = pd.read_csv(csv_path)
    df["embedding"] = df["embedding"].apply(lambda x: np.fromstring(x.strip("[]"), sep=", "))
    embeddings = np.stack(df["embedding"].values)  # Shape: (num_users, 768)
    user_ids = df["user_id"].values.tolist()
    logger.info(f"Loaded embeddings for {len(user_ids)} users.")
    return embeddings, user_ids


#knn for each user represented as an edge list
def build_knn_graph(embeddings: np.ndarray, k=10):
    logger.info("Building KNN graph...")
    nbrs = NearestNeighbors(n_neighbors=k+1, metric="cosine").fit(embeddings)
    _, indices = nbrs.kneighbors(embeddings)
    edge_list = []
    for i, neighbors in enumerate(indices):
        for neighbor in neighbors[1:]:  # skip self 
            edge_list.append((i, neighbor))
    logger.info("KNN graph built.")
    return edge_list


#pytorch geometric data object
def create_data_object(embeddings: np.ndarray, edge_list: list):
    logger.info("Creating PyTorch Geometric Data object...")
    edge_index = torch.tensor(edge_list, dtype=torch.long).t().contiguous()
    x = torch.tensor(embeddings, dtype=torch.float)
    data = Data(x=x, edge_index=edge_index)
    logger.info("Data object created.")
    return data


# loss function for grouping embeddings based on cosine similarity

def contrastive_loss_vectorized(embeddings, edge_index, tau=0.5):
    """
    Computes a vectorized contrastive loss.
    Each node is compared with all other nodes, but only those in its positive set (neighbors)
    are considered as positives.
    """
    # Normalize embeddings
    norm_embeddings = F.normalize(embeddings, p=2, dim=1)
    # Compute cosine similarity matrix [N, N]
    sim_matrix = torch.mm(norm_embeddings, norm_embeddings.t())
    N = embeddings.size(0)
    
    # Create a positive mask from edge_index (ones where there is an edge)
    pos_mask = torch.zeros((N, N), device=embeddings.device, dtype=torch.bool)
    pos_mask[edge_index[0], edge_index[1]] = True
    
    # Exclude self-similarity by setting diagonal to False
    diag = torch.eye(N, device=embeddings.device, dtype=torch.bool)
    pos_mask = pos_mask & (~diag)
    
    # Apply temperature scaling and compute exp(similarity)
    sim_exp = torch.exp(sim_matrix / tau)
    # For denominator, exclude self-similarity (mask out diagonal)
    sim_exp = sim_exp.masked_fill(diag, 0)
    denom = sim_exp.sum(dim=1, keepdim=True)  # Shape: [N, 1]
    
    # Compute log probability only on the positive pairs; we average loss over all positives.
    pos_sim = sim_exp * pos_mask.float()
    # For each node, sum over positives
    pos_sum = pos_sim.sum(dim=1)  # Shape: [N]
    # Compute per-node loss: -log (sum_pos / denominator)
    loss = -torch.log((pos_sum / (denom.squeeze(1) + 1e-9)) + 1e-9)
    # Average loss over nodes which have at least one positive pair.
    valid = pos_mask.sum(dim=1) > 0
    if valid.sum() == 0:
        return torch.tensor(0.0, device=embeddings.device)
    loss = loss[valid].mean()
    return loss


#gnn training loop with constrastive loss function and gradient clipping 
def train_gnn(model, data, optimizer, epochs=200, tau=0.5, clip_value=1.0):
    logger.info("Starting GNN training...")
    best_loss = float('inf')
    best_state = None
    model.train()
    for epoch in range(epochs):
        optimizer.zero_grad()
        embeddings_out = model(data)  # Forward pass to get refined embeddings, shape [N, D]
        loss = contrastive_loss_vectorized(embeddings_out, data.edge_index, tau=tau)
        loss.backward()
        # Apply gradient clipping to prevent exploding gradients
        torch.nn.utils.clip_grad_norm_(model.parameters(), clip_value)
        optimizer.step()
        if loss.item() < best_loss:
            best_loss = loss.item()
            best_state = model.state_dict()
        if epoch % 10 == 0:
            logger.info(f"Epoch {epoch+1}, Loss: {loss.item():.4f}")
    logger.info("GNN training complete.")
    logger.info(f"Best training loss: {best_loss:.4f}")
    # best model state
    if best_state is not None:
        model.load_state_dict(best_state)
    return model

#training loop
def main():
    embeddings, user_ids = load_embeddings_from_csv("user_embeddings.csv")
    logger.info(f"Loaded embeddings for {len(user_ids)} users.")
    
    edge_list = build_knn_graph(embeddings, k=10)
    data_obj = create_data_object(embeddings, edge_list)
    
    # Embeddings are 768-dimensional from all-mpnet-base-v2.
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = customGNN(input_size=768, hidden_size=512, output_size=768).to(device)
    optimizer = optim.Adam(model.parameters(), lr=0.005)
    
    data_obj = data_obj.to(device)
    logger.info("Beginning training loop...")
    trained_model = train_gnn(model, data_obj, optimizer, epochs=100, tau=0.5, clip_value=1.0)
    
    # Save the best model to be served for inference
    torch.save(trained_model.state_dict(), "trained_customGNN_best.pth")
    logger.info("Training complete. Best model saved as trained_customGNN_best.pth")
    
    # Optionally, run inference to see refined embeddings.
    trained_model.eval()
    with torch.no_grad():
        refined_embeddings = trained_model(data_obj)
    logger.info(f"Refined embeddings shape: {refined_embeddings.shape}")

if __name__ == "__main__":
    main()
