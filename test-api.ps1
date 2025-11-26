# Test the backend API
Write-Host "Testing Backend API..." -ForegroundColor Cyan
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8081/users" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Green
    $data = $response.Content | ConvertFrom-Json
    Write-Host "Total users: $($data.total)" -ForegroundColor Cyan
    if ($data.users) {
        Write-Host "Users:" -ForegroundColor Yellow
        $data.users | ForEach-Object { Write-Host "  - $($_.name)" -ForegroundColor White }
    }
} catch {
    Write-Host "Error occurred!" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Yellow
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $responseBody = $reader.ReadToEnd()
    Write-Host "Response: $responseBody" -ForegroundColor Yellow
}







