#!/bin/bash
set -e

echo "🚀 Setting up Nexus AI OS..."

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose not found. Please install Docker Compose first."
    exit 1
fi

# Create directories
mkdir -p files uploads

# Start services
echo "📦 Building and starting services..."
docker-compose up --build -d

echo "⏳ Waiting for database to be ready..."
sleep 10

echo "✅ Nexus AI OS is running!"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "📡 API:     http://localhost:8000"
echo "📊 API Docs: http://localhost:8000/docs"
echo ""
echo "🔑 Default user: user@nexus.local"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop:     docker-compose down"
