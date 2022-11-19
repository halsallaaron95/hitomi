#install chrome for selenium
sudo apt update
sudo apt-get install chromium-chromedriver

#install miniconda
cd ~ || exit
wget "https://repo.anaconda.com/miniconda/Miniconda3-py39_4.12.0-Linux-x86_64.sh"
bash Miniconda3-py39_4.12.0-Linux-x86_64.sh

#create conda environment
source ~/.bashrc
conda create -n hitomi_fast python=3.9
conda activate hitomi_fast
