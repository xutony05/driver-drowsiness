#!/bin/bash
#SBATCH -A def-snikan
#SBATCH --time 0-00:05:00
#SBARCH --n-task=1
#SBATCH --cpus-per-task=8
#SBATCH --mem-per-cpu=4G
#SBATCH --gpus=v100:0
#SBATCH --mail-user=yxu783@uwo.ca
#SBATCH --mail-type=FAIL

source $HOME/timesformer/bin/activate

python v5.0.1/py