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
    const { provider, apiKey, baseURL, model } = req.body || {};

    if (!provider) {
      return res.status(400).json({ success: false, message: '缺少提供商信息' });
    }

    const keyToUse = apiKey || API_KEYS[provider];
    if (!keyToUse) {
      return res.status(400).json({ success: false, message: '未配置 API Key' });
    }

    if (provider === 'openai' && !keyToUse.startsWith('sk-')) {
      return res.status(400).json({ success: false, message: 'OpenAI API Key 格式无效，应以 "sk-" 开头' });
    }

    let testUrl, testPayload, headers;

    switch (provider) {
      case 'openai':
        testUrl = (baseURL || 'https://api.openai.com/v1/chat/completions');
        testPayload = {
          model: model || 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: 'Hello' }],
          max_tokens: 5
        };
        headers = {
          Authorization: `Bearer ${keyToUse}`,
          'Content-Type': 'application/json'
        };
        break;

      case 'anthropic':
        testUrl = (baseURL || 'https://api.anthropic.com/v1/messages');
        testPayload = {
          model: model || 'claude-3-sonnet-20240229',
          messages: [{ role: 'user', content: 'Hello' }],
          max_tokens: 5
        };
        headers = {
          'x-api-key': keyToUse,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        };
        break;

      case 'qwen':
        testUrl = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
        testPayload = {
          model: model || 'qwen-plus',
          messages: [{ role: 'user', content: 'Hello' }],
          max_tokens: 5
        };
        headers = {
          Authorization: `Bearer ${keyToUse}`,
          'Content-Type': 'application/json'
        };
        break;

      default:
        return res.status(400).json({ success: false, message: `不支持的 AI 服务提供商: ${provider}` });
    }

    const response = await axios.post(testUrl, testPayload, { headers });

    return res.status(200).json({
      success: true,
      message: '连接成功',
      data: response.data
    });

  } catch (error) {
    console.error('API 连接测试失败:', error.response?.data || error.message);

    let errorMessage = '连接失败';
    if (error.response) {
      errorMessage = error.response.data?.error?.message || error.response.data?.error?.type || error.response.statusText || 'API 请求失败';
    } else if (error.request) {
      errorMessage = '网络错误：无法连接到 API 服务器';
    } else {
      errorMessage = error.message || '未知错误';
    }

    return res.status(error.response?.status || 500).json({
      success: false,
      message: errorMessage
    });
  }
}