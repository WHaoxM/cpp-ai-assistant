// AI服务，处理与AI模型的交互
import axios from 'axios';

// 默认配置
const DEFAULT_CONFIG = {
  model: 'qwen3-max',
  temperature: 0.7,
  max_tokens: 1000
};

// 自定义模型存储键名
const CUSTOM_MODELS_KEY = 'ai_custom_models';

// 从localStorage获取API配置
export const getAPIConfig = () => {
  const config = localStorage.getItem('ai_api_config');
  return config ? JSON.parse(config) : {
    provider: '',
    model: DEFAULT_CONFIG.model,
    temperature: 0.7,
    max_tokens: 1000,
    // 按提供商存储的配置
    providers: {
      openai: {
        apiKey: '',
        baseURL: ''
      },
      anthropic: {
        apiKey: '',
        baseURL: ''
      },
      qwen: {
        apiKey: '',
        baseURL: ''
      },
      iflow: {
        apiKey: '',
        baseURL: ''
      }
    }
  };
};

// 保存API配置到localStorage
export const saveAPIConfig = (config) => {
  localStorage.setItem('ai_api_config', JSON.stringify(config));
};

// 获取指定提供商的配置
export const getProviderConfig = (provider) => {
  const config = getAPIConfig();
  return config.providers?.[provider] || {
    apiKey: '',
    baseURL: ''
  };
};

// 保存指定提供商的配置
export const saveProviderConfig = (provider, providerConfig) => {
  const config = getAPIConfig();
  config.providers = config.providers || {};
  config.providers[provider] = providerConfig;
  saveAPIConfig(config);
};

// 自定义模型管理

// 获取所有自定义模型
export const getCustomModels = () => {
  const models = localStorage.getItem(CUSTOM_MODELS_KEY);
  return models ? JSON.parse(models) : [];
};

// 保存自定义模型
export const saveCustomModels = (models) => {
  localStorage.setItem(CUSTOM_MODELS_KEY, JSON.stringify(models));
};

// 添加自定义模型
export const addCustomModel = (model) => {
  const models = getCustomModels();
  
  // 验证必要字段
  if (!model.provider) {
    throw new Error('自定义模型必须指定提供商');
  }
  
  // 如果没有model字段，使用name作为model
  if (!model.model) {
    if (model.name) {
      model.model = model.name;
    } else {
      throw new Error('自定义模型必须指定模型名称');
    }
  }
  
  // 生成唯一ID
  model.id = model.id || `custom-${Date.now()}`;
  // 设置创建和更新时间
  model.createdAt = new Date().toISOString();
  model.updatedAt = new Date().toISOString();
  // 确保role和messageContent字段存在
  model.role = model.role || 'assistant';
  model.messageContent = model.messageContent || '';
  models.push(model);
  saveCustomModels(models);
  return model.id;
};

// 获取指定ID的自定义模型
export const getCustomModelById = (id) => {
  const models = getCustomModels();
  return models.find(model => model.id === id);
};

// 更新自定义模型
export const updateCustomModel = (id, updates) => {
  const models = getCustomModels();
  const index = models.findIndex(model => model.id === id);
  if (index === -1) {
    throw new Error('自定义模型不存在');
  }
  models[index] = {
    ...models[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  saveCustomModels(models);
  return models[index];
};

// 删除自定义模型
export const deleteCustomModel = (id) => {
  const models = getCustomModels();
  const updatedModels = models.filter(model => model.id !== id);
  saveCustomModels(updatedModels);
  return true;
};

// 获取OpenAI模型列表
export const getOpenAIModels = async (config) => {
  try {
    const response = await axios.post(
      '/api/get-models',
      {
        provider: config.provider,
        apiKey: config.apiKey,
        baseURL: config.baseURL
      }
    );
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: `获取模型列表失败: ${error.response?.data?.message || error.message}`
    };
  }
};

// 获取可部署的模型列表（如阿里云DashScope）
export const getDeployableModels = async (config) => {
  try {
    // 通过后端服务获取可部署模型列表
    const response = await axios.post(
      '/api/get-deployable-models',
      {
        provider: config.provider,
        apiKey: config.apiKey,
        baseURL: config.baseURL
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('获取可部署模型失败:', error);
    return {
      success: false,
      message: `获取可部署模型失败: ${error.response?.data?.message || error.message}`
    };
  }
};

// 测试API连接
export const testAPIConnection = async (config) => {
  try {
    console.log('===== 开始测试API连接 =====');
    console.log('输入config:', config);
    
    // 调用后端API测试连接
    console.log('发送请求到:', '/api/test-connection');
    console.log('请求数据:', config);
    const response = await axios.post('/api/test-connection', config);
    console.log('请求成功，收到响应:', response.data);
    return response.data;
  } catch (error) {
    console.error('API连接测试失败:', error);
    // 对于网络错误，提供更详细的说明
    if (error.message === 'Network Error') {
      return { 
        success: false, 
        message: `网络错误: 请确认后端服务是否已启动。请运行 'node server.js' 启动后端服务。` 
      };
    }
    return { 
      success: false, 
      message: `连接失败: ${error.response?.data?.message || error.message}` 
    };
  }
};

// 发送请求到AI模型
// 发送请求到AI模型
export const callAIModel = async (messages, options = {}) => {
  // 在调用 callAIModel 之前添加
  console.log('调用 callAIModel 时的 messages:', messages);
  console.log('messages 类型:', typeof messages, Array.isArray(messages));
  console.log('===== 开始调用AI模型 =====');
  console.log('输入options:', options);
  
  // 检查是否使用自定义模型 - 首先检查options.model
  const targetModel = options.model || DEFAULT_CONFIG.model;
  console.log('目标模型:', targetModel);
  
  const customModels = getCustomModels();
  console.log('自定义模型列表:', customModels);
  
  const customModel = customModels.find(m => m.id === targetModel || m.name === targetModel || m.model === targetModel);
  console.log('找到的自定义模型:', customModel);
  
  // 复制messages数组，避免修改原始数据
  let processedMessages = [];
  try {
    // 确保 messages 是数组，然后复制
    if (Array.isArray(messages)) {
      processedMessages = [...messages];
    } else {
      console.error('messages 参数不是数组，使用空数组:', messages);
      processedMessages = [];
    }
  } catch (error) {
    console.error('复制 messages 时出错:', error);
    processedMessages = [];
  }

  // 声明变量并设置默认值
  let provider = '';
  let apiKey = '';
  let baseURL = '';
  let model = '';

    // 如果是自定义模型，完全使用自定义模型的配置，不依赖全局配置
  if (customModel) {
    console.log('=== 进入自定义模型处理分支 ===');
    console.log('customModel 对象:', customModel);
    console.log('customModel.model 值:', customModel.model);
    
    model = customModel.model;
    console.log('自定义模型实际模型名称:', model);
    
    console.log('开始设置其他变量...');
    console.log('使用自定义模型:', customModel);
    provider = customModel.provider;
    console.log('自定义模型提供商:', provider);
    // 只从自定义模型获取API密钥，不依赖全局配置
    apiKey = customModel.apiKey || '';
    console.log('自定义模型API密钥:', apiKey ? '已设置' : '未设置');
    // 只从自定义模型获取baseURL，不依赖全局配置
    baseURL = customModel.baseURL || '';
    console.log('自定义模型baseURL:', baseURL);
    
    // 验证必要字段
    if (!model) {
      throw new Error(`自定义模型配置错误：模型 ${customModel.id} 缺少模型名称`);
    }
    
    // 安全地处理上下文内容
    if (customModel.context && typeof customModel.context === 'string') {
      console.log('处理自定义模型上下文:', customModel.context);
      try {
        // 确保 processedMessages 是数组
        if (Array.isArray(processedMessages)) {
          // 检查是否已有system message
          if (processedMessages.length > 0 && processedMessages[0]?.role === 'system') {
            // 替换现有system message的内容
            processedMessages[0] = {
              ...processedMessages[0],
              content: customModel.context
            };
          } else {
            // 添加system message
            processedMessages.unshift({
              role: 'system',
              content: customModel.context
            });
          }
        } else {
          console.error('processedMessages 不是数组，无法处理上下文');
          processedMessages = [{
            role: 'system',
            content: customModel.context
          }];
        }
      } catch (error) {
        console.error('处理自定义模型上下文时出错:', error);
        // 如果出错，继续执行而不中断
      }
    }
  } else {
    // 非自定义模型，使用默认模型和全局设置
    const config = getAPIConfig();
    console.log('获取的API配置:', config);
    
    const { provider: configProvider, model: configModel } = config;
    model = options.model || configModel || DEFAULT_CONFIG.model;
    console.log('使用标准模型:', model);
    
    provider = configProvider;
    
    // 如果provider是自定义模型ID，获取其实际提供商
    const customModelById = customModels.find(m => m.id === provider);
    console.log('通过provider查找自定义模型:', customModelById);
    if (customModelById) {
      provider = customModelById.provider;
      console.log('从自定义模型获取的提供商:', provider);
    }
    
    // 如果provider为空，尝试从模型名称推断提供商
    if (!provider) {
      // 从模型名称推断提供商
      console.log('提供商为空，从模型名称推断');
      if (model.toLowerCase().includes('gpt') || model.toLowerCase().includes('openai') || model.toLowerCase().includes('iflow')) {
        provider = 'openai';
      } else if (model.toLowerCase().includes('claude') || model.toLowerCase().includes('anthropic')) {
        provider = 'anthropic';
      } else if (model.toLowerCase().includes('qwen')) {
        provider = 'qwen';
      } else {
        // 默认使用openai
        provider = 'openai';
      }
      console.log('推断的提供商:', provider);
    }
    
    // 特殊处理iflow提供商，将其映射到openai提供商类型，因为它们的API格式相似
    if (provider === 'iflow') {
      console.log('检测到iflow提供商，映射到openai提供商类型');
      provider = 'openai';
    }
    
    // 从提供商配置中获取API密钥和baseURL
    console.log('从提供商配置获取API密钥和baseURL，提供商:', provider);
    const providerConfig = config.providers?.[provider];
    console.log('提供商配置:', providerConfig);
    apiKey = providerConfig?.apiKey || '';
    console.log('获取的API密钥:', apiKey ? '已设置' : '未设置');
    baseURL = providerConfig?.baseURL || '';
    console.log('获取的baseURL:', baseURL);
  }
  
  // 检查API密钥是否配置（对于自定义模型，使用其自身的API密钥）
  console.log('最终提供商:', provider);
  console.log('最终API密钥:', apiKey ? '已设置' : '未设置');
  console.log('最终baseURL:', baseURL);
  console.log('最终模型:', model);
  
  if (!apiKey) {
    console.error('API密钥未配置，无法发送请求');
    throw new Error('未配置API密钥');
  }
  
  // 构建请求选项，确保model使用正确的模型名称，而不是自定义模型ID
  const requestOptions = {
    temperature: options.temperature || DEFAULT_CONFIG.temperature,
    max_tokens: options.max_tokens || DEFAULT_CONFIG.max_tokens,
    ...options,
    model: model  // 确保model使用实际的模型名称，覆盖options中的模型ID
  };
  
  try {
    // 清理baseURL，移除可能的空格和反引号
    const cleanBaseURL = baseURL ? baseURL.replace(/[`\s]/g, '') : '';
    console.log('清理后的baseURL:', cleanBaseURL);
    
    // 构建请求数据
    const requestData = {
      provider,
      apiKey: apiKey ? '已设置' : '未设置', // 不记录完整的API密钥，只记录是否已设置
      baseURL: cleanBaseURL,
      model,
      messages: processedMessages.length,
      options: {
        ...requestOptions,
        model: model
      }
    };
    console.log('准备发送请求到后端，请求数据:', requestData);
    
    // 通过后端服务调用AI模型
    console.log('发送请求到:', '/api/ai-model');
    const response = await axios.post(
      '/api/ai-model',
      {
        provider,
        apiKey,
        baseURL: cleanBaseURL,
        model,
        messages: processedMessages,
        options: requestOptions
      }
    );
    console.log('请求成功，收到响应:', response.data);
    
    if (response.data.success) {
      return response.data.result;
    } else {
      throw new Error(response.data.error || 'AI模型调用失败');
    }
  } catch (error) {
    console.error('AI模型调用失败:', error);
    if (error.message === 'Network Error') {
      throw new Error('网络错误: 请确认后端服务是否已启动。请运行 "node server.js" 启动后端服务。');
    }
    
    // 正确处理错误信息
    let errorMessage;
    if (error.response?.data) {
      if (typeof error.response.data.error === 'string') {
        errorMessage = error.response.data.error;
      } else if (error.response.data.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error.response.data.error) {
        errorMessage = JSON.stringify(error.response.data.error);
      } else {
        errorMessage = error.response.data.message || error.response.data;
      }
    } else {
      errorMessage = error.message || '未知错误';
    }
    
    throw new Error(`AI模型调用失败: ${errorMessage}`);
  }
};

// 向AI提问
export const askAI = async (question, context = {}, options = {}) => {
  // 获取系统提示语，优先使用自定义模型的上下文
  const systemPrompt = options.context || '你是一个专业的C++ AI助手，专注于C++知识点讲解和题目分析。请提供详细、准确的解答。';
  
  const messages = [
    {
      role: 'system',
      content: systemPrompt
    },
    ...(Array.isArray(context.history) ? context.history : []),
    {
      role: 'user',
      content: question
    }
  ];
  
  return callAIModel(messages, options);
};

// 分析题目
export const analyzeQuestion = async (questionData, options = {}) => {
  // 获取系统提示语，优先使用自定义模型的上下文
  const systemPrompt = options.context || '你是一个专业的C++ AI助手，负责分析C++题目。请提供详细的分析，包括：1. 题目考点 2. 解题思路 3. 正确答案解析 4. 常见错误分析 5. 相关知识点延伸。';
  
  const messages = [
    {
      role: 'system',
      content: systemPrompt
    },
    {
      role: 'user',
      content: `请分析以下C++题目：\n\n题目类型：${questionData.type === 'single_choice' ? '单选题' : 
               questionData.type === 'fill_blank' ? '填空题' : 
               questionData.type === 'judgment' ? '判断题' : 
               questionData.type === 'write_result' ? '写结果题' : '写程序题'}\n\n题目内容：${questionData.question}\n\n选项：${JSON.stringify(questionData.options || [])}\n\n正确答案：${questionData.answer}\n\n现有解析：${questionData.explanation}\n\n知识点：${questionData.knowledge_point}\n\n难度：${questionData.difficulty}`
    }
  ];
  
  return callAIModel(messages, options);
};

// 微调相关函数
export const createFineTuningJob = async (trainingFileId, options = {}) => {
  const config = getAPIConfig();
  const { provider, apiKey, baseURL } = config;
  
  if (!apiKey) {
    throw new Error('未配置API密钥');
  }
  
  // 微调功能通常需要后端实现，这里简化处理
  throw new Error('微调功能需要通过后端服务实现');
};

// 获取微调任务状态
export const getFineTuningJob = async (jobId) => {
  const config = getAPIConfig();
  const { provider, apiKey, baseURL } = config;
  
  if (!apiKey) {
    throw new Error('未配置API密钥');
  }
  
  // 微调功能通常需要后端实现，这里简化处理
  throw new Error('微调功能需要通过后端服务实现');
};

// 列出微调任务
export const listFineTuningJobs = async (options = {}) => {
  const config = getAPIConfig();
  const { provider, apiKey, baseURL } = config;
  
  if (!apiKey) {
    throw new Error('未配置API密钥');
  }
  
  // 微调功能通常需要后端实现，这里简化处理
  throw new Error('微调功能需要通过后端服务实现');
};