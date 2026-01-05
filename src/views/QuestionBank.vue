<template>
  <div class="question-bank-container">
    <h1>C++ 题库助手</h1>
    
    <el-card shadow="hover" class="filter-card">
      <el-select v-model="selectedType" placeholder="选择题目类型" style="width: 150px; margin-right: 10px;">
        <el-option label="全部" value="" />
        <el-option label="单选题" value="single_choice" />
        <el-option label="填空题" value="fill_blank" />
        <el-option label="判断题" value="judgment" />
        <el-option label="写结果" value="write_result" />
        <el-option label="写程序" value="write_code" />
      </el-select>
      
      <el-input
        v-model="searchKeyword"
        placeholder="搜索题目..."
        clearable
        style="width: 300px; margin-right: 10px;"
      />
      
      <el-button type="primary">筛选</el-button>
      
      <el-button type="success" @click="handleImportQuestions">
        <el-icon name="Upload" /> 导入题目
      </el-button>
      
      <el-button type="danger" @click="handleDeleteLastImported">
        <el-icon name="Delete" /> 删除上次导入
      </el-button>
      
      <!-- 隐藏的文件输入框 -->
      <input
        ref="fileInputRef"
        type="file"
        accept=".json,.jsonl"
        style="display: none;"
        @change="handleFileChange"
      />
    </el-card>
    
    <el-table :data="filteredQuestions" style="width: 100%; margin-top: 20px;">
        <el-table-column prop="id" label="题号" width="80" />
        <el-table-column prop="type" label="类型" width="120">
          <template #default="scope">
            <el-tag v-if="scope.row.type === 'single_choice'" type="primary">单选题</el-tag>
            <el-tag v-else-if="scope.row.type === 'fill_blank'" type="success">填空题</el-tag>
            <el-tag v-else-if="scope.row.type === 'judgment'" type="warning">判断题</el-tag>
            <el-tag v-else-if="scope.row.type === 'write_result'" type="info">写结果</el-tag>
            <el-tag v-else-if="scope.row.type === 'write_code'" type="danger">写程序</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="question" label="题目" :show-overflow-tooltip="true">
          <template #default="scope">
            <div class="question-content" v-html="renderText(scope.row.question)"></div>
          </template>
        </el-table-column>
        <el-table-column prop="knowledge_point" label="知识点" width="180" :show-overflow-tooltip="true" />
        <el-table-column prop="difficulty" label="难度" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.difficulty === 'easy'" type="success" size="small">简单</el-tag>
            <el-tag v-else-if="scope.row.difficulty === 'medium'" type="warning" size="small">中等</el-tag>
            <el-tag v-else-if="scope.row.difficulty === 'hard'" type="danger" size="small">困难</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="viewQuestion(scope.row.id)">
              查看详情
            </el-button>
            <el-button type="warning" size="small" @click="askAIAboutQuestion(scope.row)" style="margin-left: 5px;">
              <el-icon name="ChatDotRound" /> AI分析
            </el-button>
            <el-button type="danger" size="small" @click="handleDeleteQuestion(scope.row.id)" style="margin-left: 5px;">
              <el-icon name="Delete" /> 删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
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
.question-bank-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.filter-card {
  margin-bottom: 20px;
}

.question-content {
  max-width: 600px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>