@ECHO ON
@REM 家庭版启用Hyper-V
SET PACKAGE_PATH=%SystemRoot%\servicing\Packages\
FOR /F %%i IN ('DIR /B %PACKAGE_PATH%*Hyper-V*.mum') DO DISM /Online /NoRestart /Add-Package:"%PACKAGE_PATH%%%i"
DISM /Online /Enable-Feature /FeatureName:Microsoft-Hyper-V -All /LimitAccess /ALL
PAUSE