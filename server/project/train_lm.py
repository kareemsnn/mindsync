import os
import random
import numpy as np
import torch
from datasets import load_dataset
from transformers import (
    AutoTokenizer, 
    AutoModelForSequenceClassification, 
    Trainer, 
    TrainingArguments, 
    DataCollatorWithPadding
)
import evaluate
import logging

# -------------------------
# Setup logging to output to console.
# -------------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("finetune_logger")

# -------------------------
# Set random seeds for reproducibility
# -------------------------
def set_seeds(seed=42):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)
    logger.info(f"Random seeds set to {seed}")

set_seeds(42)

# -------------------------
# Dataset Preprocessing
#
# The dataset (jingjietan/essays-big5) contains columns:
#   "O", "C", "E", "A", "N" (as strings) along with "text".
# We will convert these columns to floats and use them as regression targets.
# -------------------------
logger.info("Loading dataset 'jingjietan/essays-big5'...")
dataset = load_dataset("jingjietan/essays-big5")
# We combine train and validation splits for training; test can be reserved for later evaluation.
label_columns = ["O", "C", "E", "A", "N"]

# -------------------------
# Preprocess function tokenizes text and converts personality labels from string to float.
# -------------------------
model_name = "KevSun/Personality_LM"
tokenizer = AutoTokenizer.from_pretrained(model_name)

def preprocess_function(examples):
    # Tokenize the text field.
    tokenized = tokenizer(examples["text"], padding="max_length", truncation=True, max_length=256)
    labels = []
    # Since batched=True, 'examples' is a dict mapping column names to lists.
    for i in range(len(examples["text"])):
        # Convert each label from string to float. This assumes that each label value is convertible.
        label = [float(examples[col][i]) for col in label_columns]
        labels.append(label)
    tokenized["labels"] = labels
    return tokenized

logger.info("Tokenizing dataset...")
tokenized_datasets = dataset.map(preprocess_function, batched=True)

# -------------------------
# Load and configure the model for regression.
#
# Decisions & Tradeoffs:
# - We're using KevSun/Personality_LM with a regression head by setting problem_type to "regression" 
#   and num_labels=5 to directly output 5 continuous values.
# - With only about 2,467 examples in total, overfitting is a risk; therefore, we use a modest number of epochs (3)
#   and a low learning rate (2e-5) with weight decay.
# -------------------------
logger.info("Loading model and setting up for regression fine-tuning...")
model = AutoModelForSequenceClassification.from_pretrained(
    model_name,
    num_labels=5,
    problem_type="regression"
)

# -------------------------
# Define TrainingArguments and the Trainer.
#
# Decisions & Tradeoffs:
# - The number of epochs is set low (3) to avoid overfitting on a small dataset.
# - A low learning rate (2e-5) ensures that updates are subtle.
# - Weight decay is included for additional regularization.
# - Evaluation and checkpointing are performed each epoch to save the best model.
# -------------------------
training_args = TrainingArguments(
    output_dir="./results",
    eval_strategy="epoch",
    save_strategy="epoch",
    load_best_model_at_end=True,
    metric_for_best_model="mse",
    greater_is_better=False,
    learning_rate=2e-5,
    per_device_train_batch_size=16,
    per_device_eval_batch_size=16,
    num_train_epochs=3,
    weight_decay=0.01,
    logging_dir='./logs',
    logging_steps=50,
    save_total_limit=2,
)

# Load the mean squared error metric for evaluation.
mse_metric = evaluate.load("mse")

def compute_metrics(eval_pred):
    predictions, labels = eval_pred
    # Convert predictions and labels to numpy arrays with float32 type (if they are not already)
    predictions = np.array(predictions, dtype=np.float32)
    labels = np.array(labels, dtype=np.float32)
    # Calculate Mean Squared Error across all elements (flatten the arrays)
    mse = ((predictions - labels) ** 2).mean()
    return {"mse": mse}


data_collator = DataCollatorWithPadding(tokenizer)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_datasets["train"],
    eval_dataset=tokenized_datasets["validation"],
    compute_metrics=compute_metrics,
    data_collator=data_collator,
)

# -------------------------
# Fine-tuning the model.
# -------------------------
logger.info("Starting fine-tuning...")
train_result = trainer.train()
trainer.save_model("trained_PersonalityLM_best")
logger.info("Fine-tuning complete. Best model saved as 'trained_PersonalityLM_best'")
eval_results = trainer.evaluate()
logger.info(f"Evaluation results: {eval_results}")

# The best model is now saved and can be used for inference.
