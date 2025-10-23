#!/bin/bash

# Stop existing MongoDB container
docker stop ssmail-mongodb 2>/dev/null || true
docker rm ssmail-mongodb 2>/dev/null || true

# Start MongoDB without authentication
docker run -d \
  --name ssmail-mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_DATABASE=stormysecuritynosql \
  mongo:latest --noauth

echo "MongoDB started without authentication on port 27017"
echo "Database: stormysecuritynosql"