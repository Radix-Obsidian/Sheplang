# Check if ShepLang extension is live on marketplace
Write-Host "🔍 Checking VS Code Marketplace..." -ForegroundColor Cyan
Write-Host ""

$extensionId = "GoldenSheepAI.sheplang-vscode"
$maxAttempts = 10
$attempt = 1

while ($attempt -le $maxAttempts) {
    Write-Host "[$attempt/$maxAttempts] Checking marketplace..." -ForegroundColor Yellow
    
    # Try to install from marketplace
    $output = code --install-extension $extensionId 2>&1
    
    if ($output -match "successfully installed") {
        Write-Host ""
        Write-Host "✅ SUCCESS! Extension is LIVE on marketplace!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📦 Extension URL:" -ForegroundColor Cyan
        Write-Host "https://marketplace.visualstudio.com/items?itemName=$extensionId"
        Write-Host ""
        Write-Host "🚀 Ready to announce!" -ForegroundColor Green
        break
    }
    
    if ($attempt -eq $maxAttempts) {
        Write-Host ""
        Write-Host "⏰ Still propagating after $maxAttempts attempts." -ForegroundColor Yellow
        Write-Host "Check manually: https://marketplace.visualstudio.com/items?itemName=$extensionId"
        break
    }
    
    Write-Host "   Not yet available. Waiting 60 seconds..." -ForegroundColor Gray
    Start-Sleep -Seconds 60
    $attempt++
}
