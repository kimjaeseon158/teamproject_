@echo off
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0register_admin.ps1"
if errorlevel 1 pause
