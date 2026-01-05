import axios from 'axios';

const API_KEYS = {
  openai: process.env.OPENAI_API_KEY || '',
  anthropic: process.env.ANTHROPIC_API_KEY || '',
  qwen: process.env.QWEN_API_KEY || ''
};

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { provider, apiKey, baseURL } = req.body || {};

    if (!provider) {
      return res.status(400).json({ success: false, message: '缺少提供商信息' });
    }

    const keyToUse = apiKey || API_KEYS[provider];
    if (!keyToUse) {
      return res.status(400).json({ success: false, message: '未配置 API Key' });
    }

    switch (provider) {
      case 'openai': {
        const modelsUrl = `${baseURL || 'https://api.openai.com/v1'}/models`;
        const headers = {
          Authorization: `Bearer ${keyToUse}`,
          'Content-Type': 'application/json'
        };

        const response = await axios.get(modelsUrl, { headers });

        const models = (response.data.data || []).map(model => ({
          id: model.id,
          name: model.id,
          provider,
          created: new Date(model.created * 1000).toISOString()
        }));

        return res.status(200).json({ success: true, models });
      }

      default:
        return res.status(400).json({
          success: false,
          message: `暂不支持从 ${provider} 获取模型列表`
        });
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

    return res.status(error.response?.status || 500).json({
      success: false,
      message: errorMessage
    });
  }
}