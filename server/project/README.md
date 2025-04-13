---
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
