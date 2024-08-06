#!/bin/bash
sudo apt-get install python3
sudo apt-get install python3-pip
sudo apt-get install python3-venv
sudo apt-get install python3-virtualenv
cd backend/solver
virtualenv -p python3 susunbox_venv

source ./susunbox_venv/bin/activate
pip install numpyencoder
pip install matplotlib
pip install numba
pip install fpdf2


sudo apt-get install nodejs -y
sudo apt-get install npm -y

echo "Setup done!"