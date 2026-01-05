# GitHub 部署指南

## 1. 创建 GitHub 仓库

1. 访问 https://github.com
2. 点击右上角的 "+" 按钮，选择 "New repository"
3. 填写仓库信息：
   - Repository name: `cpp-ai-assistant`
   - Description: `C++ AI Assistant - An intelligent C++ learning assistant with AI chat, question bank, and custom model management`
   - Public/Private: 根据需要选择
   - **不要**勾选 "Initialize this repository with a README"
4. 点击 "Create repository"

## 2. 推送代码到 GitHub

在项目目录下运行以下命令：

```bash
# 添加远程仓库（替换 YOUR_USERNAME 为您的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/cpp-ai-assistant.git

# 推送代码到 GitHub
git push -u origin master
```

## 3. 部署到 Vercel

### 方法一：通过 Vercel 网站部署（推荐）

1. 访问 https://vercel.com
2. 使用 GitHub 账号登录
3. 点击 "Add New Project"
4. 选择 "Import Git Repository"
5. 选择 `cpp-ai-assistant` 仓库
6. 配置项目设置：
   - Framework Preset: 选择 "Vite"
   - Root Directory: 留空或设置为 `.`
   - Build Command: `npm run build`
   - Output Directory: `dist`
7. 点击 "Deploy"

### 方法二：通过 Vercel CLI 部署

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录 Vercel
vercel login

# 部署项目
vercel
```

## 4. 配置环境变量（如果需要）

在 Vercel 项目设置中添加环境变量：

- 如果有 API 密钥或其他敏感信息，在 Vercel Dashboard 中添加
- Settings > Environment Variables
- 添加相应的环境变量

## 5. 访问部署的应用

部署完成后，Vercel 会提供一个 URL，例如：
- https://cpp-ai-assistant.vercel.app
- 或自定义域名

## 注意事项

1. **确保 package.json 中的 scripts 正确**
   ```json
   {
     "scripts": {
       "dev": "vite",
       "build": "vite build",
       "preview": "vite preview"
     }
   }
   ```

2. **确保 vercel.json 配置正确**
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist"
   }
   ```

3. **后端 API 部署**
   - 当前项目包含 server.js，需要单独部署后端
   - 可以使用 Vercel Serverless Functions 或其他平台（如 Render、Railway）
   - 或将后端 API 移至独立的 Node.js 服务

## 故障排除

### 构建失败
- 检查 package.json 中的依赖是否完整
- 检查 vite.config.js 配置是否正确

### 部署失败
- 检查 Vercel 日志
- 确保所有必需的文件都已提交

### 运行时错误
- 检查浏览器控制台错误
- 检查网络请求是否成功
