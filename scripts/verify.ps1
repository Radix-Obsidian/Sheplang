# ShepLang VERIFY Script
# Enforces "never-commit-unless-green" rule
# Single source of truth for regression checks

param(
  [string]$Example = "examples/todo.shep"
)

# Check PowerShell version
$PSVersionTable.PSVersion
if ($PSVersionTable.PSVersion.Major -lt 5) {
    Write-Output 'ERROR: PowerShell 5.1+ required'
    exit 1
}

# Warn if not PowerShell 7+
if ($PSVersionTable.PSVersion.Major -lt 7) {
    Write-Output 'WARNING: PowerShell 7+ recommended for best experience'
}

Write-Output '=== SHEPLANG VERIFY START ==='

# Change to sheplang directory (monorepo workspace)
$ShepLangRoot = Join-Path (Join-Path $PSScriptRoot ".." ) "sheplang"
Push-Location $ShepLangRoot

try {
  # 1. Build everything
  Write-Output '[1/5] Building all packages...'
  pnpm -w -r build
  if ($LASTEXITCODE -ne 0) { 
    throw "Build failed with exit code $LASTEXITCODE" 
  }
  Write-Output 'Build successful'

  # 2. Run all tests
  Write-Output '[2/5] Running all tests...'
  pnpm -w -r test --run
  if ($LASTEXITCODE -ne 0) { 
    throw "Unit tests failed with exit code $LASTEXITCODE" 
  }
  Write-Output 'Tests passed'

  # 3. Transpile example
  Write-Output '[3/5] Transpiling example app...'
  pnpm --filter @sheplang/cli exec sheplang build $Example
  if ($LASTEXITCODE -ne 0) { 
    throw "Transpile failed with exit code $LASTEXITCODE" 
  }
  Write-Output 'Transpile successful'

  # 4. Start dev server and validate preview
  Write-Output '[4/5] Starting dev server and validating preview...'
  $DevProcess = Start-Process pnpm -ArgumentList "--filter", "@sheplang/cli", "exec", "sheplang", "dev", $Example -PassThru -NoNewWindow
  Start-Sleep -Seconds 3

  try {
    $response = Invoke-WebRequest "http://localhost:8787/" -UseBasicParsing -TimeoutSec 5
    if ($response.Content -notmatch "<h1>MyTodos</h1>") { 
      throw "Preview validation failed - expected content not found" 
    }
    Write-Output 'Preview validated'
  }
  finally {
    # Clean up dev server
    if ($DevProcess -and !$DevProcess.HasExited) {
      Stop-Process -Id $DevProcess.Id -Force -ErrorAction SilentlyContinue
      Start-Sleep -Seconds 1
    }
  }

  # 5. Run Explain + Stats (sanity checks)
  Write-Output '[5/5] Running explain and stats...'
  pnpm --filter @sheplang/cli exec sheplang explain $Example
  if ($LASTEXITCODE -ne 0) { 
    Write-Output 'Explain command returned non-zero exit code (may not be implemented yet)'
  }
  
  pnpm --filter @sheplang/cli exec sheplang stats
  if ($LASTEXITCODE -ne 0) { 
    Write-Output 'Stats command returned non-zero exit code (may not be implemented yet)'
  }
  Write-Output 'Sanity checks complete'

  Write-Output ''
  Write-Output '=== VERIFY OK ==='
  exit 0
}
catch {
  $msg = $_.Exception.Message
  Write-Output ''
  Write-Output '=== VERIFY FAILED ==='
  Write-Output ('Error: ' + $msg)
  exit 1
}
finally {
  Pop-Location
}
