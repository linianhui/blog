REM 批量转换 

@echo off

for %%i in (*.epub) do kindlegen "%%i" -verbose

pause