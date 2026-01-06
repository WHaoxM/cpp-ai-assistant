<template>
  <div class="markdown-upload-container">
    <div class="upload-header">
      <el-button type="primary" @click="goBack" class="back-button">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
      <h1 class="page-title">Markdown 文件管理</h1>
      <div class="header-spacer"></div>
    </div>
    
    <div class="upload-section">
      <el-upload
        class="upload-area"
        drag
        :auto-upload="false"
        :show-file-list="false"
        accept=".md,.markdown"
        :on-change="handleFileUpload"
      >
        <el-icon class="upload-icon"><Upload /></el-icon>
        <div class="upload-text">
          <h3>拖拽 Markdown 文件到此处或点击上传</h3>
          <p>支持 .md 和 .markdown 文件格式</p>
        </div>
      </el-upload>
    </div>
    
    <div class="file-list-section">
      <h2>已上传的 Markdown 文件</h2>
      <el-table 
        :data="markdownFiles" 
        style="width: 100%" 
        :default-sort="{ prop: 'updatedAt', order: 'descending' }"
      >
        <el-table-column prop="name" label="文件名" min-width="200" />
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.updatedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button 
              type="primary" 
              size="small" 
              @click="viewFile(scope.row.name)">查看</el-button>
            <el-button 
              type="success" 
              size="small" 
              @click="importToQuestionBank(scope.row.name)">导入题库</el-button>
            <el-button 
              type="danger" 
              size="small" 
              @click="deleteFile(scope.row.name)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Upload } from '@element-plus/icons-vue'
import { getMarkdownFiles, saveMarkdownFile, deleteMarkdownFile, importMarkdownToQuestionBank } from '../services/markdownService'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'MarkdownUpload',
  components: {
    Upload
  },
  setup() {
    const router = useRouter()
    const markdownFiles = ref([])
    
    // 加载 Markdown 文件列表
    const loadMarkdownFiles = async () => {
      try {
        const files = await getMarkdownFiles()
        markdownFiles.value = Object.keys(files).map(name => ({
          name,
          ...files[name]
        }))
      } catch (error) {
        console.error('加载 Markdown 文件列表失败:', error)
        ElMessage.error('加载文件列表失败')
      }
    }
    
    // 处理文件上传
    const handleFileUpload = async (file) => {
      try {
        const fileContent = await readFileContent(file.raw)
        const fileName = file.name
        
        // 保存文件
        await saveMarkdownFile(fileName, fileContent)
        
        // 重新加载文件列表
        await loadMarkdownFiles()
        
        ElMessage.success(`文件 ${fileName} 上传成功`)
      } catch (error) {
        console.error('上传文件失败:', error)
        ElMessage.error('上传文件失败')
      }
    }
    
    // 读取文件内容
    const readFileContent = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target.result)
        reader.onerror = (e) => reject(e)
        reader.readAsText(file, 'UTF-8')
      })
    }
    
    // 查看文件
    const viewFile = (filename) => {
      // 将文件内容编码并传递到 Markdown 查看器
      getMarkdownFiles().then(files => {
        const fileContent = files[filename]?.content
        if (fileContent) {
          const encodedContent = encodeURIComponent(fileContent)
          window.open(`/markdown-viewer?content=${encodedContent}`, '_blank')
        } else {
          ElMessage.error('文件不存在')
        }
      })
    }
    
    // 导入到题库
    const importToQuestionBank = async (filename) => {
      try {
        const files = await getMarkdownFiles()
        const fileContent = files[filename]?.content
        
        if (!fileContent) {
          ElMessage.error('文件不存在')
          return
        }
        
        // 导入到题库
        const total = await importMarkdownToQuestionBank(filename, fileContent)
        ElMessage.success(`成功导入到题库，当前共有 ${total} 道题目`)
      } catch (error) {
        console.error('导入题库失败:', error)
        ElMessage.error(`导入失败: ${error.message}`)
      }
    }
    
    // 删除文件
    const deleteFile = async (filename) => {
      try {
        await ElMessageBox.confirm(`确定要删除文件 ${filename} 吗？此操作不可恢复。`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        await deleteMarkdownFile(filename)
        await loadMarkdownFiles()
        ElMessage.success('删除成功')
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除文件失败:', error)
          ElMessage.error('删除失败')
        }
      }
    }
    
    // 格式化日期
    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleString('zh-CN')
    }
    
    // 返回
    const goBack = () => {
      router.go(-1)
    }
    
    onMounted(() => {
      loadMarkdownFiles()
    })
    
    return {
      markdownFiles,
      handleFileUpload,
      viewFile,
      importToQuestionBank,
      deleteFile,
      formatDate,
      goBack
    }
  }
}
</script>

<style scoped>
.markdown-upload-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;
}

.upload-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.page-title {
  margin: 0;
  flex: 1;
  text-align: center;
}

.upload-section {
  margin-bottom: 40px;
}

.upload-area {
  text-align: center;
}

.upload-icon {
  font-size: 68px;
  color: #c0c4cc;
  margin-bottom: 16px;
}

.upload-text h3 {
  color: #606266;
  font-size: 16px;
  margin-bottom: 8px;
}

.upload-text p {
  color: #909399;
  font-size: 14px;
}

.file-list-section h2 {
  margin-bottom: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .upload-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  
  .page-title {
    text-align: left;
    width: 100%;
  }
  
  .el-table :deep(.el-table__cell) {
    padding: 5px 0;
  }
}
</style>