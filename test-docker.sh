#!/bin/bash

# Test Docker Build Script
# Run this before deploying to Easypanel

echo "🐳 Testing Docker Build for Easypanel..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check if .env.local exists
echo "📋 Step 1: Checking .env.local..."
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✓${NC} .env.local found"
else
    echo -e "${RED}✗${NC} .env.local not found!"
    echo "Create .env.local with required environment variables"
    exit 1
fi

# Step 2: Build Docker image
echo ""
echo "🔨 Step 2: Building Docker image..."
docker build -t capcut-pro:test . --no-cache

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Docker build successful"
else
    echo -e "${RED}✗${NC} Docker build failed!"
    exit 1
fi

# Step 3: Run container
echo ""
echo "🚀 Step 3: Starting container..."
docker-compose up -d

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Container started"
else
    echo -e "${RED}✗${NC} Failed to start container!"
    exit 1
fi

# Step 4: Wait for app to start
echo ""
echo "⏳ Step 4: Waiting for application to start..."
sleep 10

# Step 5: Health check
echo ""
echo "🏥 Step 5: Running health check..."
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)

if [ "$response" = "200" ]; then
    echo -e "${GREEN}✓${NC} Application is healthy (HTTP $response)"
else
    echo -e "${RED}✗${NC} Application health check failed (HTTP $response)"
    echo ""
    echo "📋 Container logs:"
    docker-compose logs --tail=50
    exit 1
fi

# Step 6: Show logs
echo ""
echo "📋 Step 6: Recent logs:"
docker-compose logs --tail=20

# Success
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✓ Docker test successful!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "🌐 Application is running at: http://localhost:3000"
echo ""
echo "📝 Next steps:"
echo "  1. Test the application in your browser"
echo "  2. Test checkout flow"
echo "  3. Check logs: docker-compose logs -f"
echo "  4. Stop: docker-compose down"
echo ""
echo "🚀 Ready to deploy to Easypanel!"
