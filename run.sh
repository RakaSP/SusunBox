#!/bin/bash
source ./backend/solver/susunbox_venv/bin/activate

cd backend
node server.js &
background_pid1=$!

cd ../frontend
pwd
npm run start

cleanup() {
    echo "Cleaning up..."
    kill $background_pid1
}

trap cleanup EXIT

echo "Exiting..."