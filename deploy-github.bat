@echo off
echo ========================================
echo   C++ AI Assistant 部署脚本
echo ========================================
echo.

REM 检查是否已初始化 Git
if not exist .git (
    echo [错误] 未找到 Git 仓库，请先运行 git init
    pause
    exit /b 1
)

echo [步骤 1/4] 检查 Git 状态...
git status

echo.
echo [步骤 2/4] 添加所有文件到暂存区...
git add .

echo.
echo [步骤 3/4] 提交更改...
set /p commit_msg=请输入提交消息（默认：Update code）:
if "%commit_msg%"=="" set commit_msg=Update code
git commit -m "%commit_msg%"

echo.
echo [步骤 4/4] 推送到 GitHub...
echo.
echo 请确保您已在 GitHub 上创建了仓库：cpp-ai-assistant
echo.
set /p github_url=请输入 GitHub 仓库 URL（例如：https://github.com/username/cpp-ai-assistant.git）:
if "%github_url%"=="" (
    echo [错误] 未提供 GitHub 仓库 URL
    pause
    exit /b 1
)

REM 检查是否已配置远程仓库
git remote -v >nul 2>&1
if %errorlevel% neq 0 (
    echo 添加远程仓库...
    git remote add origin %github_url%
) else (
    echo 更新远程仓库...
    git remote set-url origin %github_url%
)

echo.
echo 推送代码到 GitHub...
git push -u origin master

echo.
echo ========================================
echo   部署完成！
echo ========================================
echo.
echo 下一步：
echo 1. 访问 https://vercel.com
echo 2. 登录并导入 GitHub 仓库
echo 3. 配置构建设置
echo 4. 点击部署
echo.
pause
