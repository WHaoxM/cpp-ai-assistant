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
        res.status(200).json({ 
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
}