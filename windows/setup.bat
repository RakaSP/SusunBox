@echo off
start setup_venv.bat
cd ..\frontend
start npm install
cd ..\backend
npm install
