@echo off
cd /d "%~dp0"
echo.
echo === Threat Intel Backend (Spring Boot + MySQL) ===
echo Requires: JDK 17+ (JAVA_HOME), MySQL with DB from application.yml defaults.
echo.
set "MVN=%~dp0..\tools\apache-maven-3.9.9\bin\mvn.cmd"
if not exist "%MVN%" set "MVN=mvn.cmd"
call "%MVN%" spring-boot:run
if errorlevel 1 (
  echo.
  echo If JAVA_HOME was missing or mvn failed, install a JDK 17+ or open Backend in IntelliJ and run Application.java.
  pause
)
