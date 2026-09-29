Write-Host "===================================================" -ForegroundColor Green
Write-Host "  Starting AgriNexus Full-Stack AI Farm Platform" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green
Write-Host ""

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Cyan
    npm install
}

Write-Host "Starting AgriNexus Server on http://localhost:3000..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Available URLs:" -ForegroundColor White
Write-Host "  🌾 Farmer App:    http://localhost:3000/app" -ForegroundColor Cyan
Write-Host "  🏠 3D Story:      http://localhost:3000" -ForegroundColor Cyan
Write-Host "  📊 Pitch Deck:    http://localhost:3000/pitch" -ForegroundColor Cyan
Write-Host "  🩺 API Status:    http://localhost:3000/api/status" -ForegroundColor Cyan
Write-Host ""

npm start
