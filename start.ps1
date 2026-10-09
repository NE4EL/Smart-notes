$root = $PSScriptRoot
$backend = Join-Path $root "backend"
$frontend = Join-Path $root "frontend"

$backendCommand = @"
Set-Location -LiteralPath '$backend'
if (-not (Test-Path '.venv\Scripts\python.exe')) {
    python -m venv .venv
    .\.venv\Scripts\python.exe -m pip install -r requirements.txt
}
.\.venv\Scripts\python.exe manage.py migrate
if (`$LASTEXITCODE -eq 0) {
    .\.venv\Scripts\python.exe manage.py runserver
}
"@

$frontendCommand = @"
Set-Location -LiteralPath '$frontend'
if (-not (Test-Path 'node_modules')) {
    npm install
    if (`$LASTEXITCODE -ne 0) { exit `$LASTEXITCODE }
}
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
"@

Start-Process powershell.exe -ArgumentList '-NoExit', '-Command', $backendCommand
Start-Process powershell.exe -ArgumentList '-NoExit', '-Command', $frontendCommand

Write-Host "Backend: http://127.0.0.1:8000/api/docs/"
Write-Host "Frontend: http://localhost:5173/"
