# Vercel 部署故障排除指南

## 404 NOT_FOUND 错误

### 问题原因
404 错误通常是由于以下原因之一：
1. 路由配置不正确
2. 构建输出目录配置错误
3. 文件未正确部署到 dist 目录
4. SPA（单页应用）路由问题

### 解决方案

#### 1. 检查 vercel.json 配置

确保 `vercel.json` 配置正确：

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite"
}
```

#### 2. 检查 vite.config.js 配置

确保构建输出目录正确：

```javascript
export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: 'dist',  // 必须与 vercel.json 中的 outputDirectory 一致
    assetsDir: 'assets',
    sourcemap: true
  }
})
```

#### 3. 添加 .vercelignore 文件

创建 `.vercelignore` 文件以排除不需要部署的文件：

```
node_modules
.git
.DS_Store
*.log
.env
.env.local
.env.*.local
dist
.trae
error.txt
docs
api
server.js
api-routes.js
deploy.bat
deploy.sh
deploy-github.bat
```

#### 4. 检查 package.json

确保构建脚本正确：

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

#### 5. SPA 路由配置（如果使用 Vue Router）

如果使用 Vue Router，需要配置重写规则：

**方法一：使用 vercel.json 的 routes 配置**

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**方法二：使用 .vercelignore 和默认行为**

Vercel 默认支持 SPA，只需确保：
- `index.html` 在 `dist` 目录中
- 所有静态资源都在 `dist` 目录中

#### 6. 清理并重新部署

在 Vercel Dashboard 中：

1. 进入项目设置
2. 点击 "Redeploy" 按钮
3. 等待部署完成

#### 7. 检查部署日志

在 Vercel Dashboard 中：

1. 进入项目
2. 点击 "Deployments" 标签
3. 选择最新的部署
4. 点击 "View Logs"
5. 查看是否有构建错误

### 常见问题排查

#### 问题：构建失败

**症状**：部署时构建失败

**解决方案**：
1. 检查 `package.json` 中的依赖是否完整
2. 确保 Node.js 版本正确（建议 16+）
3. 在本地运行 `npm run build` 测试
4. 检查 Vercel 构建日志

#### 问题：部署成功但访问 404

**症状**：部署成功，但访问 URL 时显示 404

**解决方案**：
1. 检查 `vercel.json` 中的 `outputDirectory` 是否正确
2. 确认 `dist` 目录中包含 `index.html`
3. 检查路由配置是否正确
4. 尝试访问 `/index.html` 路径测试

#### 问题：API 路由 404

**症状**：前端可以访问，但 API 调用返回 404

**解决方案**：
1. 确认后端 API 文件在 `api/` 目录中
2. 检查 Vercel Serverless Functions 配置
3. 或考虑将后端部署到单独的服务

### 验证部署

#### 本地测试

在部署前，先在本地测试：

```bash
# 构建项目
npm run build

# 预览构建结果
npm run preview

# 访问 http://localhost:4173
```

#### 检查构建输出

确认 `dist` 目录结构：

```
dist/
├── index.html
├── assets/
│   ├── index-xxx.js
│   └── index-xxx.css
└── vite.svg
```

### 高级配置

#### 自定义域名

在 Vercel 项目设置中：

1. 进入 "Domains" 标签
2. 点击 "Add Domain"
3. 输入您的域名
4. 配置 DNS 记录

#### 环境变量

在 Vercel 项目设置中：

1. 进入 "Environment Variables" 标签
2. 添加环境变量
3. 例如：
   - `VITE_API_URL`: https://your-api.com
   - `VITE_API_KEY`: your-api-key

### 联系支持

如果以上方法都无法解决问题：

1. 查看 Vercel 官方文档：https://vercel.com/docs
2. 提交 Issue 到项目仓库
3. 联系 Vercel 支持

### 快速修复清单

- [ ] vercel.json 配置正确
- [ ] vite.config.js 中的 outDir 与 vercel.json 的 outputDirectory 一致
- [ ] package.json 中的 build 脚本正确
- [ ] .vercelignore 文件已创建
- [ ] 本地构建成功（`npm run build`）
- [ ] dist 目录包含 index.html
- [ ] Vercel 构建日志无错误
- [ ] 已清理并重新部署

### 相关资源

- [Vercel 文档](https://vercel.com/docs)
- [Vite 部署指南](https://vitejs.dev/guide/build.html)
- [Vue Router 部署](https://router.vuejs.org/guide/essentials/history-mode.html)
