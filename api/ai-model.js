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
    const { provider, apiKey, baseURL, model, messages, options = {} } = req.body;
    
    // 清理baseURL，移除可能的空格和反引号
    const cleanBaseURL = baseURL ? baseURL.replace(/[`\s]/g, '') : '';
    
    // 调试日志
    console.log('接收到AI模型调用请求:', {
      provider,
      model,
      messages: messages.length,
      options: {
        ...options,
        baseURL: cleanBaseURL
      }
    });

    // 验证必要参数
    if (!provider || !messages) {
      return res.status(400).json({ error: '缺少必要参数' });
    }

    // 使用从前端传来的API密钥，如果为空则尝试使用环境变量中的密钥
    const keyToUse = apiKey || API_KEYS[provider];
    if (!keyToUse) {
      return res.status(400).json({ error: '未配置API密钥' });
    }

    // 根据provider验证API密钥格式
    if (provider === 'openai' && !keyToUse.startsWith('sk-')) {
      return res.status(400).json({ error: 'OpenAI API密钥格式无效，应以"sk-"开头' });
    }

    let apiUrl, payload, headers;

    // 确定模型名称，优先使用model参数（已经是实际的模型名称），忽略options.model（可能是自定义模型ID）
    const modelToUse = model || 'gpt-3.5-turbo';

    switch (provider) {
      case 'openai':
        apiUrl = cleanBaseURL || 'https://api.openai.com/v1/chat/completions';
        payload = {
          model: modelToUse,
          messages: messages,
          temperature: options.temperature || 0.7,
          max_tokens: options.max_tokens || 1000
        };
        headers = {
          'Authorization': `Bearer ${keyToUse}`,
          'Content-Type': 'application/json'
        };
        break;
        
      case 'anthropic':
        apiUrl = cleanBaseURL || 'https://api.anthropic.com/v1/messages';
        payload = {
          model: modelToUse,
          messages: messages,
          max_tokens: options.max_tokens || 1000,
          temperature: options.temperature || 0.7
        };
        headers = {
          'x-api-key': keyToUse,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        };
        break;
        
      case 'qwen':
        // 使用传入的baseURL，如果没有则使用默认值
        const qwenBaseURL = cleanBaseURL || 'https://dashscope.aliyuncs.com/compatible-mode/v1';
        apiUrl = `${qwenBaseURL}/chat/completions`;
        payload = {
          model: modelToUse,
          messages: messages,
          temperature: options.temperature || 0.7,
          max_tokens: options.max_tokens || 1000
        };
        headers = {
          'Authorization': `Bearer ${keyToUse}`,
          'Content-Type': 'application/json'
        };
        break;
        
      default:
        return res.status(400).json({ error: `不支持的AI服务提供商: ${provider}` });
    }

    // 发送AI模型请求
    const response = await axios.post(apiUrl, payload, { headers });
    
    // 根据提供商格式化响应
    let result;
    switch (provider) {
      case 'openai':
      case 'qwen':
        result = response.data.choices[0].message.content;
        break;
      case 'anthropic':
        result = response.data.content[0].text;
        break;
      default:
        result = '';
    }
    
    res.status(200).json({ success: true, result });
  } catch (error) {
    console.error('AI模型调用失败:', error.response?.data || error.message);
    
    let errorMessage = 'AI模型调用失败';
    if (error.response) {
      // 专门处理OpenAI的错误消息
      if (error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error.message || error.response.data.error.type;
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
      error: errorMessage 
    });
  }
}