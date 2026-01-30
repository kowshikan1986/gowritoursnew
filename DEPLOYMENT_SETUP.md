# CI/CD Deployment Setup Guide

This guide will help you set up automatic deployment to your remote server (172.86.91.5) using GitHub Actions.

## Prerequisites

1. **Git Repository**: Your code must be in a GitHub repository
2. **SSH Access**: Root access to server at 172.86.91.5
3. **Server Software**: 
   - For Standard Deployment: Node.js 22+, npm, PM2, git
   - For Docker Deployment: Docker, git

## Step 1: Generate SSH Key (If you don't have one)

On your local machine, run:

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy
```

This creates two files:
- `~/.ssh/github_deploy` (private key)
- `~/.ssh/github_deploy.pub` (public key)

## Step 2: Add SSH Key to Remote Server

Copy your public key to the server:

```bash
ssh-copy-id -i ~/.ssh/github_deploy.pub root@172.86.91.5
```

Or manually:
```bash
ssh root@172.86.91.5
mkdir -p ~/.ssh
chmod 700 ~/.ssh
nano ~/.ssh/authorized_keys
# Paste the contents of github_deploy.pub
chmod 600 ~/.ssh/authorized_keys
```

## Step 3: Configure GitHub Secrets

Go to your GitHub repository:
1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret** and add:

### Required Secrets:

- **Name**: `SERVER_HOST`  
  **Value**: `172.86.91.5`

- **Name**: `SERVER_USER`  
  **Value**: `root`

- **Name**: `SSH_PRIVATE_KEY`  
  **Value**: The entire contents of your private key file (`~/.ssh/github_deploy`)
  
  ```bash
  # On Windows PowerShell:
  Get-Content ~/.ssh/github_deploy | clip
  
  # On Linux/Mac:
  cat ~/.ssh/github_deploy | pbcopy
  # or
  cat ~/.ssh/github_deploy
  ```

- **Name**: `REPO_URL`  
  **Value**: Your repository URL (e.g., `https://github.com/yourusername/yourrepo.git`)
  
  Or use SSH format: `git@github.com:yourusername/yourrepo.git`

## Step 4: Prepare Remote Server

### Option A: Standard Deployment (with PM2)

SSH into your server:

```bash
ssh root@172.86.91.5
```

Install required software:

```bash
# Install Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs

# Install PM2 globally
npm install -g pm2

# Setup PM2 to start on boot
pm2 startup
pm2 save

# Install git if not already installed
apt-get install -y git
```

### Option B: Docker Deployment

SSH into your server:

```bash
ssh root@172.86.91.5
```

Install Docker:

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Start Docker
systemctl start docker
systemctl enable docker

# Install git if not already installed
apt-get install -y git
```

## Step 5: Choose Your Deployment Method

Two deployment workflows are available:

### 1. Standard Deployment (`.github/workflows/deploy.yml`)
- Uses PM2 process manager
- Faster builds
- Good for simple deployments

### 2. Docker Deployment (`.github/workflows/deploy-docker.yml`)
- Containerized application
- Better isolation
- Consistent environment

**To use one method exclusively:**
- Delete the workflow file you don't want to use
- Or disable it in GitHub Actions settings

## Step 6: Push and Deploy

1. Commit your changes:
```bash
git add .
git commit -m "Add CI/CD pipeline"
git push origin main
```

2. Watch the deployment:
   - Go to your GitHub repository
   - Click **Actions** tab
   - Watch the deployment workflow run

## Step 7: Verify Deployment

SSH into your server:

```bash
ssh root@172.86.91.5
```

### For Standard Deployment:
```bash
pm2 list
pm2 logs luxury-travel-agency
curl http://localhost:3000
```

### For Docker Deployment:
```bash
docker ps
docker logs luxury-travel-agency
curl http://localhost:3000
```

## Troubleshooting

### SSH Connection Issues
```bash
# Test SSH connection locally
ssh -i ~/.ssh/github_deploy root@172.86.91.5
```

### View Deployment Logs
- Go to GitHub **Actions** tab
- Click on the failed workflow
- Expand the steps to see error details

### Server Issues

```bash
# Check if port 3000 is in use
netstat -tlnp | grep 3000

# Check firewall
ufw status
ufw allow 3000

# For PM2:
pm2 restart luxury-travel-agency

# For Docker:
docker logs luxury-travel-agency
docker restart luxury-travel-agency
```

### Manual Deployment

If automatic deployment fails, you can deploy manually:

```bash
ssh root@172.86.91.5
cd /root/gowritoursjava
git pull origin main
cd luxury-travel-agency
npm install --legacy-peer-deps
npm run build
pm2 restart luxury-travel-agency
```

## Environment Variables

If your application needs environment variables:

### For PM2:
Create an `ecosystem.config.js` file:

```javascript
module.exports = {
  apps: [{
    name: 'luxury-travel-agency',
    script: 'server-json.js',
    cwd: '/root/gowritoursjava/luxury-travel-agency',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      // Add more environment variables here
    }
  }]
}
```

### For Docker:
Create a `.env` file or modify the docker run command in the workflow.

## Security Recommendations

1. **Never commit sensitive data** (passwords, API keys) to git
2. **Use GitHub Secrets** for all sensitive configuration
3. **Change default SSH port** (edit `/etc/ssh/sshd_config`)
4. **Setup firewall rules**:
   ```bash
   ufw enable
   ufw allow 22
   ufw allow 3000
   ```
5. **Consider using SSH key with passphrase**
6. **Regular security updates**:
   ```bash
   apt update && apt upgrade -y
   ```

## Next Steps

- Set up domain and reverse proxy (Nginx)
- Configure SSL with Let's Encrypt
- Set up monitoring and alerts
- Configure database backups
- Add staging environment

## Support

If you encounter issues:
1. Check GitHub Actions logs
2. Check server logs: `pm2 logs` or `docker logs luxury-travel-agency`
3. Verify all GitHub secrets are set correctly
4. Ensure SSH key has correct permissions
