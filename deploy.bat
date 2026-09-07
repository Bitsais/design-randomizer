@echo off
chcp 65001 > nul
title Выкатка обновлений на GitHub

echo ==========================================
echo    ВЫКАТКА ОБНОВЛЕНИЙ НА GITHUB PAGES
echo ==========================================
echo.

:: Проверка наличия remote
git remote get-url origin >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [!] Ошибка: Репозиторий еще не привязан к GitHub.
    echo Пожалуйста, выполните один раз команду привязки:
    echo git remote add origin https://github.com/ВАШ_ЛОГИН/design-randomizer.git
    echo.
    pause
    exit /b
)

:: Запрос комментария к обновлению
set /p commit_msg="Введите описание обновления (или нажмите Enter для стандартного): "
if "%commit_msg%"=="" set commit_msg="Обновление данных и дизайна"

echo.
echo [1/3] Индексация измененных файлов...
git add .

echo [2/3] Создание коммита...
git commit -m "%commit_msg%"

echo [3/3] Отправка на GitHub...
git push origin main

echo.
echo ==========================================
echo  Успешно! Обновления отправлены на GitHub.
echo  Сайт обновится автоматически через 1 минуту.
echo ==========================================
echo.
pause
