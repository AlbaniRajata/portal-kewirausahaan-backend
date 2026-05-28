$ErrorActionPreference = "Stop"

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$reportDir = Join-Path $scriptRoot "reports"
$credentialsFile = Join-Path $scriptRoot "credentials.local.json"

if (-not (Test-Path $reportDir)) {
  New-Item -ItemType Directory -Path $reportDir | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$scenarios = @(
  "scenarios/01_load_test.js",
  "scenarios/02_stress_test.js"
)

foreach ($scenario in $scenarios) {
  $name = [System.IO.Path]::GetFileNameWithoutExtension($scenario)
  $jsonOut = Join-Path $reportDir "$name-$timestamp.json"
  $scenarioPath = Join-Path $scriptRoot $scenario

  Write-Host "Running $scenarioPath"
  $env:CREDENTIALS_FILE = $credentialsFile
  k6 run --summary-export $jsonOut $scenarioPath
}
