#!/bin/bash

# Build the application
echo "Building application..."
npm run build

# Copy built frontend files to the location the server expects
echo "Moving built files to correct location..."
cp -r dist/public ./public

echo "Deployment build complete!"
echo "Built files are now in the 'public' directory where the server expects them."