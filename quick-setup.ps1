# Quick Setup Script for CI/CD Pipeline
# Run this on your LOCAL machine (Windows)

$SERVER_IP = "172.86.91.5"
$SERVER_USER = "root"
$REPO_URL = "https://github.com/kowshikan1986/gowritoursnew.git"

Write-Host "=========================================="
Write-Host "CI/CD Pipeline Quick Setup" -ForegroundColor Cyan
Write-Host "Server: $SERVER_IP" -ForegroundColor Yellow
Write-Host "=========================================="
Write-Host ""

# Step 1: Generate SSH Key
Write-Host "Step 1: SSH Key Setup" -ForegroundColor Green
Write-Host "----------------------------------------"

$sshKeyPath = "$env:USERPROFILE\.ssh\github_deploy"

if (Test-Path $sshKeyPath) {
    Write-Host "✅ SSH key already exists at: $sshKeyPath" -ForegroundColor Green
    $createNew = Read-Host "Do you want to create a new key? (y/N)"
    if ($createNew -eq "y") {
        ssh-keygen -t ed25519 -C "github-deploy" -f $sshKeyPath -N '""'
    }
} else {
    Write-Host "Generating new SSH key..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.ssh" | Out-Null
    ssh-keygen -t ed25519 -C "github-deploy" -f $sshKeyPath -N '""'
    Write-Host "✅ SSH key generated" -ForegroundColor Green
}

Write-Host ""

# Step 2: Copy SSH key to server
Write-Host "Step 2: Copy SSH Key to Server" -ForegroundColor Green
Write-Host "----------------------------------------"
Write-Host "Copying public key to $SERVER_USER@$SERVER_IP..." -ForegroundColor Yellow

$publicKey = Get-Content "$sshKeyPath.pub"
$sshCommand = @"
mkdir -p ~/.ssh && chmod 700 ~/.ssh && echo '$publicKey' >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys && echo 'SSH key added successfully'
"@

ssh "$SERVER_USER@$SERVER_IP" $sshCommand

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ SSH key copied to server" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to copy SSH key. Please do it manually:" -ForegroundColor Red
    Write-Host "   ssh-copy-id -i $sshKeyPath.pub $SERVER_USER@$SERVER_IP"
}

Write-Host ""

# Step 3: Test SSH Connection
Write-Host "Step 3: Test SSH Connection" -ForegroundColor Green
Write-Host "----------------------------------------"
Write-Host "Testing SSH connection..." -ForegroundColor Yellow

ssh -i $sshKeyPath -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "echo 'SSH connection successful'"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ SSH connection working" -ForegroundColor Green
} else {
    Write-Host "❌ SSH connection failed" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 4: GitHub Secrets Setup
Write-Host "Step 4: Setup GitHub Secrets" -ForegroundColor Green
Write-Host "----------------------------------------"
Write-Host ""
Write-Host "You need to add these secrets to your GitHub repository:" -ForegroundColor Yellow
Write-Host "Go to: https://github.com/kowshikan1986/gowritoursnew/settings/secrets/actions" -ForegroundColor Cyan
Write-Host ""

Write-Host "SECRET 1: SERVER_HOST" -ForegroundColor White
Write-Host "Value: $SERVER_IP" -ForegroundColor Gray
Write-Host ""

Write-Host "SECRET 2: SERVER_USER" -ForegroundColor White
Write-Host "Value: $SERVER_USER" -ForegroundColor Gray
Write-Host ""

Write-Host "SECRET 3: SSH_PRIVATE_KEY" -ForegroundColor White
Write-Host "Value: (The content below - copy everything including BEGIN and END lines)" -ForegroundColor Gray
Write-Host "-------------------------------------------------------------------" -ForegroundColor DarkGray
Get-Content $sshKeyPath | Write-Host -ForegroundColor DarkYellow
Write-Host "-------------------------------------------------------------------" -ForegroundColor DarkGray
Write-Host ""

# Copy private key to clipboard
Get-Content $sshKeyPath | Set-Clipboard
Write-Host "✅ SSH private key copied to clipboard!" -ForegroundColor Green
Write-Host ""

# Step 5: Server Setup
Write-Host "Step 5: Server Setup" -ForegroundColor Green
Write-Host "----------------------------------------"
Write-Host ""
Write-Host "Choose deployment type:" -ForegroundColor Yellow
Write-Host "  1) PM2 (recommended for simple deployments)"
Write-Host "  2) Docker (recommended for production)"
Write-Host ""

$choice = Read-Host "Enter choice (1 or 2)"

$deployType = if ($choice -eq "2") { "docker" } else { "pm2" }

Write-Host ""
Write-Host "Setting up remote server with $deployType..." -ForegroundColor Yellow

# Upload setup script to server
$setupScript = Get-Content ".\setup-remote-server.sh" -Raw
ssh -i $sshKeyPath "$SERVER_USER@$SERVER_IP" "cat > /root/setup-remote-server.sh" -InputObject $setupScript
ssh -i $sshKeyPath "$SERVER_USER@$SERVER_IP" "chmod +x /root/setup-remote-server.sh && bash /root/setup-remote-server.sh $deployType"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Server setup completed" -ForegroundColor Green
} else {
    Write-Host "⚠️  Server setup had issues. Check the output above." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=========================================="
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "=========================================="
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Add the GitHub secrets shown above to your repository"
Write-Host "2. Push your code to trigger deployment:"
Write-Host "   git add ."
Write-Host "   git commit -m 'Setup CI/CD pipeline'"
Write-Host "   git push origin main"
Write-Host ""
Write-Host "3. Visit your app at: http://$SERVER_IP:4000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Need help? Check DEPLOYMENT_SETUP.md" -ForegroundColor Gray
Write-Host ""

Read-Host "Press Enter to exit"
