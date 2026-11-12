$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath (Join-Path $PSScriptRoot '..')
$env:TRACKPRO_API_BASE_URL = 'http://127.0.0.1:8089'
$env:NEXT_PUBLIC_API_BASE_URL = 'http://127.0.0.1:8089'
$env:NEXT_PUBLIC_MAPBOX_TOKEN = ''
$env:NEXT_PUBLIC_LIVE_WEBSOCKET_ENABLED = 'false'
npm run dev -- --hostname 127.0.0.1 --port 3000
