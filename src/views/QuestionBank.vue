<template>
  <div class="page-container">
    <div class="search-section">
      <el-row :gutter="10" class="mobile-search-row">
        <el-col :xs="14" :sm="10">
          <el-input v-model="searchQuery" placeholder="搜索题目..." prefix-icon="Search" clearable />
        </el-col>
        <el-col :xs="10" :sm="6">
          <el-select v-model="typeFilter" placeholder="类型" clearable>
            <el-option label="单选题" value="single" />
            <el-option label="多选题" value="multiple" />
          </el-select>
        </el-col>
      </el-row>
      
      <div class="action-buttons pc-only">
        <el-button type="primary" icon="Plus">导入题目</el-button>
        <el-button type="danger" icon="Delete">清空数据</el-button>
      </div>
    </div>

    <div class="table-card">
      <el-table :data="pagedData" style="width: 100%" row-key="id">
        <el-table-column type="expand" width="40">
          <template #default="props">
            <div class="expand-detail">
              <p><span>知识点：</span> {{ props.row.knowledge }}</p>
              <p><span>难度：</span> <el-tag size="small">{{ props.row.difficulty }}</el-tag></p>
              <p><span>题目描述：</span> {{ props.row.desc }}</p>
              <div class="mobile-actions">
                <el-button size="small" type="primary" plain @click="handleEdit(props.row)">编辑</el-button>
                <el-button size="small" type="warning" plain @click="handleAI(props.row)">AI分析</el-button>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="title" label="题目名称" min-width="180" show-overflow-tooltip />
        
        <el-table-column prop="type" label="类型" class-name="hidden-xs" width="100" />
        <el-table-column prop="difficulty" label="难度" class-name="hidden-xs" width="100" />

        <el-table-column label="操作" width="120" fixed="right">
          <template #default="scope">
            <el-button link type="primary" @click="handleDetail(scope.row)">详情</el-button>
            <el-button link type="warning" class="hidden-xs" @click="handleAI(scope.row)">AI</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-container">
        <el-pagination layout="prev, pager, next" :total="total" small />
      </div>
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
/* 小程序级优化：去除多余标题，直接进入功能区 */
.page-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* 搜索区毛玻璃感 */
.search-section {
  padding: 15px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.table-card {
  background: transparent;
  border-radius: 12px;
  overflow: hidden;
}

/* 表格收放内容样式 */
.expand-detail {
  padding: 15px;
  background: rgba(240, 245, 255, 0.6);
  border-radius: 8px;
  font-size: 13px;
  line-height: 2;
}
.expand-detail span {
  font-weight: bold;
  color: #606266;
}

.mobile-actions {
  margin-top: 10px;
  display: flex;
  gap: 10px;
}

/* 移动端适配：隐藏多余列，缩小间距 */
@media (max-width: 768px) {
  .hidden-xs {
    display: none !important;
  }
  
  .mobile-search-row {
    margin-bottom: 0;
  }

  /* 调整 Element Plus 表格在移动端边距 */
  :deep(.el-table__cell) {
    padding: 8px 0 !important;
  }
}

.pagination-container {
  margin-top: 15px;
  display: flex;
  justify-content: center;
}
</style>
