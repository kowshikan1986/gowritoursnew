# GitHub Secrets Setup

Go to: https://github.com/kowshikan1986/gowritoursnew/settings/secrets/actions

Click "New repository secret" and add these 3 secrets:

## Secret 1: SERVER_HOST
```
172.86.91.5
```

## Secret 2: SERVER_USER
```
root
```

## Secret 3: SSH_PRIVATE_KEY

Run this command to get your private key:
```powershell
Get-Content "$env:USERPROFILE\.ssh\github_deploy"
```

Or this command to copy it to clipboard:
```powershell
Get-Content "$env:USERPROFILE\.ssh\github_deploy" | Set-Clipboard
```

Then paste the ENTIRE key (including BEGIN and END lines) as the secret value.

---

## After adding secrets, deploy by pushing code:

```powershell
git add .
git commit -m "Setup CI/CD for port 4000"
git push origin main
```

Your app will be available at: **http://172.86.91.5:4000**

## Monitor deployment:
- Watch GitHub Actions: https://github.com/kowshikan1986/gowritoursnew/actions
- SSH to server: `ssh root@172.86.91.5`
- Check PM2: `pm2 list` and `pm2 logs luxury-travel-agency`
