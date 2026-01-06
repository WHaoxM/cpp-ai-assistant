# C++ AI 助手 API 文档

这是 C++ AI 助手的 API 文档页面，基于 Qwen3-MAX 模型开发。

## 在线预览

访问 [docs/index.html](docs/index.html) 查看 API 文档。

## 部署到 GitHub Pages

### 方法一：使用 GitHub CLI（推荐）

1. 安装 GitHub CLI
   ```bash
   # Windows (使用 winget)
   winget install --id GitHub.cli

   # macOS (使用 Homebrew)
   brew install gh

   # Linux
   sudo apt install gh
   ```

2. 登录 GitHub
   ```bash
   gh auth login
   ```

3. 创建新仓库
   ```bash
   gh repo create cpp-ai-assistant-api-docs --public --description "C++ AI Assistant API Documentation"
   ```

4. 添加远程仓库
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/cpp-ai-assistant-api-docs.git
   ```

5. 推送到 GitHub
   ```bash
   git branch -M main
   git push -u origin main
   ```

6. 启用 GitHub Pages
   ```bash
   gh api repos/:owner/:repo/pages -X POST -f source[branch]=main
   ```

### 方法二：手动创建仓库

1. 在 GitHub 上创建新仓库
   - 仓库名：`cpp-ai-assistant-api-docs`
   - 设置为 Public
   - 不要初始化 README

2. 添加远程仓库
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/cpp-ai-assistant-api-docs.git
   ```

3. 推送到 GitHub
   ```bash
   git branch -M main
   git push -u origin main
   ```

4. 在 GitHub 仓库设置中启用 GitHub Pages
   - 进入仓库的 Settings
   - 找到 Pages 部分
   - Source 选择 `Deploy from a branch`
   - Branch 选择 `main`
   - 点击 Save

5. 等待几分钟，GitHub Pages 将自动部署
   - 访问 `https://YOUR_USERNAME.github.io/cpp-ai-assistant-api-docs/`

## 本地预览

你可以使用任何 HTTP 服务器在本地预览文档：

### 使用 Python
```bash
cd docs
python -m http.server 8000
```
然后访问 http://localhost:8000

### 使用 Node.js
```bash
cd docs
npx http-server -p 8000
```
然后访问 http://localhost:8000

### 使用 VS Code
安装 "Live Server" 扩展，右键点击 `index.html` 选择 "Open with Live Server"。

## 文档内容

- 概述
- 认证
- 聊天补全 API
- 参数说明
- 响应格式
- 示例代码（Python、JavaScript）
- 错误码

## 技术栈

- HTML5
- CSS3（响应式设计）
- 纯静态页面，无需构建

## 许可证

&copy; 2026 C++ AI 助手. 版权所有