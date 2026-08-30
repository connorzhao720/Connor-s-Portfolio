@echo off
cd /d "%~dp0"
call npm.cmd run dev > dev-server.log 2> dev-server.err.log
