#!/bin/sh

# Change directory to /app/src
echo "Changing directory to /app/src"
cd /app/src

# Run Sequelize migrations
echo "Running Sequelize migrations..."
npx sequelize-cli db:migrate

# Return to the parent directory
echo "Returning to the parent directory"
cd ..

# Start the Node.js server
echo "Starting the Node.js server..."
node index.js
