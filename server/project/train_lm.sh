#!/bin/bash -l
#SBATCH --job-name=finetune-LM
#SBATCH --mem=120GB
#SBATCH --cpus-per-task=4
#SBATCH --gpus-per-task=1
#SBATCH --nodes=1
#SBATCH --ntasks=1
#SBATCH -p general
#SBATCH --mail-user=mannan2@usf.edu
#SBATCH --mail-type=BEGIN,END,FAIL,REQUEUE
#SBATCH --output=finetune_%j.out
#SBATCH --error=finetune_%j.err

# Set the PYTHONPATH to the current directory
export PYTHONPATH=$(pwd)

# Activate the conda environment
source /home/m/mannan2/hckth/mindsync/server/project/venv/bin/activate

# Run the fine-tuning script
srun --ntasks=1 --cpus-per-task=4 --mem=120GB --gpus-per-task=1 --exact \
python train_lm.py
