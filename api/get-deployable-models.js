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

    let modelsUrl;
    let headers;

    switch (provider) {
      case 'qwen':
      case 'dashscope':
        const cleanBaseURL = baseURL ? baseURL.replace(/[`\s]/g, '') : '';
        let apiHost = 'https://dashscope.aliyuncs.com';

        if (cleanBaseURL) {
          try {
            const url = new URL(cleanBaseURL);
            apiHost = `${url.protocol}//${url.host}`;
          } catch (e) {
            console.error('URL解析失败，使用默认主机:', cleanBaseURL);
          }
        }

        modelsUrl = `${apiHost}/api/v1/deployments/models`;
        headers = {
          'Authorization': `Bearer ${keyToUse}`,
          'Content-Type': 'application/json'
        };

        // 递归获取所有可部署模型
        async function getAllModels(page_no = 1, page_size = 100) {
          const response = await axios.get(modelsUrl, {
            headers,
            params: { page_no, page_size }
          });

          const data = response.data;
          let allModels = data.output?.models || [];

          if (data.output?.page_no * data.output?.page_size < data.output?.total) {
            const nextPageModels = await getAllModels(page_no + 1, page_size);
            allModels = [...allModels, ...nextPageModels];
          }

          return allModels;
        }

        const allModels = await getAllModels();

        return res.status(200).json({
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

      default:
        return res.status(400).json({
          success: false,
          message: `暂不支持从 ${provider} 获取可部署模型列表`
        });
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

    return res.status(error.response?.status || 500).json({
      success: false,
      message: errorMessage
    });
  }
}