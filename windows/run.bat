@echo off
cd ..\frontend
start "" /b cmd /c "npm start"

cd ..\backend
start "" /b cmd /c "node server.js"

:: Wait for the user to close the batch file's Command Prompt window
echo Press any key to exit and stop the server...
pause

:: Kill all Command Prompt processes
taskkill /F /IM cmd.exe /T
