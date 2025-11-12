@echo off
ECHO Spousteni Playwright smoke testu...

REM === NASTAVENI ===
SET "PROJECT_PATH=C:\Users\novakma\Testy_CBOS"
SET "LOG_DIR=%PROJECT_PATH%\artefacts\logs"
SET "FLAG_FILE=%USERPROFILE%\Desktop\TESTY_SELHALY.txt"
REM =================

cd /D "%PROJECT_PATH%"

if exist "%FLAG_FILE%" (
    del "%FLAG_FILE%"
)

ECHO Testy bezi...
npx playwright test --grep "@smoke"

ECHO Cekam 5 sekund, aby se logy stihly ulozit...
REM /T 5 = Cekej 5 sekund
REM > NUL = Skryje odpocet
timeout /t 5 /nobreak > NUL

ECHO Prohledavam logy v: %LOG_DIR%
findstr /S /I /M /C:"failed" /C:"warn" /C:"error" "%LOG_DIR%\*.*" > NUL

if %ERRORLEVEL% == 0 (
    ECHO Nalezeny chyby nebo varovani v logu.
    ECHO Chyby v testech! Zkontrolujte logy ve slozce %LOG_DIR% > "%FLAG_FILE%"
) else (
    ECHO Testy probehly bez chyb a varovani.
)

ECHO Skenovani logu dokonceno.