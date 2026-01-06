# C++ AI Assistant

一个智能的 C++ 学习助手，集成 AI 聊天、题库管理和自定义模型配置功能。

## 功能特性

### 核心功能
- **AI 聊天助手**：与 AI 进行实时对话，获取 C++ 学习帮助
- **题库管理**：导入、查看、筛选和管理 C++ 题目
- **题目详情**：查看题目的完整信息、答案和解析
- **自定义模型**：配置和管理自定义 AI 模型
- **在线 AI 模型**：直接使用 DeepSeek 和 Qwen 在线服务

### 高级功能
- **Markdown 渲染**：支持代码高亮和格式化文本
- **第三方平台支持**：支持心流、DeepSeek、通义千问等平台
- **悬浮窗**：全局悬浮 AI 聊天窗口，随时访问
- **题目分析**：AI 自动分析题目并提供详细解答
- **模型训练**：支持模型微调和训练配置

### 题目类型
- 单选题
- 填空题
- 判断题
- 写结果题
- 写程序题

## 技术栈

- **前端**：Vue 3 + Vite
- **UI 框架**：Element Plus
- **路由**：Vue Router
- **状态管理**：Vue Composition API
- **代码高亮**：highlight.js
- **Markdown**：marked.js
- **后端**：Node.js + Express
- **部署**：Vercel

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 项目结构

```
cpp-ai-assistant/
├── api/                    # 后端 API
│   ├── ai-model.js
│   ├── get-deployable-models.js
│   ├── get-models.js
│   └── test-connection.js
├── docs/                    # 文档
│   ├── index.html
│   └── README.md
├── public/                  # 静态资源
├── src/                     # 源代码
│   ├── components/          # Vue 组件
│   │   ├── FloatingAIChat.vue
│   │   ├── ModelSelector.vue
│   │   └── HelloWorld.vue
│   ├── services/            # 服务层
│   │   ├── aiService.js
│   │   └── questionService.js
│   ├── utils/               # 工具函数
│   │   └── textUtils.js
│   ├── views/               # 页面视图
│   │   ├── AIChat.vue
│   │   ├── APIConfig.vue
│   │   ├── CustomModels.vue
│   │   ├── ModelTraining.vue
│   │   ├── OnlineAIModels.vue
│   │   ├── QuestionBank.vue
│   │   └── QuestionDetail.vue
│   ├── App.vue
│   ├── main.js
│   └── style.css
├── .github/                # GitHub Actions
│   └── workflows/
│       └── deploy.yml
├── api-routes.js           # API 路由配置
├── package.json
├── server.js              # 后端服务器
├── vercel.json            # Vercel 配置
└── vite.config.js         # Vite 配置
```

## 配置说明

### AI 服务配置

支持以下 AI 服务提供商：

1. **OpenAI**
   - API Key: 从 https://platform.openai.com/api-keys 获取
   - Base URL: https://api.openai.com/v1

2. **Anthropic (Claude)**
   - API Key: 从 https://console.anthropic.com/ 获取
   - Base URL: https://api.anthropic.com/v1

3. **通义千问 (Qwen)**
   - API Key: 从 https://dashscope.console.aliyun.com/apiKey 获取
   - Base URL: https://dashscope.aliyuncs.com/api/v1

4. **DeepSeek**
   - API Key: 从 https://platform.deepseek.com/api_keys 获取
   - Base URL: https://api.deepseek.com/v1

5. **心流**
   - API Key: 从心流平台获取
   - Base URL: 根据心流平台配置

### 自定义模型

可以添加自定义 AI 模型：

1. 进入"自定义模型"页面
2. 点击"添加自定义模型"
3. 填写模型信息：
   - 模型名称
   - 模型 ID
   - 提供商
   - API 密钥（可选）
   - API 地址（可选）
   - 消息角色（role）
   - 消息内容（messageContent）
   - 上下文（context）

## 使用说明

### 导入题目

支持导入 JSON 和 JSONL 格式的题目文件：

```json
{
  "dataset": [
    {
      "id": 1,
      "type": "single_choice",
      "question": "题目内容",
      "options": ["选项A", "选项B", "选项C", "选项D"],
      "answer": "A",
      "explanation": "答案解析",
      "knowledge_point": "知识点",
      "difficulty": "easy"
    }
  ]
}
```

### AI 聊天

1. 选择 AI 模型
2. 输入问题
3. 获取 AI 回答
4. 支持多轮对话

### 题目分析

1. 在题库中选择题目
2. 点击"AI 分析"按钮
3. AI 会提供详细分析和解答

## 开发指南

### 添加新功能

1. 在 `src/views/` 中创建新页面
2. 在 `src/router/` 中配置路由（如果使用路由）
3. 在 `src/services/` 中添加服务函数
4. 在 `src/components/` 中创建可复用组件

### 代码风格

- 使用 Vue 3 Composition API
- 使用 Element Plus 组件
- 遵循 ESLint 规则
- 添加适当的注释

## 故障排除

### 常见问题

1. **构建失败**
   - 检查 Node.js 版本（建议 20+）
   - 清除 node_modules 并重新安装：`rm -rf node_modules && npm install`

2. **API 连接失败**
   - 检查 API 密钥是否正确
   - 检查网络连接
   - 查看浏览器控制台错误

3. **题目导入失败**
   - 检查文件格式是否正确
   - 检查 JSON 语法是否有效
   - 查看控制台错误信息

## 贡献

欢迎贡献代码、报告问题或提出建议！

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/AmazingFeature`
3. 提交更改：`git commit -m 'Add some AmazingFeature'`
4. 推送到分支：`git push origin feature/AmazingFeature`
5. 提交 Pull Request

## 许可证

MIT License

## 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 Issue
- 发送邮件
- 在线讨论

## 更新日志

### v1.0.0 (2026-01-06)

- 初始版本发布
- AI 聊天功能
- 题库管理
- 自定义模型配置
- Markdown 渲染和代码高亮
- 第三方平台支持
- 悬浮窗功能
- 题目导入功能
