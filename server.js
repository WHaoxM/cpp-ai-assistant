// Vercel兼容的server.js
// 检测是否在Vercel环境中运行
const isVercel = process.env.VERCEL !== undefined;

if (!isVercel) {
  // 非Vercel环境，启动Express服务器
  const express = require('express');
  const axios = require('axios');
  const cors = require('cors');
  const path = require('path');

  const app = express();
  const PORT = process.env.PORT || 8081;

  // 中间件
  app.use(cors());
  app.use(express.json());
  
  // 静态文件服务
  app.use(express.static('dist')); // 构建后的静态文件目录

  // API密钥配置（在实际部署时，应使用环境变量存储）
  const API_KEYS = {
    openai: process.env.OPENAI_API_KEY || '',
    anthropic: process.env.ANTHROPIC_API_KEY || '',
    qwen: process.env.QWEN_API_KEY || ''
  };

  // API路由
  app.use('/api', require('./api-routes'));

  // 所有非API请求都返回index.html（支持前端路由）
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
  });

  // 启动服务器
  app.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
  });
} else {
  // 在Vercel环境中，导出API路由函数
  // Vercel会自动处理这些API路由
  console.log('在Vercel环境中运行，使用Vercel API路由');
}