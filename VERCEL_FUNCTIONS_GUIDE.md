# Vercel Functions 后端配置指南

## 概述

本项目使用 Vercel Functions 作为后端 API，提供以下功能：
- AI 模型调用
- 获取模型列表
- 获取可部署模型列表
- 测试 API 连接

## Vercel Functions 配置

### 1. vercel.json 配置

项目已配置为支持 Vercel Functions：

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "functions": {
    "api/**/*.js": {
      "runtime": "nodejs18.x"
    }
  },
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    }
  ]
}
```

### 2. API 文件结构

```
api/
├── ai-model.js              # AI 模型调用
├── get-models.js           # 获取模型列表
├── get-deployable-models.js # 获取可部署模型列表
└── test-connection.js       # 测试 API 连接
```

每个文件都是一个独立的 Vercel Function。

### 3. API 端点

#### AI 模型调用
- **路径**: `/api/ai-model`
- **方法**: POST
- **请求体**:
  ```json
  {
    "provider": "openai|anthropic|qwen",
    "apiKey": "your-api-key",
    "baseURL": "https://api.example.com/v1",
    "model": "gpt-3.5-turbo",
    "messages": [
      {
        "role": "user",
        "content": "Hello"
      }
    ],
    "options": {
      "temperature": 0.7,
      "max_tokens": 1000
    }
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "result": "AI response"
  }
  ```

#### 获取模型列表
- **路径**: `/api/get-models`
- **方法**: POST
- **请求体**:
  ```json
  {
    "provider": "openai",
    "apiKey": "your-api-key",
    "baseURL": "https://api.openai.com/v1"
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "models": [
      {
        "id": "gpt-3.5-turbo",
        "name": "gpt-3.5-turbo",
        "provider": "openai",
        "created": "2023-01-01T00:00:00.000Z"
      }
    ]
  }
  ```

#### 获取可部署模型列表
- **路径**: `/api/get-deployable-models`
- **方法**: POST
- **请求体**:
  ```json
  {
    "provider": "qwen",
    "apiKey": "your-api-key",
    "baseURL": "https://dashscope.aliyuncs.com"
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "models": {
      "request_id": "batch-1234567890",
      "output": {
        "models": [...],
        "page_no": 1,
        "page_size": 100,
        "total": 100
      }
    }
  }
  ```

#### 测试 API 连接
- **路径**: `/api/test-connection`
- **方法**: POST
- **请求体**:
  ```json
  {
    "provider": "openai",
    "apiKey": "your-api-key",
    "baseURL": "https://api.openai.com/v1"
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "message": "连接成功"
  }
  ```

## 环境变量配置

### 在 Vercel 中设置环境变量

1. 进入 Vercel 项目设置
2. 点击 "Environment Variables"
3. 添加以下变量：

```bash
# OpenAI
OPENAI_API_KEY=sk-your-openai-key

# Anthropic (Claude)
ANTHROPIC_API_KEY=your-anthropic-key

# 通义千问 (Qwen)
QWEN_API_KEY=sk-your-qwen-key
```

### 在本地开发中设置环境变量

创建 `.env` 文件：

```env
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
QWEN_API_KEY=sk-your-qwen-key
```

## 部署步骤

### 1. 推送代码到 GitHub

```bash
git add .
git commit -m "Add Vercel Functions configuration"
git push origin master
```

### 2. 在 Vercel 部署

1. 访问 https://vercel.com
2. 进入项目设置
3. 点击 "Redeploy"
4. 等待部署完成

### 3. 配置环境变量

1. 进入项目设置
2. 点击 "Environment Variables"
3. 添加 API 密钥
4. 重新部署

## 本地测试 Vercel Functions

### 使用 Vercel CLI

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录
vercel login

# 本地开发
vercel dev

# 测试 API
curl -X POST https://your-project.vercel.app/api/ai-model \
  -H "Content-Type: application/json" \
  -d '{"provider":"qwen","messages":[{"role":"user","content":"Hello"}]}'
```

## 故障排除

### API 返回 404

**原因**: API 路径不正确

**解决方案**:
1. 检查 `vercel.json` 中的 `rewrites` 配置
2. 确认 API 文件在 `api/` 目录中
3. 检查文件名是否正确

### API 返回 500

**原因**: 服务器错误

**解决方案**:
1. 查看 Vercel Function 日志
2. 检查 API 密钥是否正确
3. 确认网络连接正常

### 环境变量未生效

**原因**: 环境变量未正确配置

**解决方案**:
1. 在 Vercel 项目设置中重新添加环境变量
2. 重新部署项目
3. 检查变量名称是否正确

## API 密钥获取

### OpenAI
- 访问: https://platform.openai.com/api-keys
- 创建新的 API 密钥
- 复制密钥

### Anthropic (Claude)
- 访问: https://console.anthropic.com/
- 登录并创建 API 密钥
- 复制密钥

### 通义千问 (Qwen)
- 访问: https://dashscope.console.aliyun.com/apiKey
- 创建 API 密钥
- 复制密钥

## 安全建议

1. **不要将 API 密钥提交到 Git**
   - 使用 `.gitignore` 忽略 `.env` 文件
   - 使用环境变量存储密钥

2. **定期轮换 API 密钥**
   - 定期更新密钥
   - 删除不再使用的密钥

3. **限制 API 密钥权限**
   - 只授予必要的权限
   - 设置使用限制

4. **监控 API 使用情况**
   - 定期检查使用量
   - 设置告警通知

## 性能优化

### 缓存策略

在 API 中实现缓存可以减少 API 调用：

```javascript
// 示例：缓存模型列表
const cache = new Map();

export default async function handler(req, res) {
  const cacheKey = `${provider}-${apiKey}`;
  
  if (cache.has(cacheKey)) {
    return res.status(200).json(cache.get(cacheKey));
  }
  
  // 获取模型列表
  const models = await fetchModels(provider, apiKey);
  
  // 缓存结果（5分钟）
  cache.set(cacheKey, models, 300000);
  
  res.status(200).json(models);
}
```

### 限流

实现限流防止滥用：

```javascript
const rateLimit = new Map();

export default async function handler(req, res) {
  const ip = req.headers['x-forwarded-for'] || req.ip;
  const now = Date.now();
  
  if (rateLimit.has(ip)) {
    const lastRequest = rateLimit.get(ip);
    if (now - lastRequest < 1000) {
      return res.status(429).json({ error: '请求过于频繁' });
    }
  }
  
  rateLimit.set(ip, now);
  // 处理请求
}
```

## 监控和日志

### Vercel Function 日志

1. 进入 Vercel Dashboard
2. 选择项目
3. 点击 "Functions" 标签
4. 查看函数日志

### 自定义日志

在 API 中添加自定义日志：

```javascript
console.log('[INFO] API call received:', {
  provider,
  timestamp: new Date().toISOString()
});

console.error('[ERROR] API call failed:', {
  error: error.message,
  stack: error.stack
});
```

## 扩展功能

### 添加新的 API 端点

1. 在 `api/` 目录中创建新文件
2. 导出 `handler` 函数
3. 遵循 Vercel Functions 规范

示例：

```javascript
// api/new-endpoint.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const data = req.body;
    // 处理请求
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

## 相关资源

- [Vercel Functions 文档](https://vercel.com/docs/functions)
- [Vercel Runtime API](https://vercel.com/docs/functions/runtimes)
- [Node.js 文档](https://nodejs.org/docs/)
- [Express.js 文档](https://expressjs.com/)
