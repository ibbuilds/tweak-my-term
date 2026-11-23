@echo off
where node >nul 2>nul || (echo tmt needs Node.js 20 or newer. Install it: winget install OpenJS.NodeJS.LTS 1>&2 & exit /b 127)
node "%~dp0..\engine\cli.js" %*
