#!/bin/bash
#SBATCH -A def-snikan
#SBATCH --time 0-00:10:00
#SBARCH --n-task=1
#SBATCH --cpus-per-task=8
#SBATCH --mem-per-cpu=4G
#SBATCH --gpus=v100:1

source $HOME/timesformer/bin/activate

python v5.0.1/py