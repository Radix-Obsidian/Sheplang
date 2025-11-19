# Unpublish broken packages from npm
# WARNING: Only works within 72 hours of publishing

Write-Host "⚠️  UNPUBLISHING broken packages from @goldensheepai..." -ForegroundColor Yellow
Write-Host ""

# Unpublish in reverse order (CLI first, dependencies last)
Write-Host "1️⃣ Unpublishing @goldensheepai/sheplang..." -ForegroundColor Cyan
npm unpublish @goldensheepai/sheplang@0.1.3 --force
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Unpublished sheplang CLI" -ForegroundColor Green
} else {
    Write-Host "⚠️  Failed to unpublish sheplang CLI (may be already gone)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "2️⃣ Unpublishing @goldensheepai/sheplang-compiler..." -ForegroundColor Cyan
npm unpublish @goldensheepai/sheplang-compiler@0.1.0 --force
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Unpublished sheplang-compiler" -ForegroundColor Green
} else {
    Write-Host "⚠️  Failed to unpublish sheplang-compiler" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "3️⃣ Unpublishing @goldensheepai/sheplang-to-boba..." -ForegroundColor Cyan
npm unpublish @goldensheepai/sheplang-to-boba@0.1.3 --force
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Unpublished sheplang-to-boba" -ForegroundColor Green
} else {
    Write-Host "⚠️  Failed to unpublish sheplang-to-boba" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "4️⃣ Unpublishing @goldensheepai/sheplang-language..." -ForegroundColor Cyan
npm unpublish @goldensheepai/sheplang-language@0.1.3 --force
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Unpublished sheplang-language" -ForegroundColor Green
} else {
    Write-Host "⚠️  Failed to unpublish sheplang-language" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Unpublish complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Run: .\scripts\publish-all-pnpm.ps1" -ForegroundColor Cyan
Write-Host "2. Test installation works" -ForegroundColor Cyan
