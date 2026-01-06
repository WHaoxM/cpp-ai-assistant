<template>
  <div class="page-container">
    <div class="filter-card">
      <el-row :gutter="15" class="responsive-row">
        <el-col :xs="24" :sm="8" class="col-item">
          <el-input v-model="searchQuery" placeholder="搜索题目..." prefix-icon="Search" clearable />
        </el-col>
        
        <el-col :xs="24" :sm="6" class="col-item">
          <el-select v-model="typeFilter" placeholder="选择题目类型" clearable style="width: 100%">
            <el-option label="单选题" value="single" />
            <el-option label="多选题" value="multiple" />
          </el-select>
        </el-col>

        <el-col :xs="24" :sm="10" class="col-item btn-group">
          <el-button type="primary" icon="Upload" @click="handleImport" class="flex-btn">导入题目</el-button>
          <el-button type="danger" icon="Delete" @click="handleClear" class="flex-btn">清空数据</el-button>
        </el-col>
      </el-row>
    </div>

    <div class="table-container">
      <el-table :data="tableData" style="width: 100%" row-key="id">
        <el-table-column type="expand" class="mobile-only-expand">
          <template #default="props">
            <div class="detail-box">
              <p><b>知识点:</b> {{ props.row.knowledge }}</p>
              <p><b>难度:</b> {{ props.row.difficulty }}</p>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="title" label="题目名称" min-width="150" show-overflow-tooltip />
        
        <el-table-column prop="type" label="类型" class-name="pc-column" width="100" />
        
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="scope">
            <el-button link type="primary" @click="goDetail(scope.row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, inject } from 'vue'
import { useRouter } from 'vue-router'
import { loadQuestions, searchQuestions, deleteQuestion, deleteLastImportedQuestions, saveQuestions, loadQuestionsFromFile } from '../services/questionService'
import { renderText } from '../utils/textUtils'
import { ElMessage } from 'element-plus'

export default {
  name: 'QuestionBank',
  setup() {
    const router = useRouter()
    // 注入事件总线
    const eventBus = inject('eventBus')
    const questions = ref([])
    const selectedType = ref('')
    const searchKeyword = ref('')
    const fileInputRef = ref(null)
    const importedQuestionsCount = ref(0)
    
    // 添加日志
    const addLog = (content, level = 'info') => {
      console.log(`[${level.toUpperCase()}] ${content}`)
    }
    
    // 导入题目
    const handleImportQuestions = () => {
      fileInputRef.value?.click()
    }
    
    // 处理文件选择
    const handleFileChange = async (event) => {
      const file = event.target.files[0]
      if (!file) return
      
      try {
        const importedQuestions = await loadQuestionsFromFile(file)
        
        if (importedQuestions.length === 0) {
          ElMessage.warning('导入的文件中没有找到题目')
          return
        }
        
        importedQuestionsCount.value = importedQuestions.length
        
        // 保存导入的题目
        const totalQuestions = await saveQuestions(importedQuestions)
        
        ElMessage.success(`成功导入 ${importedQuestions.length} 道题目，当前共有 ${totalQuestions} 道题目`)
        addLog(`成功导入 ${importedQuestions.length} 道题目`, 'success')
        
        // 重新加载题目列表
        await fetchQuestions()
      } catch (error) {
        console.error('导入题目失败：', error)
        ElMessage.error(`导入失败：${error.message}`)
        addLog(`导入题目失败：${error.message}`, 'error')
      }
      
      // 清空文件输入框，允许重复选择同一文件
      event.target.value = ''
    }
    
    // 加载题目数据
    const fetchQuestions = async () => {
      try {
        // 调用questionService从本地存储加载题目
        const loadedQuestions = await loadQuestions()
        questions.value = loadedQuestions
        addLog(`成功加载 ${loadedQuestions.length} 道题目`, 'success')
      } catch (error) {
        console.error('加载题目失败：', error)
        questions.value = []
        addLog(`加载题目失败：${error.message}`, 'error')
      }
    }
    
    // 筛选题目
    const filteredQuestions = computed(() => {
      return questions.value.filter(question => {
        const typeMatch = !selectedType.value || question.type === selectedType.value
        const keywordMatch = !searchKeyword.value || question.question.includes(searchKeyword.value) || question.knowledge_point.includes(searchKeyword.value)
        return typeMatch && keywordMatch
      })
    })
    
    // 查看题目详情
    const viewQuestion = (id) => {
      router.push(`/question/${id}`)
    }
    
    // 向AI助手提问关于该题目
    const askAIAboutQuestion = (question) => {
      // 通过事件总线发送题目分析请求
      eventBus.emit('analyzeQuestion', question)
    }
    
    // 删除指定题目
    const handleDeleteQuestion = async (id) => {
      try {
        await deleteQuestion(id)
        addLog(`成功删除题目 ID: ${id}`, 'success')
        // 重新加载题目列表
        await fetchQuestions()
      } catch (error) {
        addLog(`删除题目失败：${error.message}`, 'error')
      }
    }
    
    // 删除上次导入的题目
    const handleDeleteLastImported = async () => {
      try {
        const remainingCount = await deleteLastImportedQuestions()
        addLog(`成功删除上次导入的题目，剩余 ${remainingCount} 道题目`, 'success')
        // 重新加载题目列表
        await fetchQuestions()
      } catch (error) {
        addLog(`删除上次导入的题目失败：${error.message}`, 'error')
      }
    }
    
    onMounted(() => {
      fetchQuestions()
    })
    
    return {
      questions,
      selectedType,
      searchKeyword,
      filteredQuestions,
      viewQuestion,
      askAIAboutQuestion,
      fetchQuestions,
      handleDeleteQuestion,
      handleDeleteLastImported,
      handleImportQuestions,
      handleFileChange,
      fileInputRef,
      importedQuestionsCount,
      renderText
    }
  }
}
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 搜索和按钮容器 */
.filter-card {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  padding: 20px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.col-item {
  margin-bottom: 15px;
}

.btn-group {
  display: flex;
  gap: 10px;
  justify-content: flex-end; /* PC端靠右 */
}

.flex-btn {
  flex: 1; /* 移动端平分宽度 */
  max-width: 150px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .btn-group {
    justify-content: center; /* 移动端居中 */
    margin-top: 5px;
  }
  
  .flex-btn {
    max-width: none; /* 移动端取消最大宽度限制 */
  }

  /* 隐藏PC端的列 */
  :deep(.pc-column) {
    display: none !important;
  }
}

.table-container {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  padding: 10px;
  overflow: hidden;
}

.detail-box {
  padding: 10px 20px;
  background: #f9f9f9;
  font-size: 13px;
}
</style>
