##mount the disk if needed
#mkdir -p /volume_16756
#ls /dev/disk/by-id/
#mkfs.ext4 -F /dev/disk/by-id/scsi-0BUYVM_SLAB_VOLUME-16756
#mount -o discard,defaults /dev/disk/by-id/scsi-0BUYVM_SLAB_VOLUME-16756 /volume_16756
#echo "/dev/disk/by-id/scsi-0BUYVM_SLAB_VOLUME-16756 /volume_16756 ext4 defaults 0 0" >>/etc/fstab
#chmod -R 777 /volume_16756/

##create user if needed
#sudo useradd hitomi_fast
#sudo passwd hitomi_fast
#sudo usermod -aG sudo hitomi_fast
#sudo mkhomedir_helper hitomi_fast

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
