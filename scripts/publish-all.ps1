# Publish all ShepLang packages to npm
# Must be run from project root

Write-Host "🚀 Publishing ShepLang packages to @goldensheepai..." -ForegroundColor Green

# Check if logged in
try {
    $whoami = npm whoami 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Not logged in to npm. Run: npm login" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Logged in as: $whoami" -ForegroundColor Green
} catch {
    Write-Host "❌ Not logged in to npm. Run: npm login" -ForegroundColor Red
    exit 1
}

# Build all packages first
Write-Host ""
Write-Host "📦 Building all packages..." -ForegroundColor Yellow
Set-Location sheplang
pnpm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..
Write-Host "✅ Build successful" -ForegroundColor Green

# Publish in dependency order
Write-Host ""
Write-Host "📤 Publishing packages..." -ForegroundColor Yellow
Write-Host ""

Write-Host "1️⃣ Publishing @goldensheepai/sheplang-language..." -ForegroundColor Cyan
Set-Location sheplang/packages/language
npm publish --access public
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to publish sheplang-language" -ForegroundColor Red
    Set-Location ../../..
    exit 1
}
Write-Host "✅ Published sheplang-language" -ForegroundColor Green
Set-Location ../../..

Write-Host ""
Write-Host "2️⃣ Publishing @goldensheepai/sheplang-to-boba..." -ForegroundColor Cyan
Set-Location adapters/sheplang-to-boba
npm publish --access public
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to publish sheplang-to-boba" -ForegroundColor Red
    Set-Location ../..
    exit 1
}
Write-Host "✅ Published sheplang-to-boba" -ForegroundColor Green
Set-Location ../..

Write-Host ""
Write-Host "3️⃣ Publishing @goldensheepai/sheplang-compiler..." -ForegroundColor Cyan
Set-Location sheplang/packages/compiler
npm publish --access public
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to publish sheplang-compiler" -ForegroundColor Red
    Set-Location ../../..
    exit 1
}
Write-Host "✅ Published sheplang-compiler" -ForegroundColor Green
Set-Location ../../..

Write-Host ""
Write-Host "4️⃣ Publishing @goldensheepai/sheplang..." -ForegroundColor Cyan
Set-Location sheplang/packages/cli
npm publish --access public
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to publish sheplang CLI" -ForegroundColor Red
    Set-Location ../../..
    exit 1
}
Write-Host "✅ Published sheplang CLI" -ForegroundColor Green
Set-Location ../../..

Write-Host ""
Write-Host "🎉 All packages published successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Verify at: https://www.npmjs.com/settings/goldensheepai/packages" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔗 Package URLs:" -ForegroundColor Yellow
Write-Host "   • https://www.npmjs.com/package/@goldensheepai/sheplang-language"
Write-Host "   • https://www.npmjs.com/package/@goldensheepai/sheplang-to-boba"
Write-Host "   • https://www.npmjs.com/package/@goldensheepai/sheplang-compiler"
Write-Host "   • https://www.npmjs.com/package/@goldensheepai/sheplang"
Write-Host ""
Write-Host "✨ Anyone can now install: npm install -g @goldensheepai/sheplang" -ForegroundColor Magenta
