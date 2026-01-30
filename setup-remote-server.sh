#!/bin/bash

# Setup script for remote server (172.86.91.5)
# Run this script on your remote server after SSH login
# Usage: bash setup-remote-server.sh [pm2|docker]

set -e

DEPLOYMENT_TYPE=${1:-pm2}
SERVER_IP="172.86.91.5"
REPO_URL="https://github.com/kowshikan1986/gowritoursnew.git"
PROJECT_DIR="/root/gowritoursjava"
APP_NAME="luxury-travel-agency"

echo "=========================================="
echo "Remote Server Setup Script"
echo "Server: $SERVER_IP"
echo "Deployment Type: $DEPLOYMENT_TYPE"
echo "=========================================="
echo ""

# Update system
echo "📦 Updating system packages..."
apt-get update
apt-get upgrade -y

# Install essential tools
echo "🔧 Installing essential tools..."
apt-get install -y git curl wget build-essential

if [ "$DEPLOYMENT_TYPE" == "pm2" ]; then
    echo ""
    echo "=========================================="
    echo "Setting up PM2 Deployment"
    echo "=========================================="
    
    # Install Node.js 22
    echo "📦 Installing Node.js 22..."
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
    apt-get install -y nodejs
    
    # Verify installation
    echo "✅ Node version: $(node --version)"
    echo "✅ NPM version: $(npm --version)"
    
    # Install PM2 globally
    echo "📦 Installing PM2..."
    npm install -g pm2
    
    # Setup PM2 startup script
    echo "🚀 Setting up PM2 startup..."
    pm2 startup systemd -u root --hp /root
    
    # Clone repository
    if [ ! -d "$PROJECT_DIR" ]; then
        echo "📥 Cloning repository..."
        cd /root
        git clone $REPO_URL gowritoursjava
    else
        echo "📁 Repository already exists, pulling latest..."
        cd $PROJECT_DIR
        git pull origin main || git pull origin master
    fi
    
    # Install dependencies and build
    echo "📦 Installing dependencies..."
    cd $PROJECT_DIR/luxury-travel-agency
    npm install --legacy-peer-deps
    
    echo "🏗️ Building application..."
    npm run build
    
    # Create necessary directories
    echo "📁 Creating data directories..."
    mkdir -p $PROJECT_DIR/data
    mkdir -p $PROJECT_DIR/logs
    mkdir -p $PROJECT_DIR/luxury-travel-agency/public/uploads
    
    # Start application with PM2
    echo "🚀 Starting application..."
    pm2 start server-json.js --name $APP_NAME --max-memory-restart 512M
    
    # Save PM2 configuration
    pm2 save
    
    echo ""
    echo "✅ PM2 deployment setup completed!"
    echo ""
    echo "Commands:"
    echo "  pm2 list                    - List running apps"
    echo "  pm2 logs $APP_NAME          - View logs"
    echo "  pm2 restart $APP_NAME       - Restart app"
    echo "  pm2 stop $APP_NAME          - Stop app"
    echo "  pm2 monit                   - Monitor app"

elif [ "$DEPLOYMENT_TYPE" == "docker" ]; then
    echo ""
    echo "=========================================="
    echo "Setting up Docker Deployment"
    echo "=========================================="
    
    # Install Docker
    echo "🐳 Installing Docker..."
    if ! command -v docker &> /dev/null; then
        curl -fsSL https://get.docker.com -o get-docker.sh
        sh get-docker.sh
        rm get-docker.sh
    else
        echo "✅ Docker already installed"
    fi
    
    # Start and enable Docker
    systemctl start docker
    systemctl enable docker
    
    # Verify installation
    echo "✅ Docker version: $(docker --version)"
    
    # Clone repository
    if [ ! -d "$PROJECT_DIR" ]; then
        echo "📥 Cloning repository..."
        cd /root
        git clone $REPO_URL gowritoursjava
    else
        echo "📁 Repository already exists, pulling latest..."
        cd $PROJECT_DIR
        git pull origin main || git pull origin master
    fi
    
    # Create necessary directories
    echo "📁 Creating data directories..."
    mkdir -p $PROJECT_DIR/data
    mkdir -p $PROJECT_DIR/logs
    
    # Build Docker image
    echo "🏗️ Building Docker image..."
    cd $PROJECT_DIR
    docker build -t $APP_NAME:latest .
    
    # Stop and remove existing container
    echo "🔄 Cleaning up old containers..."
    docker stop $APP_NAME 2>/dev/null || true
    docker rm $APP_NAME 2>/dev/null || true
    
    # Run Docker container
    echo "🚀 Starting Docker container..."
    docker run -d \
        --name $APP_NAME \
        --restart unless-stopped \
        -p 4000:4000 \
        -v $PROJECT_DIR/data:/app/data \
        -v $PROJECT_DIR/logs:/app/logs \
        $APP_NAME:latest
    
    echo ""
    echo "✅ Docker deployment setup completed!"
    echo ""
    echo "Commands:"
    echo "  docker ps                      - List running containers"
    echo "  docker logs $APP_NAME          - View logs"
    echo "  docker logs -f $APP_NAME       - Follow logs"
    echo "  docker restart $APP_NAME       - Restart container"
    echo "  docker stop $APP_NAME          - Stop container"
    echo "  docker exec -it $APP_NAME sh   - Enter container shell"
else
    echo "❌ Invalid deployment type. Use 'pm2' or 'docker'"
    exit 1
fi

# Configure firewall
echo ""
echo "🔒 Configuring firewall..."
if command -v ufw &> /dev/null; then
    ufw allow 22
    ufw allow 4000
    ufw --force enable
    echo "✅ Firewall configured (ports 22, 4000 open)"
else
    echo "⚠️  UFW not installed. Please configure firewall manually."
fi

# Test application
echo ""
echo "🧪 Testing application..."
sleep 5
if curl -s http://localhost:4000 > /dev/null; then
    echo "✅ Application is running!"
else
    echo "⚠️  Application might not be running yet. Check logs."
fi

echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Your application should be accessible at:"
echo "  http://$SERVER_IP:4000"
echo ""
echo "Next steps:"
echo "  1. Test the application: curl http://localhost:3000"
echo "  2. Configure domain and SSL (optional)"
echo "  3. Push code to GitHub to trigger auto-deployment"
echo ""
