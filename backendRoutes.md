DASHBOARD BACKEND (port 5001)

Health
GET /api/health
-> { "status": "healthy", "service": "cdo-vertex-dashboard", "version": "1.0.0" }

System
GET /api/system/status
GET /api/system/cpu
GET /api/system/memory
GET /api/system/disk
GET /api/system/temperature
GET /api/system/network
GET /api/system/wifi
GET /api/system/uptime
GET /api/system/hostname

Settings
GET  /api/settings
POST /api/settings                 (body merged into settings)
GET  /api/settings/auto-update
POST /api/settings/auto-update
POST /api/settings/reset

Autodarts (legacy compat, proxies to module API)
GET  /api/autodarts/status
POST /api/autodarts/install        body: { "version"?, "enable_autostart"? }
POST /api/autodarts/update         body: { "version"? }
GET  /api/autodarts/check-update
POST /api/autodarts/service/start
POST /api/autodarts/service/stop
POST /api/autodarts/service/restart
GET  /api/autodarts/logs?lines=50

Module Registry + Proxy
GET  /api/modules                  -> { "modules": [ ...moduleDef + health... ] }
POST /api/modules/reload
GET  /api/modules/<module>/health
ANY  /api/modules/<module>/<path>  (proxy to module)

Factory Reset
POST /api/factory-reset
-> { "success": bool, "message": "...", "results": { "<module>": {...}, "dashboard": {...} } }



PI WI-FI MANAGER MODULE API (port 9911)

Contract
GET /v1/health
-> { "status": "ok" }

GET /v1/meta
-> { "name":"pi-wifi-manager","displayName":"Wi-Fi Manager","version":"1.0.0","apiVersion":"v1","baseUrl":"http://127.0.0.1:9911" }

GET /v1/capabilities
-> {
     "features":[...],
     "endpoints":{
       "wifi_status":"/v1/wifi/status",
       "wifi_scan":"/v1/wifi/scan",
       "wifi_connect":"/v1/wifi/connect",
       "wifi_disconnect":"/v1/wifi/disconnect",
       "wifi_saved":"/v1/wifi/saved",
       "ap_status":"/v1/ap/status",
       "reset":"/v1/reset"
     }
   }

Wi-Fi
GET  /v1/wifi/status
-> { "ok": true, "connected": bool, "ssid": str|null, "ip": str|null, "signal": int|null }

GET  /v1/wifi/scan
-> { "ok": true, "networks": [ { "ssid","signal","security","bssid" } ] }

POST /v1/wifi/connect
body: { "ssid": "...", "password": "..." }
-> { "ok": true/false, "success": true/false, "ip"?: "...", "error"?: "..." }

POST /v1/wifi/disconnect
-> { "ok": true/false }

GET  /v1/wifi/saved
-> { "ok": true, "networks": ["ssid1","ssid2"] }

DELETE /v1/wifi/saved/<name>
-> { "ok": true/false }

AP
GET /v1/ap/status
-> { "ok": true, "active": bool, "ssid": "Vertex-Setup"|null }

Reset
POST /v1/reset
-> { "success": bool, "message": "...", "errors": [] }



AUTODARTS MANAGER MODULE API (port 9912)

Contract
GET /v1/health
-> { "status": "ok" }

GET /v1/meta
-> { "name":"autodarts-manager","displayName":"Autodarts","version":"1.0.0","apiVersion":"v1","baseUrl":"http://127.0.0.1:9912" }

GET /v1/capabilities
-> { "features":[...], "endpoints":{...} }

Status
GET /v1/status
-> { "installed": bool, "version": "x.y.z"|null, "manager_available": true }

Install/Update
POST /v1/install
body: { "version"?: "x.y.z", "enable_autostart"?: true }
-> { "success": bool, "message"?: "...", "error"?: "..." }

POST /v1/update
body: { "version"?: "x.y.z" }

GET /v1/check-update
-> { "current_version": "x.y.z"|null, "latest_version": null, "update_available": false }

Service Control
POST /v1/service/start
POST /v1/service/stop
POST /v1/service/restart
POST /v1/service/enable
POST /v1/service/disable

Logs
GET /v1/logs?lines=50
-> { "success": bool, "lines": 50, "logs": "..." }

UVC Hack
POST /v1/uvc-hack/install
POST /v1/uvc-hack/uninstall

Reset
POST /v1/reset
-> { "success": bool, "message": "...", "errors": [] }