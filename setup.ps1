# The Ninth Circle — Initial Setup
# Run: .\setup.ps1

Write-Host "Setting up The Ninth Circle..." -ForegroundColor Red

# Copy env if not exists
if (-not (Test-Path ".env")) {
  Copy-Item ".env.example" ".env"
  Write-Host "Created .env from .env.example — FILL IN YOUR KEYS BEFORE RUNNING" -ForegroundColor Yellow
}

# Generate Prisma client
Write-Host "Generating Prisma client..." -ForegroundColor Cyan
npx prisma generate

# Push DB schema
Write-Host "Creating database..." -ForegroundColor Cyan
npx prisma db push

# Seed forum categories
Write-Host "Seeding forum categories..." -ForegroundColor Cyan
node prisma/seed.js

Write-Host ""
Write-Host "Setup complete." -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Fill in .env with your keys (Google OAuth, GitHub OAuth, Stripe, Cloudinary)"
Write-Host "  2. Run: npm run dev"
Write-Host "  3. Sign in with ADMIN_EMAIL to get Game Master access"
Write-Host ""
Write-Host "The arena awaits, Game Master." -ForegroundColor Red
