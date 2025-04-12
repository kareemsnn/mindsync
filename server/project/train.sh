#!/bin/bash -l
#SBATCH --job-name=train-gnn
#SBATCH --mem=120GB
#SBATCH --cpus-per-task=4
#SBATCH --gpus-per-task=1
#SBATCH --nodes=1
#SBATCH --ntasks=4
#SBATCH -p general
#SBATCH --mail-user=mannan2@usf.edu
#SBATCH --mail-type=BEGIN,END,FAIL,REQUEUE
#SBATCH --output=train-gnn_%j.out
#SBATCH --error=train-gnn_%j.err

# Set the PYTHONPATH to the current directory
export PYTHONPATH=$(pwd)

# Activate the virtual environment
source /home/m/mannan2/hckth/venv/bin/activate

# Define resource parameters
ntasks=1
cpus_per_task=4
mem_per_task=20GB
gpus_per_task=1
total_gpus=4

# Loop over available GPUs (0 to total_gpus - 1)
for ((i=0; i<total_gpus; i++)); do
  # Set the CUDA_VISIBLE_DEVICES to restrict each run to a specific GPU
  export CUDA_VISIBLE_DEVICES=$i
  srun --ntasks="$ntasks" --mem="$mem_per_task" --gpus="$gpus_per_task" --exact \
       python project/train.py &
done

wait