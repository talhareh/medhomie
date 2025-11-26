# Database Setup Helper Script
Write-Host "=== MedLab Database Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check if MySQL is accessible
Write-Host "Checking MySQL connection..." -ForegroundColor Yellow
try {
    $mysqlTest = & mysql --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ MySQL is installed" -ForegroundColor Green
    } else {
        Write-Host "❌ MySQL command not found. Make sure MySQL is installed and in PATH." -ForegroundColor Red
        exit
    }
} catch {
    Write-Host "❌ MySQL not found. Please install MySQL or add it to your PATH." -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "To set up the database, run one of these commands:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Option 1: Using MySQL command line (if no password):" -ForegroundColor Cyan
Write-Host "  mysql -u root < database-setup.sql" -ForegroundColor White
Write-Host ""
Write-Host "Option 2: Using MySQL command line (with password):" -ForegroundColor Cyan
Write-Host "  mysql -u root -p < database-setup.sql" -ForegroundColor White
Write-Host ""
Write-Host "Option 3: Manual setup in MySQL:" -ForegroundColor Cyan
Write-Host "  1. Open MySQL Command Line or MySQL Workbench" -ForegroundColor White
Write-Host "  2. Run the SQL commands from database-setup.sql" -ForegroundColor White
Write-Host ""
Write-Host "After setup, restart the backend server!" -ForegroundColor Yellow







