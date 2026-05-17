@echo off
echo Iniciando servicios de OpenTicket...

start "API (Backend)" cmd /k "npx nx run api:serve"
start "Web Client (Publico)" cmd /k "npx nx run web-client:dev --port=4200"
start "Web Host (Organizadores)" cmd /k "npx nx run web-host:dev --port=4201"
start "Web Admin (Global)" cmd /k "npx nx run web-admin:dev --port=4202"

echo Los servicios se estan iniciando en nuevas ventanas.
echo.
echo Puertos asignados:
echo - API: localhost:3000
echo - Cliente: localhost:4200
echo - Organizador: localhost:4201
echo - Admin Global: localhost:4202
echo.
pause
