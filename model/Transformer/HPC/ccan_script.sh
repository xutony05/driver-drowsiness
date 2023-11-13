#!/bin/bash
#SBATCH --account=def-snikan
#SBATCH --time=0-00:10:00
#SBARCH --n-task=1
#SBATCH --cpus-per-task=4
#SBATCH --mem-per-cpu=16G
#SBATCH --gpus=a100:1
#SBATCH --mail-user=yxu783@uwo.ca
#SBATCH --mail-type=FAIL

module load python

source ~/myenv/bin/activate

python -u v5.0.1.py
