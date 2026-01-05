@echo off
echo ========================================
echo   C++ AI 助手 API 文档部署脚本
echo ========================================
echo.

REM 检查是否已配置远程仓库
git remote -v | findstr origin >nul
if %errorlevel% neq 0 (
    echo [错误] 未找到远程仓库
    echo.
    echo 请先创建 GitHub 仓库并添加远程仓库：
    echo   git remote add origin https://github.com/YOUR_USERNAME/cpp-ai-assistant-api-docs.git
    echo.
    pause
    exit /b 1
)

echo [1/4] 添加文件到 Git...
git add docs/
if %errorlevel% neq 0 (
    echo [错误] 添加文件失败
    pause
    exit /b 1
)

echo [2/4] 提交更改...
git commit -m "Update API documentation"
if %errorlevel% neq 0 (
    echo [错误] 提交失败
    pause
    exit /b 1
)

echo [3/4] 推送到 GitHub...
git push origin main
if %errorlevel% neq 0 (
    echo [错误] 推送失败
    echo.
    echo 可能的原因：
    echo   1. 远程仓库不存在
    echo   2. 认证失败
    echo   3. 网络问题
    pause
    exit /b 1
)

echo [4/4] 部署完成！
echo.
echo ========================================
echo   部署成功！
echo ========================================
echo.
echo 几分钟后，你可以访问：
echo   https://YOUR_USERNAME.github.io/cpp-ai-assistant-api-docs/
echo.
echo 注意：请在 GitHub 仓库设置中启用 GitHub Pages
echo   Settings -^> Pages -^> Source: Deploy from a branch -^> Branch: main
echo.
pause