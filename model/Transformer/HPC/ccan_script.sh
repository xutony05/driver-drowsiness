#!/bin/bash
#SBATCH --account=def-snikan
#SBATCH --time=0-23:00:00
#SBARCH --n-task=1
#SBATCH --cpus-per-task=8
#SBATCH --mem-per-cpu=16G
#SBATCH --gpus=v100:1
#SBATCH --mail-user=yxu783@uwo.ca
#SBATCH --mail-type=FAIL

module load python

source ~/timesformer/bin/activate

python v5.0.1.py
