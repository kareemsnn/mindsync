from huggingface_hub import hf_hub_download, snapshot_download
import os
from pathlib import Path

def download_models():
    """Downloads models from HuggingFace Hub and ensures they're in the correct location"""
    try:
        # Create directories if they don't exist
        os.makedirs("models", exist_ok=True)
        
        print("Downloading CustomGNN model...")
        gnn_path = hf_hub_download(
            repo_id="mmannan17/mindsync",
            filename="trained_customGNN.pth",
            local_dir="models",
            token=os.environ.get("HF_TOKEN")  # Will use token from environment variable
        )
        
        print("Downloading PersonalityLM model...")
        personality_lm_path = snapshot_download(
            repo_id="mmannan17/mindsync",
            allow_patterns="trained_PersonalityLM_best/**",
            local_dir="models",
            token=os.environ.get("HF_TOKEN")
        )
        
        # Ensure the paths are correct
        gnn_model_path = Path("models/trained_customGNN.pth")
        personality_lm_path = Path("models/trained_PersonalityLM_best")
        
        print(f"Models downloaded successfully:")
        print(f"GNN Model: {gnn_model_path}")
        print(f"PersonalityLM: {personality_lm_path}")
        
        return str(gnn_model_path), str(personality_lm_path)
    
    except Exception as e:
        print(f"Error downloading models: {str(e)}")
        raise

def verify_models():
    """Verify that models exist in the expected locations"""
    gnn_exists = os.path.exists("models/trained_customGNN.pth")
    lm_exists = os.path.exists("models/trained_PersonalityLM_best")
    
    if not gnn_exists:
        raise FileNotFoundError("GNN model not found")
    if not lm_exists:
        raise FileNotFoundError("PersonalityLM model not found")
    
    return True