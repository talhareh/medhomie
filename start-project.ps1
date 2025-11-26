# MedLab Project Startup Script
Write-Host "Starting MedLab Project..." -ForegroundColor Cyan
Write-Host ""

# Check if MySQL is running (optional check)
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
Write-Host "Make sure MySQL is running and the medhome database exists!" -ForegroundColor Yellow
Write-Host ""

# Start Backend Server
Write-Host "Starting Backend Server (Port 8081)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; npm start" -WindowStyle Normal

# Wait a moment for backend to initialize
Start-Sleep -Seconds 3

# Start Frontend Server
Write-Host "Starting Frontend Server (Port 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm start" -WindowStyle Normal

Write-Host ""
Write-Host "Both servers are starting in separate windows!" -ForegroundColor Green
Write-Host ""
Write-Host "Backend API: http://localhost:8081" -ForegroundColor Cyan
Write-Host "Frontend App: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "The browser should open automatically. If not, navigate to http://localhost:3000" -ForegroundColor Green
Write-Host ""

