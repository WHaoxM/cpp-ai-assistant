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
    const { provider, apiKey, baseURL, model } = req.body;

    // 验证必要参数
    if (!provider) {
      return res.status(400).json({ success: false, message: '缺少提供商信息' });
    }

    // 使用从前端传来的API密钥，如果为空则尝试使用环境变量中的密钥
    const keyToUse = apiKey || API_KEYS[provider];
    if (!keyToUse) {
      return res.status(400).json({ success: false, message: '未配置API密钥' });
    }

    // 根据provider验证API密钥格式
    if (provider === 'openai' && !keyToUse.startsWith('sk-')) {
      return res.status(400).json({ success: false, message: 'OpenAI API密钥格式无效，应以"sk-"开头' });
    }

    let testUrl, testPayload, headers;

    switch (provider) {
      case 'openai':
        testUrl = baseURL || 'https://api.openai.com/v1/chat/completions';
        testPayload = {
          model: model || 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: 'Hello' }],
          max_tokens: 5
        };
        headers = {
          'Authorization': `Bearer ${keyToUse}`,
          'Content-Type': 'application/json'
        };
        break;
        
      case 'anthropic':
        testUrl = baseURL || 'https://api.anthropic.com/v1/messages';
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
          'Authorization': `Bearer ${keyToUse}`,
          'Content-Type': 'application/json'
        };
        break;
        
      default:
        return res.status(400).json({ success: false, message: `不支持的AI服务提供商: ${provider}` });
    }

    // 发送测试请求
    const response = await axios.post(testUrl, testPayload, { headers });
    
    res.status(200).json({ success: true, message: '连接成功', data: response.data });
  } catch (error) {
    console.error('API连接测试失败:', error.response?.data || error.message);
    
    let errorMessage = '连接失败';
    if (error.response) {
      // 专门处理OpenAI的错误消息
      if (error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error.message || error.response.data.error.type || 'API请求失败';
      } else {
        errorMessage = error.response.statusText || 'API请求失败';
      }
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