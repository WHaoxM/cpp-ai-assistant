// 题目数据服务

// 存储键名
const STORAGE_KEY = 'cpp_questions';

// 从JSONL文件加载题目数据
export const loadQuestionsFromFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        let content = e.target.result;
        // 移除BOM（字节顺序标记），如果存在
        if (content.charCodeAt(0) === 0xFEFF) {
          content = content.slice(1);
        }
        
        // 首先尝试将整个文件解析为JSON
        try {
          const data = JSON.parse(content);
          // 检查是否是数组格式
          if (Array.isArray(data)) {
            resolve(data);
          } else if (data.dataset && Array.isArray(data.dataset)) {
            resolve(data.dataset);
          } else if (data.questions && Array.isArray(data.questions)) {
            resolve(data.questions);
          } else {
            resolve([]);
          }
          return;
        } catch (singleJsonError) {
          // 普通JSON解析失败，尝试按JSONL格式解析
          // JSONL文件的特征：包含多个换行符，并且每行都是独立的JSON对象
          const isProbablyJsonl = content.includes('\n{') && content.trim().split('\n').length > 2;
          
          if (isProbablyJsonl) {
            const lines = content.split('\n');
            const questions = lines
              .filter(line => line.trim())
              .map((line, index) => {
                const data = JSON.parse(line);
                // 检查是否有 dataset 字段
                if (data.dataset && Array.isArray(data.dataset)) {
                  return data.dataset;
                } else if (data.questions && Array.isArray(data.questions)) {
                  return data.questions;
                } else {
                  // 单个题目对象
                  return data;
                }
              })
              .flat();
            resolve(questions);
            return;
          }
          
          // 如果都失败，返回空数组
          resolve([]);
        }
      } catch (error) {
        reject(new Error('文件解析失败：' + error.message));
      }
    };
    reader.onerror = () => {
      reject(new Error('文件读取失败'));
    };
    reader.readAsText(file);
  });
};

// 从本地存储加载题目数据
export const loadQuestions = async () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    // 如果本地存储为空，返回模拟数据
    return [
      {
        id: 1,
        type: 'single_choice',
        question: '关于关键字class和typename，下列表述中正确的是（ ）。',
        options: ['程序中所有的typename都可以替换为class', '程序中部分typename都可以替换为class', '程序中所有的class都可以替换为typename', '程序中所有的class都不可以替换为typename'],
        answer: 'A',
        explanation: '在模板参数声明中，class和typename在大多数情况下可以互换，但并非所有情况。在模板声明中，typename主要用于表示依赖类型名，class也可用。但本题标准答案为A，应理解为在模板参数声明场景下，typename和class可互换。',
        knowledge_point: '模板参数声明',
        difficulty: 'easy'
      },
      {
        id: 2,
        type: 'single_choice',
        question: '在进行了任何C++流的操作后，都可以用C++流的有关成员函数检测流的状态；其中只能用于检测输入操作的函数名是（ ）。',
        options: ['fail()', 'eof()', 'good()', 'bad()'],
        answer: 'B',
        explanation: 'eof()函数专门用于检测输入流是否到达文件尾，仅适用于输入操作。其他三个函数（fail、good、bad）可以检测任何流的状态（输入/输出）。',
        knowledge_point: 'C++流状态检测',
        difficulty: 'medium'
      }
    ];
  } catch (error) {
    console.error('加载题目失败：', error);
    return [];
  }
};

// 保存题目到本地存储
export const saveQuestions = async (questions) => {
  try {
    // 确保题目有唯一ID
    const questionsWithIds = questions.map((q, index) => ({
      ...q,
      id: q.id || Date.now() + index
    }));
    
    // 获取现有题目
    const existingQuestions = await loadQuestions();
    
    // 合并题目，去重
    const mergedQuestions = [...existingQuestions];
    const existingIds = new Set(existingQuestions.map(q => q.id));
    
    // 记录新导入的题目ID
    const newQuestionIds = [];
    
    // 添加新题目
    questionsWithIds.forEach(q => {
      if (!existingIds.has(q.id)) {
        mergedQuestions.push(q);
        newQuestionIds.push(q.id);
      } else {
        // 更新现有题目
        const index = mergedQuestions.findIndex(existing => existing.id === q.id);
        if (index !== -1) {
          mergedQuestions[index] = q;
        }
      }
    });
    
    // 保存到本地存储
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedQuestions));
    
    // 保存新导入的题目ID作为上次导入记录
    if (newQuestionIds.length > 0) {
      await saveLastImportedQuestions(newQuestionIds);
    }
    
    return mergedQuestions.length;
  } catch (error) {
    console.error('保存题目失败：', error);
    throw new Error('保存题目失败：' + error.message);
  }
};

// 获取指定ID的题目
export const getQuestionById = async (id) => {
  const questions = await loadQuestions();
  return questions.find(q => q.id === id);
};

// 搜索题目
export const searchQuestions = async (keyword, type = '') => {
  const questions = await loadQuestions();
  return questions.filter(q => {
    const typeMatch = !type || q.type === type;
    const keywordMatch = !keyword || q.question.includes(keyword) || q.knowledge_point.includes(keyword);
    return typeMatch && keywordMatch;
  });
};

// 按类型分组获取题目数量
export const getQuestionCountByType = async () => {
  const questions = await loadQuestions();
  const counts = {
    single_choice: 0,
    fill_blank: 0,
    judgment: 0,
    write_result: 0,
    write_code: 0
  };
  
  questions.forEach(q => {
    if (counts[q.type] !== undefined) {
      counts[q.type]++;
    }
  });
  
  return counts;
};

// 清空所有题目
export const clearQuestions = async () => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(`${STORAGE_KEY}_last_import`);
  return true;
};

// 保存上次导入的题目ID
export const saveLastImportedQuestions = async (questionIds) => {
  localStorage.setItem(`${STORAGE_KEY}_last_import`, JSON.stringify(questionIds));
};

// 获取上次导入的题目ID
export const getLastImportedQuestions = async () => {
  const stored = localStorage.getItem(`${STORAGE_KEY}_last_import`);
  return stored ? JSON.parse(stored) : [];
};

// 删除指定ID的题目
export const deleteQuestion = async (id) => {
  const questions = await loadQuestions();
  const updatedQuestions = questions.filter(q => q.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedQuestions));
  return updatedQuestions.length;
};

// 批量删除题目
export const deleteQuestions = async (ids) => {
  const questions = await loadQuestions();
  const updatedQuestions = questions.filter(q => !ids.includes(q.id));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedQuestions));
  return updatedQuestions.length;
};

// 删除上次导入的题目
export const deleteLastImportedQuestions = async () => {
  const lastImportedIds = await getLastImportedQuestions();
  if (lastImportedIds.length === 0) {
    return 0;
  }
  return deleteQuestions(lastImportedIds);
};

// 微调数据相关功能

// 存储键名
const FINE_TUNE_STORAGE_KEY = 'cpp_fine_tune_configs';

// 保存微调配置
// 配置包括：配置ID、模型名称、训练参数、关联的题目ID列表、状态
// 状态包括：created, training, completed, failed
// @param {Object} config - 微调配置
// @returns {string} - 配置ID
// @example
// {
//   model: 'gpt-3.5-turbo',
//   questionIds: [1, 2, 3],
//   parameters: {
//     temperature: 0.7,
//     max_tokens: 1000
//   },
//   status: 'created'
// }
export const saveFineTuneConfig = async (config) => {
  try {
    // 获取现有配置
    const existingConfigs = await getFineTuneConfigs();
    
    // 生成配置ID
    const configId = config.id || `ft-${Date.now()}`;
    
    // 创建新配置
    const newConfig = {
      id: configId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...config,
    };
    
    // 合并配置
    const updatedConfigs = [...existingConfigs.filter(c => c.id !== configId), newConfig];
    
    // 保存到本地存储
    localStorage.setItem(FINE_TUNE_STORAGE_KEY, JSON.stringify(updatedConfigs));
    
    return configId;
  } catch (error) {
    console.error('保存微调配置失败：', error);
    throw new Error('保存微调配置失败：' + error.message);
  }
};

// 获取所有微调配置
export const getFineTuneConfigs = async () => {
  try {
    const stored = localStorage.getItem(FINE_TUNE_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('获取微调配置失败：', error);
    return [];
  }
};

// 获取指定ID的微调配置
export const getFineTuneConfigById = async (id) => {
  const configs = await getFineTuneConfigs();
  return configs.find(c => c.id === id);
};

// 更新微调配置
export const updateFineTuneConfig = async (id, updates) => {
  try {
    const configs = await getFineTuneConfigs();
    const index = configs.findIndex(c => c.id === id);
    
    if (index === -1) {
      throw new Error('微调配置不存在');
    }
    
    configs[index] = {
      ...configs[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem(FINE_TUNE_STORAGE_KEY, JSON.stringify(configs));
    return configs[index];
  } catch (error) {
    console.error('更新微调配置失败：', error);
    throw new Error('更新微调配置失败：' + error.message);
  }
};

// 删除微调配置
export const deleteFineTuneConfig = async (id) => {
  try {
    const configs = await getFineTuneConfigs();
    const updatedConfigs = configs.filter(c => c.id !== id);
    localStorage.setItem(FINE_TUNE_STORAGE_KEY, JSON.stringify(updatedConfigs));
    return true;
  } catch (error) {
    console.error('删除微调配置失败：', error);
    throw new Error('删除微调配置失败：' + error.message);
  }
};

// 保存题目与微调配置的关联
export const associateQuestionsWithFineTune = async (questionIds, configId) => {
  try {
    // 更新微调配置的题目ID列表
    const config = await getFineTuneConfigById(configId);
    if (!config) {
      throw new Error('微调配置不存在');
    }
    
    return updateFineTuneConfig(configId, {
      questionIds: [...new Set([...(config.questionIds || []), ...questionIds])]
    });
  } catch (error) {
    console.error('关联题目与微调配置失败：', error);
    throw new Error('关联题目与微调配置失败：' + error.message);
  }
};

// 获取与指定微调配置关联的题目
export const getQuestionsByFineTuneConfig = async (configId) => {
  try {
    const config = await getFineTuneConfigById(configId);
    if (!config || !config.questionIds || config.questionIds.length === 0) {
      return [];
    }
    
    const allQuestions = await loadQuestions();
    return allQuestions.filter(q => config.questionIds.includes(q.id));
  } catch (error) {
    console.error('获取与微调配置关联的题目失败：', error);
    return [];
  }
};

// 获取与指定题目关联的微调配置
export const getFineTuneConfigsByQuestion = async (questionId) => {
  try {
    const configs = await getFineTuneConfigs();
    return configs.filter(c => c.questionIds && c.questionIds.includes(questionId));
  } catch (error) {
    console.error('获取与题目关联的微调配置失败：', error);
    return [];
  }
};

// 更新微调配置的状态
export const updateFineTuneStatus = async (configId, status) => {
  try {
    return updateFineTuneConfig(configId, {
      status: status
    });
  } catch (error) {
    console.error('更新微调配置状态失败：', error);
    throw new Error('更新微调配置状态失败：' + error.message);
  }
};

// 获取所有微调配置的统计信息
export const getFineTuneStats = async () => {
  try {
    const configs = await getFineTuneConfigs();
    
    // 按状态统计
    const stats = {
      total: configs.length,
      created: 0,
      training: 0,
      completed: 0,
      failed: 0,
      cancelled: 0
    };
    
    configs.forEach(config => {
      if (stats[config.status] !== undefined) {
        stats[config.status]++;
      }
    });
    
    return stats;
  } catch (error) {
    console.error('获取微调统计信息失败：', error);
    return {
      total: 0,
      created: 0,
      training: 0,
      completed: 0,
      failed: 0,
      cancelled: 0
    };
  }
};

// 为微调准备训练数据
export const prepareFineTuningData = async (questionIds) => {
  try {
    const questions = await loadQuestions();
    const selectedQuestions = questions.filter(q => questionIds.includes(q.id));
    
    // 转换为微调所需的格式
    const fineTuningData = selectedQuestions.map(q => {
      return {
        prompt: `请分析以下C++题目：\n\n题目类型：${q.type === 'single_choice' ? '单选题' : 
               q.type === 'fill_blank' ? '填空题' : 
               q.type === 'judgment' ? '判断题' : 
               q.type === 'write_result' ? '写结果题' : '写程序题'}\n\n题目内容：${q.question}\n\n选项：${JSON.stringify(q.options || [])}\n\n知识点：${q.knowledge_point}\n\n难度：${q.difficulty}`,
        completion: `\n\n1. 题目考点：${q.knowledge_point || '未分类'}\n2. 正确答案：${q.answer}\n3. 答案解读：${q.explanation || '暂无解析'}\n4. 常见错误：${q.common_mistakes || '暂无常见错误'}`
      };
    });
    
    return fineTuningData;
  } catch (error) {
    console.error('准备微调数据失败：', error);
    throw new Error('准备微调数据失败：' + error.message);
  }
};