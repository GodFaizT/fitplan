# Arranca o cluster PostgreSQL local do FitPlan (porta 5433).
# A base de dados de desenvolvimento vive em AppData\Local\fitplan-postgres\data
# e usa os binários do PostgreSQL 18 já instalados.
#
# Uso:  pwsh -File scripts/start-db.ps1
$data = "$env:LOCALAPPDATA\fitplan-postgres\data"
$log  = "$env:LOCALAPPDATA\fitplan-postgres\server.log"
$bin  = "C:\Program Files\PostgreSQL\18\bin"
& "$bin\pg_ctl.exe" -D $data -l $log start
Write-Host "PostgreSQL FitPlan a correr em localhost:5433 (BD: fitplan)"
