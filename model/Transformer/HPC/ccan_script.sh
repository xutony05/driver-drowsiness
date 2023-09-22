echo 'Start!'

#!/bin/bash
#SBATCH --account=def-snikan
#SBATCH --time=00:25:00
#SBARCH --n-task=1
#SBATCH --cpus-per-task=8
#SBATCH --mem-per-cpu=4G
#SBATCH --gpus=v100:1
#SBATCH --mail-user=yxu783@uwo.ca
#SBATCH --mail-type=FAIL

module load python

source ~/timesformer/bin/activate

python v5.0.1.py

echo 'Hello, world!'