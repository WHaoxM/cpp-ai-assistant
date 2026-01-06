<template>
  <div class="markdown-viewer-container">
    <div class="viewer-header">
      <el-button type="primary" @click="goBack" class="back-button">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
      <h1 v-if="title" class="page-title">{{ title }}</h1>
      <div class="header-actions">
        <el-button 
          v-if="isFromStorage" 
          type="success" 
          @click="importToQuestionBank" 
          class="import-button">
          导入题库
        </el-button>
        <el-select 
          v-if="markdownFiles.length > 0" 
          v-model="selectedFile" 
          placeholder="选择Markdown文件" 
          @change="onFileSelect"
          style="width: 200px; margin-right: 10px;"
        >
          <el-option
            v-for="file in markdownFiles"
            :key="file.name"
            :label="file.name"
            :value="file.name"
          />
        </el-select>
      </div>
    </div>
    
    <div class="markdown-content" v-html="renderedContent"></div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { renderText } from '../utils/textUtils'
import { getMarkdownFiles, importMarkdownToQuestionBank } from '../services/markdownService'
import { ElMessage, ElButton, ElSelect, ElOption } from 'element-plus'

export default {
  name: 'MarkdownViewer',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const renderedContent = ref('')
    const title = ref('')
    const markdownFiles = ref([])
    const selectedFile = ref('')
    const isFromStorage = ref(false)
    
    // 加载可用的Markdown文件列表
    const loadMarkdownFiles = async () => {
      try {
        const files = await getMarkdownFiles()
        markdownFiles.value = Object.keys(files).map(name => ({
          name,
          ...files[name]
        }))
      } catch (error) {
        console.error('加载Markdown文件列表失败:', error)
      }
    }
    
    // 获取Markdown内容（从路由参数或本地存储）
    const loadMarkdownContent = async (content = null) => {
      try {
        let markdownContent = content
        
        if (!markdownContent) {
          // 尝试从路由参数获取内容
          const routeContent = route.query.content
          if (routeContent) {
            // 如果内容是URL编码的，需要解码
            markdownContent = decodeURIComponent(routeContent)
          } else {
            // 尝试从存储ID获取内容
            const storageId = route.query.storageId
            if (storageId) {
              const storedContent = localStorage.getItem(`markdown_content_${storageId}`)
              if (storedContent) {
                markdownContent = storedContent
                isFromStorage.value = true
              }
            } else {
              // 如果没有路由参数，尝试从本地存储获取
              const localContent = localStorage.getItem('currentMarkdownContent')
              if (localContent) {
                markdownContent = localContent
              } else {
                renderedContent.value = '<p>未找到Markdown内容</p>'
                title.value = '空内容'
                return
              }
            }
          }
        }
        
        renderedContent.value = renderText(markdownContent)
        
        // 提取标题（取第一行或第一个标题）
        const lines = markdownContent.split('\n')
        for (const line of lines) {
          const trimmed = line.trim()
          if (trimmed.startsWith('# ')) {
            title.value = trimmed.substring(2)
            break
          } else if (trimmed && !trimmed.startsWith('!') && !trimmed.startsWith('[')) {
            title.value = trimmed.substring(0, 50) + (trimmed.length > 50 ? '...' : '')
            break
          }
        }
        if (!title.value && lines.length > 0) {
          title.value = lines[0].substring(0, 50) + (lines[0].length > 50 ? '...' : '')
        }
      } catch (error) {
        console.error('加载Markdown内容失败:', error)
        renderedContent.value = '<p>加载内容失败</p>'
        title.value = '加载失败'
      }
    }
    
    // 当选择文件时
    const onFileSelect = async (filename) => {
      if (!filename) return
      
      try {
        // 这里需要一个辅助函数来从文件名获取内容
        const files = await getMarkdownFiles()
        const fileContent = files[filename]?.content
        if (fileContent) {
          loadMarkdownContent(fileContent)
          title.value = filename.replace('.md', '')
        }
      } catch (error) {
        console.error('加载选中文件失败:', error)
        ElMessage.error('加载文件失败')
      }
    }
    
    // 导入到题库
    const importToQuestionBank = async () => {
      try {
        // 从当前显示的内容创建题目
        const routeContent = route.query.content
        const storageId = route.query.storageId
        
        let content = ''
        if (storageId) {
          content = localStorage.getItem(`markdown_content_${storageId}`)
        } else if (routeContent) {
          content = decodeURIComponent(routeContent)
        } else {
          content = localStorage.getItem('currentMarkdownContent')
        }
        
        if (!content) {
          ElMessage.error('没有可导入的内容')
          return
        }
        
        // 导入到题库
        const total = await importMarkdownToQuestionBank(title.value || '未命名题目', content)
        ElMessage.success(`成功导入到题库，当前共有 ${total} 道题目`)
      } catch (error) {
        console.error('导入题库失败:', error)
        ElMessage.error(`导入失败: ${error.message}`)
      }
    }
    
    const goBack = () => {
      router.go(-1) // 返回上一页
    }
    
    onMounted(async () => {
      await loadMarkdownFiles()
      loadMarkdownContent()
    })
    
    return {
      renderedContent,
      title,
      markdownFiles,
      selectedFile,
      onFileSelect,
      importToQuestionBank,
      goBack,
      isFromStorage
    }
  }
}
</script>

<style scoped>
.markdown-viewer-container {
  padding: 20px;
  max-width: 100%;
  margin: 0 auto;
  min-height: 100vh;
}

.viewer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.back-button {
  margin-right: 10px;
}

.page-title {
  margin: 0;
  flex: 1;
  text-align: center;
  font-size: 1.8em;
  font-weight: 600;
  color: #303133;
}

.import-button {
  margin-right: 10px;
}

.markdown-content {
  line-height: 1.8;
  color: #333;
  font-size: 16px;
}

/* 标题样式 */
.markdown-content h1 {
  font-size: 2em;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
  margin-top: 20px;
  margin-bottom: 20px;
}

.markdown-content h2 {
  font-size: 1.6em;
  font-weight: 600;
  color: #34495e;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
  margin-top: 24px;
  margin-bottom: 16px;
}

.markdown-content h3 {
  font-size: 1.4em;
  font-weight: 600;
  color: #34495e;
  margin-top: 20px;
  margin-bottom: 12px;
}

.markdown-content h4 {
  font-size: 1.2em;
  font-weight: 600;
  color: #34495e;
  margin-top: 18px;
  margin-bottom: 10px;
}

.markdown-content h5 {
  font-size: 1em;
  font-weight: 600;
  color: #7f8c8d;
  margin-top: 16px;
  margin-bottom: 8px;
}

.markdown-content h6 {
  font-size: 0.9em;
  font-weight: 600;
  color: #7f8c8d;
  margin-top: 14px;
  margin-bottom: 6px;
}

/* 段落样式 */
.markdown-content p {
  margin: 16px 0;
  line-height: 1.8;
}

/* 列表样式 */
.markdown-content ul, 
.markdown-content ol {
  margin: 16px 0;
  padding-left: 30px;
}

.markdown-content li {
  margin: 8px 0;
}

/* 强调样式 */
.markdown-content strong {
  font-weight: 600;
  color: #2c3e50;
}

.markdown-content em {
  font-style: italic;
  color: #7f8c8d;
}

/* 链接样式 */
.markdown-content a {
  color: #409eff;
  text-decoration: none;
}

.markdown-content a:hover {
  text-decoration: underline;
}

/* 引用样式 */
.markdown-content blockquote {
  margin: 20px 0;
  padding: 16px 20px;
  border-left: 4px solid #409eff;
  background-color: #ecf5ff;
  color: #606266;
  font-style: italic;
}

/* 代码块样式 */
.markdown-content pre {
  background-color: #2d2d2d !important;
  border-radius: 8px;
  padding: 16px !important;
  overflow: auto;
  margin: 16px 0;
  border: none;
  color: #f8f8f2;
}

.markdown-content code {
  font-family: 'Fira Code', 'Monaco', 'Consolas', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
}

.markdown-content pre code {
  background: none !important;
  padding: 0 !important;
  margin: 0 !important;
  color: #f8f8f2;
}

/* 行内代码 */
.markdown-content :not(pre) > code {
  background-color: #f5f7fa;
  padding: 2px 6px;
  border-radius: 3px;
  border: 1px solid #e4e7ed;
  color: #e74c3c;
  font-family: 'Fira Code', 'Monaco', 'Consolas', 'Courier New', monospace;
}

/* 表格样式 */
.markdown-content table {
  border-collapse: collapse;
  width: 100%;
  margin: 16px 0;
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.markdown-content table th,
.markdown-content table td {
  border: 1px solid #dfe2e5;
  padding: 10px 15px;
  text-align: left;
}

.markdown-content table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #303133;
}

/* 水平线 */
.markdown-content hr {
  border: none;
  height: 1px;
  background-color: #ebeef5;
  margin: 24px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .viewer-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .page-title {
    text-align: left;
    width: 100%;
    font-size: 1.5em;
  }
  
  .markdown-content {
    font-size: 14px;
  }
  
  .markdown-content h1 {
    font-size: 1.6em;
  }
  
  .markdown-content h2 {
    font-size: 1.4em;
  }
  
  .markdown-content h3 {
    font-size: 1.3em;
  }
}
</style>