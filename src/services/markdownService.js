// Markdown 文件管理服务
import { saveQuestions, loadQuestions } from './questionService'

// 存储 Markdown 文件的本地模拟（实际部署到 Vercel 时可以使用 Vercel Blob 或其他存储）
const MARKDOWN_STORAGE_KEY = 'markdown_files'

/**
 * 保存 Markdown 内容到本地存储
 * @param {string} filename - 文件名
 * @param {string} content - Markdown 内容
 * @returns {Promise<void>}
 */
export const saveMarkdownFile = async (filename, content) => {
  try {
    // 从本地存储获取现有文件
    const existingFiles = await getMarkdownFiles()
    
    // 添加新文件
    existingFiles[filename] = {
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    // 保存回本地存储
    localStorage.setItem(MARKDOWN_STORAGE_KEY, JSON.stringify(existingFiles))
  } catch (error) {
    console.error('保存 Markdown 文件失败:', error)
    throw error
  }
}

/**
 * 从本地存储加载 Markdown 文件
 * @param {string} filename - 文件名
 * @returns {Promise<string|null>} - Markdown 内容或 null
 */
export const loadMarkdownFile = async (filename) => {
  try {
    const files = await getMarkdownFiles()
    const file = files[filename]
    return file ? file.content : null
  } catch (error) {
    console.error('加载 Markdown 文件失败:', error)
    return null
  }
}

/**
 * 获取所有 Markdown 文件列表
 * @returns {Promise<Object>} - 文件对象
 */
export const getMarkdownFiles = async () => {
  try {
    const stored = localStorage.getItem(MARKDOWN_STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch (error) {
    console.error('获取 Markdown 文件列表失败:', error)
    return {}
  }
}

/**
 * 删除 Markdown 文件
 * @param {string} filename - 文件名
 * @returns {Promise<void>}
 */
export const deleteMarkdownFile = async (filename) => {
  try {
    const existingFiles = await getMarkdownFiles()
    
    if (existingFiles[filename]) {
      delete existingFiles[filename]
      localStorage.setItem(MARKDOWN_STORAGE_KEY, JSON.stringify(existingFiles))
    }
  } catch (error) {
    console.error('删除 Markdown 文件失败:', error)
    throw error
  }
}

/**
 * 将 Markdown 文件转换为题目对象并添加到题库
 * @param {string} filename - 文件名
 * @param {string} content - Markdown 内容
 * @returns {Promise<number>} - 更新后的题目总数
 */
export const importMarkdownToQuestionBank = async (filename, content) => {
  try {
    // 解析 Markdown 内容为题目对象
    const question = parseMarkdownToQuestion(content, filename)
    
    // 添加到题库
    const allQuestions = await loadQuestions()
    allQuestions.push(question)
    
    // 保存到题库
    const total = await saveQuestions(allQuestions)
    
    return total
  } catch (error) {
    console.error('导入 Markdown 到题库失败:', error)
    throw error
  }
}

/**
 * 解析 Markdown 内容为题目对象
 * @param {string} content - Markdown 内容
 * @param {string} filename - 文件名
 * @returns {Object} - 题目对象
 */
const parseMarkdownToQuestion = (content, filename) => {
  // 简单解析 Markdown 内容
  const lines = content.split('\n')
  let questionText = ''
  let answerText = ''
  let explanation = ''
  let knowledgePoint = ''
  let difficulty = 'medium'
  let title = filename.replace('.md', '')
  
  let currentSection = ''
  
  for (const line of lines) {
    const trimmed = line.trim()
    
    // 检查标题
    if (trimmed.startsWith('# ')) {
      title = trimmed.substring(2)
    }
    // 检查二级标题
    else if (trimmed.startsWith('## ')) {
      currentSection = trimmed.substring(3).toLowerCase()
    }
    // 检查代码块开始
    else if (trimmed.startsWith('```')) {
      // 跳过代码块标记行
      continue
    }
    // 检查是否在代码块内
    else if (!trimmed.startsWith('```') && currentSection.includes('代码') || currentSection.includes('code')) {
      if (!answerText) {
        answerText = trimmed
      } else {
        answerText += '\n' + trimmed
      }
    }
    // 根据不同部分存储内容
    else if (currentSection.includes('题目') || currentSection.includes('question')) {
      if (!questionText) {
        questionText = trimmed
      } else {
        questionText += ' ' + trimmed
      }
    }
    else if (currentSection.includes('答案') || currentSection.includes('answer')) {
      if (!answerText) {
        answerText = trimmed
      } else {
        answerText += '\n' + trimmed
      }
    }
    else if (currentSection.includes('讲解') || currentSection.includes('思路') || currentSection.includes('solution')) {
      if (!explanation) {
        explanation += trimmed
      } else {
        explanation += '\n' + trimmed
      }
    }
    else if (currentSection.includes('知识点') || currentSection.includes('knowledge')) {
      if (!knowledgePoint) {
        knowledgePoint = trimmed
      } else {
        knowledgePoint += ' ' + trimmed
      }
    }
    else if (currentSection.includes('难度') || currentSection.includes('difficulty')) {
      difficulty = trimmed
    }
    else if (!currentSection && trimmed) {
      // 如果还没有确定部分，且当前行不为空，则默认为题目内容
      if (!questionText) {
        questionText = trimmed
      } else {
        questionText += ' ' + trimmed
      }
    }
  }
  
  // 生成唯一的 ID
  const id = Date.now().toString() + Math.random().toString(36).substr(2, 5)
  
  return {
    id,
    question: questionText || title,
    answer: answerText,
    explanation: explanation,
    knowledge_point: knowledgePoint,
    difficulty: difficulty,
    type: 'write_code',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
}