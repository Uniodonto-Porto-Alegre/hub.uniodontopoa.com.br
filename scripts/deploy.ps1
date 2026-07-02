<#
  Deploy do hub.uniodontopoa.com.br para o IIS de produção.
  Builda o frontend e copia frontend + código-fonte do backend para o
  diretório físico do site, sem tocar em node_modules/.env de produção.

  Uso: powershell -File scripts\deploy.ps1
#>

param(
  [string]$ProdPath = "\\10.100.10.91\e$\Projetos\hub.uniodontopoa.com.br",
  [string]$ServiceName = "hub-api"
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot

if (-not (Test-Path $ProdPath)) {
  throw "Caminho de produção não encontrado: $ProdPath"
}

Write-Host "1. Buildando frontend (vue-tsc + vite build)..." -ForegroundColor Cyan
Push-Location $root
try {
  npm run build
  if ($LASTEXITCODE -ne 0) {
    throw "Build do frontend falhou (exit code $LASTEXITCODE)."
  }
}
finally {
  Pop-Location
}

Write-Host "2. Copiando build do frontend para produção..." -ForegroundColor Cyan
Copy-Item "$root\dist\*" -Destination $ProdPath -Recurse -Force

Write-Host "3. Copiando codigo-fonte do backend para producao (sem node_modules/.env)..." -ForegroundColor Cyan
Copy-Item "$root\server\src\*" -Destination "$ProdPath\server\src" -Recurse -Force
Copy-Item "$root\server\package.json" -Destination "$ProdPath\server\package.json" -Force
Copy-Item "$root\server\package-lock.json" -Destination "$ProdPath\server\package-lock.json" -Force

Write-Host ""
Write-Host "Deploy de arquivos concluido." -ForegroundColor Green
Write-Host "Passos manuais restantes:" -ForegroundColor Yellow
Write-Host "  - Se package.json mudou (nova dependencia), rodar 'npm install' dentro de '$ProdPath\server' no servidor."
Write-Host "  - Reiniciar o servico NSSM do backend no servidor: nssm restart $ServiceName (ou services.msc)."
