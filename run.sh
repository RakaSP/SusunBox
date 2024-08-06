#!/bin/bash
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