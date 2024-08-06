#!/bin/bash
cd backend
node server.js &
cd ../frontend
npm start &

echo "Setup done!"