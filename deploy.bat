@echo off
chcp 65001 > nul
title Выкатка обновлений на GitHub

echo ==========================================
echo    ВЫКАТКА ОБНОВЛЕНИЙ НА GITHUB PAGES
echo ==========================================
echo.

:: 1. Проверка наличия remote
git remote get-url origin >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [!] Ошибка: Репозиторий еще не привязан к GitHub.
    echo.
    pause
    exit /b
)

:: 2. Добавление всех изменений
echo [1/3] Проверка измененных файлов...
git add -A

:: 3. Проверяем, есть ли что коммитить
git diff --cached --quiet
if %ERRORLEVEL% NEQ 0 (
    set /p commit_msg="Введите описание обновления (или нажмите Enter): "
    if "%commit_msg%"=="" set commit_msg=Обновление данных и дизайна
    echo [2/3] Создание коммита...
    git commit -m "%commit_msg%"
) else (
    echo [2/3] Нет новых локальных изменений для коммита, отправляем историю...
)

:: 4. Отправка на GitHub
echo.
echo [3/3] Отправка на GitHub (git push origin main)...
git push origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================
    echo  УСПЕШНО! Все файлы выгружены на GitHub.
    echo  GitHub Pages обновит сайт в течение 1-2 минут:
    echo  https://bitsais.github.io/design-randomizer/
    echo.
    echo  (Если на сайте не видны изменения, нажмите Ctrl + F5)
    echo ========================================================
) else (
    echo.
    echo ========================================================
    echo  [!] Не удалось выполнить push.
    echo  Проверьте подключение к интернету или права доступа.
    echo ========================================================
)

echo.
pause
