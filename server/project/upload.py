from huggingface_hub import HfApi, create_repo, login
import os

# Login to Hugging Face
login()  # Use the token you just received

# Initialize the API
api = HfApi()

try:
    # Create a new repo (if it doesn't exist)
    create_repo(
        repo_id="mmannan17/mindsync",
        repo_type="model",
        exist_ok=True  # Won't fail if repo already exists
    )
    
    print("Repository created/verified successfully!")

    # Upload the GNN model
    print("Uploading CustomGNN model...")
    api.upload_file(
        path_or_fileobj="./trained_customGNN.pth",
        path_in_repo="trained_customGNN.pth",
        repo_id="mmannan17/mindsync"
    )
    
    # Upload the PersonalityLM directory
    print("Uploading PersonalityLM directory...")
    for root, dirs, files in os.walk("trained_PersonalityLM_best"):
        for file in files:
            local_path = os.path.join(root, file)
            # Maintain the same directory structure in the repo
            repo_path = os.path.join(
                "trained_PersonalityLM_best",
                os.path.relpath(local_path, "trained_PersonalityLM_best")
            )
            print(f"Uploading {repo_path}...")
            api.upload_file(
                path_or_fileobj=local_path,
                path_in_repo=repo_path,
                repo_id="mmannan17/mindsync"
            )
    
    # Create a model card (README.md) with basic information
    model_card = """---
language: en
tags:
- mindsync
- personality-model
- gnn
license: mit
---

# Mindsync Inference Models

This repository contains two main components:

1. CustomGNN Model (`trained_customGNN_best.pth`)
2. PersonalityLM Model (`trained_PersonalityLM_best/`)

## Model Description

This repository contains two main components:

1. CustomGNN Model (`trained_customGNN_best.pth`)
2. PersonalityLM Model (`trained_PersonalityLM_best/`)

## Usage

These models are designed for inference in the Mindsync application.

## Loading the Models

```python
from huggingface_hub import hf_hub_download, snapshot_download

# Download GNN model
gnn_path = hf_hub_download(
    repo_id="mmannan17/mindsync",
    filename="trained_customGNN.pth"
)

# Download PersonalityLM
personality_lm_path = snapshot_download(
    repo_id="mmannan17/mindsync",
    allow_patterns="trained_PersonalityLM_best/**"
)
```
"""

    # Upload the model card
    with open("README.md", "w", encoding="utf-8") as f:
        f.write(model_card)
    
    api.upload_file(
        path_or_fileobj="README.md",
        path_in_repo="README.md",
        repo_id="mmannan17/mindsync"
    )
    
    print("\nUpload completed successfully!")
    print("Your models are now available at: https://huggingface.co/mmannan17/mindsync")
    
except Exception as e:
    print(f"An error occurred: {str(e)}")