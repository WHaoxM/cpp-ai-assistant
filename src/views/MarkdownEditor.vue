<template>
  <div class="markdown-editor-container">
    <div class="editor-header">
      <el-button type="primary" @click="goBack" class="back-button">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
      <h1 class="page-title">Markdown编辑器</h1>
      <div class="header-actions">
        <el-button type="success" @click="previewInNewWindow" class="preview-button">
          <el-icon><View /></el-icon>
          预览
        </el-button>
        <el-button type="primary" @click="saveMarkdown" class="save-button">
          <el-icon><FolderOpened /></el-icon>
          保存
        </el-button>
      </div>
    </div>
    
    <div class="editor-content">
      <div class="editor-panel">
        <h3>编辑区域</h3>
        <textarea 
          v-model="markdownContent" 
          class="markdown-input" 
          placeholder="在这里输入Markdown内容..."
          @input="updatePreview"
        ></textarea>
      </div>
      
      <div class="preview-panel">
        <h3>预览区域</h3>
        <div class="markdown-preview" v-html="renderedContent"></div>
      </div>
    </div>
    
    <el-dialog v-model="showSaveDialog" title="保存Markdown文件" width="500px">
      <el-form :model="saveForm" label-width="100px">
        <el-form-item label="文件名">
          <el-input v-model="saveForm.filename" placeholder="请输入文件名（不含扩展名）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showSaveDialog = false">取消</el-button>
          <el-button type="primary" @click="confirmSave">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { renderText } from '../utils/textUtils'
import { ElMessage } from 'element-plus'

export default {
  name: 'MarkdownEditor',
  setup() {
    const route = useRoute()
    const router = useRouter()
    
    let initialContent = ''
    const contentParam = route.query.content
    const storageId = route.query.storageId
    
    if (storageId) {
      const storedContent = localStorage.getItem(`markdown_content_${storageId}`)
      if (storedContent) {
        initialContent = storedContent
      }
    } else if (contentParam) {
      try {
        initialContent = decodeURIComponent(contentParam)
      } catch (e) {
        console.error('解码URL参数失败:', e)
        initialContent = contentParam
      }
    }
    
    const markdownContent = ref(initialContent || '# 新的Markdown文档\n\n开始编辑你的内容...')
    const renderedContent = ref('')
    const showSaveDialog = ref(false)
    const saveForm = ref({
      filename: ''
    })
    
    // 初始化内容
    const initContent = () => {
      // 尝试从路由参数获取内容
      const content = route.query.content
      if (content) {
        markdownContent.value = decodeURIComponent(content)
      }
      
      // 更新预览
      updatePreview()
    }
    
    // 更新预览
    const updatePreview = () => {
      renderedContent.value = renderText(markdownContent.value)
    }
    
    // 预览在新窗口
    const previewInNewWindow = () => {
      // 将内容存储到本地存储
      localStorage.setItem('currentMarkdownContent', markdownContent.value)
      
      // 在新窗口打开预览页面
      window.open('/markdown-viewer', '_blank')
    }
    
    // 保存Markdown
    const saveMarkdown = () => {
      saveForm.value.filename = `markdown_${new Date().getTime()}`
      showSaveDialog.value = true
    }
    
    // 确认保存
    const confirmSave = () => {
      if (!saveForm.value.filename.trim()) {
        ElMessage.error('请输入文件名')
        return
      }
      
      // 这里可以实现保存到本地文件的功能
      const blob = new Blob([markdownContent.value], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${saveForm.value.filename}.md`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      showSaveDialog.value = false
      ElMessage.success('保存成功')
    }
    
    // 返回
    const goBack = () => {
      router.go(-1)
    }
    
    onMounted(() => {
      initContent()
    })
    
    return {
      markdownContent,
      renderedContent,
      showSaveDialog,
      saveForm,
      updatePreview,
      previewInNewWindow,
      saveMarkdown,
      confirmSave,
      goBack
    }
  }
}
</script>

<style scoped>
.markdown-editor-container {
  padding: 20px;
  max-width: 100%;
  margin: 0 auto;
  background-color: #f5f7fa;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
  background-color: #fafafa;
  border-radius: 8px;
  padding: 15px 20px;
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

.header-actions {
  display: flex;
  gap: 10px;
}

.editor-content {
  display: flex;
  gap: 20px;
  height: 60vh;
}

.editor-panel, .preview-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.editor-panel h3, .preview-panel h3 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #303133;
  font-size: 1.2em;
  font-weight: 600;
}

.markdown-input {
  width: 100%;
  flex: 1;
  padding: 15px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  resize: none;
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
  background-color: #fcfcfc;
}

.markdown-preview {
  flex: 1;
  padding: 15px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background-color: white;
  overflow-y: auto;
  line-height: 1.6;
}

/* 预览区域的Markdown样式 */
.markdown-preview h1 {
  font-size: 1.8em;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
  margin-top: 20px;
  margin-bottom: 20px;
}

.markdown-preview h2 {
  font-size: 1.5em;
  font-weight: 600;
  color: #34495e;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
  margin-top: 24px;
  margin-bottom: 16px;
}

.markdown-preview h3 {
  font-size: 1.3em;
  font-weight: 600;
  color: #34495e;
  margin-top: 20px;
  margin-bottom: 12px;
}

.markdown-preview h4 {
  font-size: 1.2em;
  font-weight: 600;
  color: #34495e;
  margin-top: 18px;
  margin-bottom: 10px;
}

.markdown-preview h5 {
  font-size: 1.1em;
  font-weight: 600;
  color: #7f8c8d;
  margin-top: 16px;
  margin-bottom: 8px;
}

.markdown-preview h6 {
  font-size: 1em;
  font-weight: 600;
  color: #7f8c8d;
  margin-top: 14px;
  margin-bottom: 6px;
}

/* 段落样式 */
.markdown-preview p {
  margin: 16px 0;
  line-height: 1.8;
  color: #333;
}

/* 列表样式 */
.markdown-preview ul, 
.markdown-preview ol {
  margin: 16px 0;
  padding-left: 30px;
}

.markdown-preview li {
  margin: 8px 0;
}

/* 强调样式 */
.markdown-preview strong {
  font-weight: 600;
  color: #2c3e50;
}

.markdown-preview em {
  font-style: italic;
  color: #7f8c8d;
}

/* 链接样式 */
.markdown-preview a {
  color: #409eff;
  text-decoration: none;
}

.markdown-preview a:hover {
  text-decoration: underline;
}

/* 引用样式 */
.markdown-preview blockquote {
  margin: 20px 0;
  padding: 16px 20px;
  border-left: 4px solid #409eff;
  background-color: #ecf5ff;
  color: #606266;
  font-style: italic;
}

/* 代码块样式 */
.markdown-preview pre {
  background-color: #2d2d2d !important;
  border-radius: 8px;
  padding: 16px !important;
  overflow: auto;
  margin: 16px 0;
  border: none;
  color: #f8f8f2;
}

.markdown-preview code {
  font-family: 'Fira Code', 'Monaco', 'Consolas', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
}

.markdown-preview pre code {
  background: none !important;
  padding: 0 !important;
  margin: 0 !important;
  color: #f8f8f2;
}

/* 行内代码 */
.markdown-preview :not(pre) > code {
  background-color: #f5f7fa;
  padding: 2px 6px;
  border-radius: 3px;
  border: 1px solid #e4e7ed;
  color: #e74c3c;
  font-family: 'Fira Code', 'Monaco', 'Consolas', 'Courier New', monospace;
}

/* 表格样式 */
.markdown-preview table {
  border-collapse: collapse;
  width: 100%;
  margin: 16px 0;
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.markdown-preview table th,
.markdown-preview table td {
  border: 1px solid #dfe2e5;
  padding: 10px 15px;
  text-align: left;
}

.markdown-preview table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #303133;
}

/* 水平线 */
.markdown-preview hr {
  border: none;
  height: 1px;
  background-color: #ebeef5;
  margin: 24px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .editor-content {
    flex-direction: column;
    height: auto;
  }
  
  .editor-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .page-title {
    text-align: left;
    width: 100%;
    font-size: 1.5em;
  }
  
  .header-actions {
    width: 100%;
    justify-content: space-between;
    margin-top: 10px;
  }
  
  .editor-panel, .preview-panel {
    height: auto;
  }
}
</style>