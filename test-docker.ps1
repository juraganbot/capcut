# Test Docker Build Script for Windows
# Run this before deploying to Easypanel

Write-Host "🐳 Testing Docker Build for Easypanel..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if .env.local exists
Write-Host "📋 Step 1: Checking .env.local..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    Write-Host "✓ .env.local found" -ForegroundColor Green
} else {
    Write-Host "✗ .env.local not found!" -ForegroundColor Red
    Write-Host "Create .env.local with required environment variables" -ForegroundColor Red
    exit 1
}

# Step 2: Build Docker image
Write-Host ""
Write-Host "🔨 Step 2: Building Docker image..." -ForegroundColor Yellow
docker build -t capcut-pro:test . --no-cache

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Docker build successful" -ForegroundColor Green
} else {
    Write-Host "✗ Docker build failed!" -ForegroundColor Red
    exit 1
}

# Step 3: Run container
Write-Host ""
Write-Host "🚀 Step 3: Starting container..." -ForegroundColor Yellow
docker-compose up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Container started" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to start container!" -ForegroundColor Red
    exit 1
}

# Step 4: Wait for app to start
Write-Host ""
Write-Host "⏳ Step 4: Waiting for application to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Step 5: Health check
Write-Host ""
Write-Host "🏥 Step 5: Running health check..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ Application is healthy (HTTP $($response.StatusCode))" -ForegroundColor Green
    } else {
        Write-Host "✗ Application health check failed (HTTP $($response.StatusCode))" -ForegroundColor Red
        Write-Host ""
        Write-Host "📋 Container logs:" -ForegroundColor Yellow
        docker-compose logs --tail=50
        exit 1
    }
} catch {
    Write-Host "✗ Application health check failed: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "📋 Container logs:" -ForegroundColor Yellow
    docker-compose logs --tail=50
    exit 1
}

# Step 6: Show logs
Write-Host ""
Write-Host "📋 Step 6: Recent logs:" -ForegroundColor Yellow
docker-compose logs --tail=20

# Success
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "✓ Docker test successful!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Application is running at: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Yellow
Write-Host "  1. Test the application in your browser"
Write-Host "  2. Test checkout flow"
Write-Host "  3. Check logs: docker-compose logs -f"
Write-Host "  4. Stop: docker-compose down"
Write-Host ""
Write-Host "🚀 Ready to deploy to Easypanel!" -ForegroundColor Green
