# Backend Fix Script
Write-Host "=== Fixing Backend Connection ===" -ForegroundColor Cyan
Write-Host ""

# Stop all node processes
Write-Host "Stopping old backend processes..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Test database connection first
Write-Host "Testing database connection..." -ForegroundColor Yellow
cd backend
node test-db-connection.js
$dbTest = $LASTEXITCODE

if ($dbTest -eq 0) {
    Write-Host ""
    Write-Host "✅ Database connection works!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Starting backend server..." -ForegroundColor Yellow
    Write-Host "Check the new window for connection status." -ForegroundColor Cyan
    Write-Host ""
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\lenovo\Desktop\MedLab\backend'; Write-Host '=== BACKEND SERVER ===' -ForegroundColor Cyan; npm start" -WindowStyle Normal
    
    Start-Sleep -Seconds 5
    
    Write-Host "Testing backend API..." -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:8081/users" -Method GET -TimeoutSec 3 -ErrorAction Stop
        Write-Host "✅ Backend is working correctly!" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ Backend started but API test failed. Check the backend window for details." -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host "❌ Database connection failed. Fix the database issue first." -ForegroundColor Red
}







