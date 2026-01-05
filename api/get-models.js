import axios from 'axios';

// API密钥配置（在实际部署时，应使用环境变量存储）
const API_KEYS = {
  openai: process.env.OPENAI_API_KEY || '',
  anthropic: process.env.ANTHROPIC_API_KEY || '',
  qwen: process.env.QWEN_API_KEY || 'sk-e55031fd531a4575884669ff9fe8dd65'
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { provider, apiKey, baseURL } = req.body;

    if (!provider) {
      return res.status(400).json({ success: false, message: '缺少提供商信息' });
    }

    const keyToUse = apiKey || API_KEYS[provider];
    if (!keyToUse) {
      return res.status(400).json({ success: false, message: '未配置API密钥' });
    }

    let modelsUrl, headers;

    switch (provider) {
      case 'openai':
        modelsUrl = `${baseURL || 'https://api.openai.com/v1'}/models`;
        headers = {
          'Authorization': `Bearer ${keyToUse}`,
          'Content-Type': 'application/json'
        };
        // 使用GET请求获取模型列表
        const response = await axios.get(modelsUrl, { headers });
        
        res.status(200).json({ 
          success: true, 
          models: response.data.data.map(model => ({
            id: model.id,
            name: model.id,
            provider: provider,
            created: new Date(model.created * 1000).toISOString()
          })) 
        });
        return; // 提前返回，避免执行后续代码
        
      default:
        return res.status(400).json({ success: false, message: `暂不支持从 ${provider} 获取模型列表` });
    }

  } catch (error) {
    console.error('获取模型列表失败:', error);
    
    let errorMessage = '获取模型列表失败';
    if (error.response) {
      errorMessage = error.response.data?.error?.message || error.response.statusText || 'API请求失败';
    } else if (error.request) {
      errorMessage = '网络错误：无法连接到API服务器';
    } else {
      errorMessage = error.message || '未知错误';
    }
    
    res.status(error.response?.status || 500).json({ 
      success: false, 
      message: errorMessage 
    });
  }
}