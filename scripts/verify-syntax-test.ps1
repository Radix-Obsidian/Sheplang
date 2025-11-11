# Simple test of PowerShell syntax
try {
    throw "Test error message"
}
catch {
    $msg = $_.Exception.Message
    Write-Output "ERROR: $msg"
}
