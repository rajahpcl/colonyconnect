@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0build-deploy.ps1" %*
