const express = require('express');
const axios = require('axios');
const cors = require('cors');

const router = express.Router();

// API密钥配置（在实际部署时，应使用环境变量存储）
const API_KEYS = {
  openai: process.env.OPENAI_API_KEY || '',
  anthropic: process.env.ANTHROPIC_API_KEY || '',
  qwen: process.env.QWEN_API_KEY || 'sk-e55031fd531a4575884669ff9fe8dd65'
};

// 测试API连接的端点
router.post('/test-connection', async (req, res) => {
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
    
    res.json({ success: true, message: '连接成功', data: response.data });
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
});

// AI模型调用的端点
router.post('/ai-model', async (req, res) => {
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
    
    res.json({ success: true, result });
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
});

// 获取模型列表的端点
router.post('/get-models', async (req, res) => {
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
        
        res.json({ 
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
});

// 获取可部署的模型列表端点（如阿里云DashScope）
router.post('/get-deployable-models', async (req, res) => {
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
      case 'qwen':
      case 'dashscope':
        // 清理baseURL，移除空格和反引号
        const cleanBaseURL = baseURL ? baseURL.replace(/[`\s]/g, '') : '';
        
        // 正确构建API URL，避免路径重复
        let apiHost = 'https://dashscope.aliyuncs.com';
        
        if (cleanBaseURL) {
          // 如果baseURL包含路径或查询参数，只保留主机部分
          try {
            const url = new URL(cleanBaseURL);
            apiHost = `${url.protocol}//${url.host}`;
          } catch (e) {
            // 如果URL解析失败，使用默认主机
            console.error('URL解析失败，使用默认主机:', cleanBaseURL);
          }
        }
        
        // 构建完整的API URL
        modelsUrl = `${apiHost}/api/v1/deployments/models`;
        headers = {
          'Authorization': `Bearer ${keyToUse}`,
          'Content-Type': 'application/json'
        };
        
        // 递归获取所有可部署模型的函数
        async function getAllModels(page_no = 1, page_size = 100) {
          const response = await axios.get(modelsUrl, { 
            headers, 
            params: {
              page_no,
              page_size
            }
          });
          
          const data = response.data;
          let allModels = data.output?.models || [];
          
          // 如果有更多数据，继续请求下一页
          if (data.output?.page_no * data.output?.page_size < data.output?.total) {
            const nextPageModels = await getAllModels(page_no + 1, page_size);
            allModels = [...allModels, ...nextPageModels];
          }
          
          return allModels;
        }
        
        // 获取所有模型
        const allModels = await getAllModels();
        
        // 返回包含所有模型的响应
        res.json({ 
          success: true, 
          models: {
            request_id: `batch-${Date.now()}`,
            output: {
              models: allModels,
              page_no: 1,
              page_size: allModels.length,
              total: allModels.length
            }
          } 
        });
        return;
        
      default:
        return res.status(400).json({ success: false, message: `暂不支持从 ${provider} 获取可部署模型列表` });
    }

  } catch (error) {
    console.error('获取可部署模型列表失败:', error);
    
    let errorMessage = '获取可部署模型列表失败';
    if (error.response) {
      errorMessage = error.response.data?.message || error.response.statusText || 'API请求失败';
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
});

module.exports = router;