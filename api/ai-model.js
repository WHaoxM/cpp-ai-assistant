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
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      provider,
      apiKey,
      baseURL,
      model,
      messages,
      options = {}
    } = req.body || {};

    if (!provider || !Array.isArray(messages)) {
      return res.status(400).json({ error: '缺少必要参数' });
    }

    const keyToUse = apiKey || API_KEYS[provider];
    if (!keyToUse) {
      return res.status(400).json({ error: '未配置 API Key' });
    }

    if (provider === 'openai' && !keyToUse.startsWith('sk-')) {
      return res.status(400).json({ error: 'OpenAI API Key 格式无效' });
    }

    const cleanBaseURL = baseURL ? baseURL.replace(/[`\s]/g, '') : '';
    const modelToUse = model || 'gpt-3.5-turbo';

    let apiUrl;
    let payload;
    let headers;

    switch (provider) {
      case 'openai':
        apiUrl = cleanBaseURL || 'https://api.openai.com/v1/chat/completions';
        payload = {
          model: modelToUse,
          messages,
          temperature: options.temperature ?? 0.7,
          max_tokens: options.max_tokens ?? 1000
        };
        headers = {
          Authorization: `Bearer ${keyToUse}`,
          'Content-Type': 'application/json'
        };
        break;

      case 'anthropic':
        apiUrl = cleanBaseURL || 'https://api.anthropic.com/v1/messages';
        payload = {
          model: modelToUse,
          messages,
          temperature: options.temperature ?? 0.7,
          max_tokens: options.max_tokens ?? 1000
        };
        headers = {
          'x-api-key': keyToUse,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        };
        break;

      case 'qwen':
        apiUrl = `${cleanBaseURL || 'https://dashscope.aliyuncs.com/compatible-mode/v1'}/chat/completions`;
        payload = {
          model: modelToUse,
          messages,
          temperature: options.temperature ?? 0.7,
          max_tokens: options.max_tokens ?? 1000
        };
        headers = {
          Authorization: `Bearer ${keyToUse}`,
          'Content-Type': 'application/json'
        };
        break;

      default:
        return res.status(400).json({ error: `不支持的 provider: ${provider}` });
    }

    const response = await axios.post(apiUrl, payload, { headers });

    let result = '';
    if (provider === 'anthropic') {
      result = response.data?.content?.[0]?.text || '';
    } else {
      result = response.data?.choices?.[0]?.message?.content || '';
    }

    return res.status(200).json({ success: true, result });
  } catch (err) {
    const status = err.response?.status || 500;
    const message =
      err.response?.data?.error?.message ||
      err.response?.data?.message ||
      err.message ||
      'AI 请求失败';

    return res.status(status).json({
      success: false,
      error: message
    });
  }
}