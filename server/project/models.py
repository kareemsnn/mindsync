import torch.nn as nn
import torch.optim as optim
from torch_geometric.data import Data
from torch_geometric.nn import GATv2Conv
from transformers import pipeline
import torch.nn.functional as F
from fastapi import HTTPException
from sklearn.metrics.pairwise import cosine_similarity
from deap import base, creator, tools, algorithms
import numpy as np
import random
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification, TextClassificationPipeline




# GNN is used to gain global context after a KNN step.
# Using GATv2 from torch_geometric.
# input_size represents the size of the embedding (e.g., 768 from BERT),
# hidden_size is the intermediate dimension set to 512 to not dilute the embedding too much
# and output_size represents the size of the aggregated/refined embedding.
# Shallow structure to avoid overfitting.


class customGNN(nn.Module):
    def __init__(self, input_size=768, hidden_size=768, num_layers=4, output_size=768):
        super(customGNN, self).__init__()
        
        self.dropout = nn.Dropout(0.2)  # Add dropout
        self.conv1 = GATv2Conv(input_size, hidden_size, heads=4)
        self.conv2 = GATv2Conv(hidden_size * 4, hidden_size, heads=4)
        self.conv3 = GATv2Conv(hidden_size * 4, hidden_size, heads=4)
        self.conv4 = GATv2Conv(hidden_size * 4, output_size, heads=1)

    def forward(self, data):
        x, edge_index = data.x, data.edge_index
        x = self.conv1(x, edge_index)
        x = F.elu(x)
        x = self.dropout(x)  # Add dropout after activation
        x = self.conv2(x, edge_index)
        x = F.elu(x)
        x = self.dropout(x)
        x = self.conv3(x, edge_index)
        x = F.elu(x)
        x = self.dropout(x)
        x = self.conv4(x, edge_index)
        return x


# PSYCHBERT: Classification model based on the PsychBERT paper.
# Uses the Hugging Face model mnaylor/psychbert-cased to perform
# personality or mood-related text classification.


"https://arxiv.org/abs/2406.16223" 
trait_names = ["agreeableness", "openness", "conscientiousness", "extraversion", "neuroticism"]


class PSYCHBERT:
    def __init__(self):
        try:
            # Load the locally trained model
            model = AutoModelForSequenceClassification.from_pretrained("trained_PersonalityLM_best")
            tokenizer = AutoTokenizer.from_pretrained("KevSun/Personality_LM")  # Still use the base tokenizer
            
            self.model = model
            self.tokenizer = tokenizer
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to load PsychBERT model: {e}")
    
    def classify_personality(self, text: str):
        """
        Classify a single piece of text and return personality scores.
        """
        try:
            # Tokenize the input text
            inputs = self.tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=256)
            
            # Get model predictions
            with torch.no_grad():
                outputs = self.model(**inputs)
                predictions = outputs.logits.squeeze()
            
            # Convert predictions to personality scores
            scores = predictions.numpy()
            
            # Create results dictionary mapping traits to scores
            results = {
                trait: float(score) 
                for trait, score in zip(["O", "C", "E", "A", "N"], scores)
            }
            
            return results
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error during classification: {e}")

    def aggregate_classification(self, texts: list, weights: list = None):
        try:
            if not texts:
                raise HTTPException(status_code=400, detail="No texts provided for classification.")
            
            # Get predictions for all texts
            all_scores = []
            for text in texts:
                result = self.classify_personality(text)
                scores = [result[trait] for trait in ["O", "C", "E", "A", "N"]]
                all_scores.append(scores)
            
            # Convert to numpy array for easier manipulation
            all_scores = np.array(all_scores)
            
            # Apply weights if provided
            if weights:
                weights = np.array(weights).reshape(-1, 1)
                weighted_scores = all_scores * weights
                final_scores = weighted_scores.sum(axis=0) / weights.sum()
            else:
                final_scores = all_scores.mean(axis=0)
            
            # Create final results
            aggregated_result = {
                trait: float(f"{score:.4f}")
                for trait, score in zip(["O", "C", "E", "A", "N"], final_scores)
            }
            
            return {"personality_results": aggregated_result}
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error during aggregation: {e}")


# GeneticAlgorithm: Uses a genetic algorithm to partition users into groups
# based on their refined embeddings. The goal is to maximize intra-group cohesion.

class GeneticAlgorithm:
    def __init__(self, NUsers, embeddings, embedding_size=768, minK=3, maxK=5):
        self.N_USERS = NUsers  # Number of users
        self.embedding_size = embedding_size
        self.MIN_GROUP_SIZE = minK  # dynamic range for group size
        self.MAX_GROUP_SIZE = maxK  
        
        # estimate number of groups based on average desired group size
        self.NUM_GROUPS = int(np.ceil(NUsers / ((minK + maxK) / 2)))
        #  cosine similarity matrix for all users
        self.s = cosine_similarity(embeddings)
        
        # DEAP genetic algorithm types.
        # Avoid duplicate creation if already exists.
        try:
            creator.create("FitnessMax", base.Fitness, weights=(1.0,))
        except Exception:
            pass
        try:
            creator.create("Individual", list, fitness=creator.FitnessMax)
        except Exception:
            pass
        
        self.toolbox = base.Toolbox()
        # Attribute generator: assign a random group id between 0 and NUM_GROUPS - 1.
        self.toolbox.register("attr_group", random.randint, 0, self.NUM_GROUPS - 1)
        # Individual: a list of group assignments for each user.
        self.toolbox.register("individual", tools.initRepeat, creator.Individual, 
                              self.toolbox.attr_group, n=self.N_USERS)
        # Population is a list of individuals.
        self.toolbox.register("population", tools.initRepeat, list, self.toolbox.individual)
        
        # Register GA operators.
        self.toolbox.register("evaluate", self.evaluate_individual)
        self.toolbox.register("mate", tools.cxUniform, indpb=0.1)  # Uniform crossover
        self.toolbox.register("mutate", tools.mutUniformInt, low=0, up=self.NUM_GROUPS - 1, indpb=0.1)
        self.toolbox.register("select", tools.selTournament, tournsize=3)
    
    def evaluate_individual(self, individual):
        
        # Evaluate an individual's fitness based on intra-group cohesion and penalties.
        # Each group in the individual is evaluated by computing the average pairwise cosine similarity.
        # Penalties are added for groups that violate the size constraints.
       
        groups = {}
        # Group user indices by their assigned group id.
        for idx, group_id in enumerate(individual):
            groups.setdefault(group_id, []).append(idx)
        
        total_score = 0.0
        penalty = 0.0
        
        # Evaluate each group.
        for group_id, indices in groups.items():
            size = len(indices)
            if size < self.MIN_GROUP_SIZE:
                penalty += (self.MIN_GROUP_SIZE - size) * 0.1  # Penalty for too small groups.
            if size > self.MAX_GROUP_SIZE:
                penalty += (size - self.MAX_GROUP_SIZE) * 0.1  # Penalty for too large groups.
            
            if size > 1:
                # Extract submatrix for group similarities.
                group_sim = self.s[np.ix_(indices, indices)]
                # Zero the diagonal to ignore self-similarity.
                np.fill_diagonal(group_sim, 0)
                num_pairs = size * (size - 1)
                avg_sim = group_sim.sum() / num_pairs
                total_score += avg_sim
            else:
                total_score += 0.0  # Single-user groups contribute little.
        
        fitness = total_score - penalty
        return (fitness,)
    
    def run_genetic_algorithm(self, pop_size=50, n_gen=40):
        """
         genetic algorithm to tweak group assignments.
        returns the best individual group assignments
        """
        population = self.toolbox.population(n=pop_size)
        
       
        stats = tools.Statistics(lambda ind: ind.fitness.values)
        stats.register("avg", np.mean)
        stats.register("max", np.max)
        
        #  GA using eaSimple.
        population, logbook = algorithms.eaSimple(
            population,
            self.toolbox,
            cxpb=0.5,  
            mutpb=0.2, 
            ngen=n_gen,
            stats=stats,
            verbose=True
        )
        
        best_ind = tools.selBest(population, k=1)[0]
        return best_ind, logbook
