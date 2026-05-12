#!/bin/bash

BACKEND_URL="https://easebrain-backend.onrender.com"

echo "🧪 Testing EaseBrain deployment..."

# Test health endpoint
echo "📊 Testing health endpoint..."
curl -s "$BACKEND_URL/api/health" | jq .

# Test API root
echo "📊 Testing API root..."
curl -s "$BACKEND_URL/api" | jq .

# Test documentation
echo "📊 Testing API documentation..."
curl -s "$BACKEND_URL/api/docs" | head -20

echo "✅ Tests completed!"
