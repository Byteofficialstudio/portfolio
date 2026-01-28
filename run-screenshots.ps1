# run-screenshots.ps1
# Usage: Run this from project root in an elevated PowerShell if needed.
# It will run `npm install`, start a python HTTP server on port 8000,
# run the Puppeteer screenshot script (`npm run screenshot`) and then stop the server.

param(
    [int]$Port = 8000,
    [switch]$SkipInstall = $false
)

function Test-CommandExists([string]$name){
    return (Get-Command $name -ErrorAction SilentlyContinue) -ne $null
}

# Simple checks: detect Python executable (python, python3, py)
$pythonExe = $null
if (Test-CommandExists python) { $pythonExe = 'python' }
elseif (Test-CommandExists python3) { $pythonExe = 'python3' }
elseif (Test-CommandExists py) { $pythonExe = 'py' }
else {
    Write-Error "Python not found in PATH. Install Python 3 and ensure 'python' or 'py' is on PATH."; exit 1
}

if (-not (Test-CommandExists npm)){
    Write-Error "npm not found in PATH. Install Node.js (which includes npm) and re-run this script."; exit 1
}

# Install dependencies
if (-not $SkipInstall) {
    Write-Output "Running npm install (this will download puppeteer and Chromium)..."
    npm install
    if ($LASTEXITCODE -ne 0){ Write-Error "npm install failed."; exit 1 }
} else {
    Write-Output "Skipping npm install (SkipInstall specified)."
}

# Start python server in background
Write-Output "Starting local server on port $Port using '$pythonExe' (serving $(Get-Location))..."
$proc = Start-Process -FilePath $pythonExe -ArgumentList "-m","http.server", "$Port" -NoNewWindow -PassThru -WorkingDirectory (Get-Location)

# Quick sanity check: ensure the process started and didn't immediately exit
Start-Sleep -Seconds 1
if (-not $proc){ Write-Error "Failed to start server process."; exit 1 }
if ($proc.HasExited){ Write-Error "Server process exited immediately (check port or python executable)."; exit 1 }

# Wait for server readiness by polling the HTTP endpoint
$url = "http://localhost:$Port/"
$maxWait = 30
$waited = 0
Write-Output "Waiting for $url to respond (timeout ${maxWait}s)..."
while ($waited -lt $maxWait) {
    try{
        $resp = Invoke-WebRequest -Uri $url -TimeoutSec 5 -ErrorAction Stop
        if ($resp.StatusCode -ge 200 -and $resp.StatusCode -lt 500){ Write-Output "Server is responding."; break }
    } catch { }
    Start-Sleep -Seconds 1
    $waited += 1
}
if ($waited -ge $maxWait){
    Write-Error "Server did not become ready within ${maxWait}s.";
    if ($proc -and !$proc.HasExited){ Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue }
    exit 1
}

try{
    Write-Output "Running screenshot script..."
    npm run screenshot
    if ($LASTEXITCODE -ne 0){ Write-Error "screenshot script failed." }
    else { Write-Output "Screenshots created in project root." }
} finally {
    if ($proc -and !$proc.HasExited){
        Write-Output "Stopping local server (PID $($proc.Id))..."
        Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
    }
}
