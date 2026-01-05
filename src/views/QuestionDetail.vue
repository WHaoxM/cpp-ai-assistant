<template>
  <div class="question-detail-container">
    <el-button type="primary" @click="goBack" style="margin-bottom: 20px;">
      <el-icon name="ArrowLeft" /> 返回题库
    </el-button>
    
    <el-card v-if="currentQuestion" shadow="hover" class="question-card">
      <template #header>
        <div class="card-header">
          <h2>题目详情</h2>
          <el-tag :type="tagType" size="large">{{ questionTypeText }}</el-tag>
        </div>
      </template>
      
      <div class="question-content">
        <h3>题目：</h3>
        <p v-html="renderText(currentQuestion.question)"></p>
        
        <!-- 单选题选项 -->
        <template v-if="currentQuestion.type === 'single_choice'">
          <h3>选项：</h3>
          <div class="options-list">
            <div v-for="(option, index) in currentQuestion.options" :key="index" class="option-item">
              <span class="option-label">{{ String.fromCharCode(65 + index) }}. </span>
              <span class="option-text" v-html="renderText(option)"></span>
              <el-tag v-if="String.fromCharCode(65 + index) === currentQuestion.answer" type="success" size="small" style="margin-left: 10px;">
                正确答案
              </el-tag>
            </div>
          </div>
        </template>
        
        <!-- 填空题 -->
        <template v-else-if="currentQuestion.type === 'fill_blank'">
          <h3>空格位置：</h3>
          <p v-html="renderText(currentQuestion.question)"></p>
        </template>
        
        <!-- 判断题 -->
        <template v-else-if="currentQuestion.type === 'judgment'">
          <h3>题目：</h3>
          <p v-html="renderText(currentQuestion.question)"></p>
        </template>
        
        <!-- 写结果题 -->
        <template v-else-if="currentQuestion.type === 'write_result'">
          <h3>代码：</h3>
          <el-card shadow="hover" class="code-card">
            <pre v-html="renderText(currentQuestion.question)"></pre>
          </el-card>
        </template>
        
        <!-- 写程序题 -->
        <template v-else-if="currentQuestion.type === 'write_code'">
          <h3>编程要求：</h3>
          <p v-html="renderText(currentQuestion.question)"></p>
        </template>
        
        <h3>答案：</h3>
        <el-tag v-if="currentQuestion.type === 'single_choice'" type="primary" size="large">{{ currentQuestion.answer }}</el-tag>
        <el-tag v-else-if="currentQuestion.type === 'judgment'" type="primary" size="large">
          {{ currentQuestion.answer === 'true' ? '正确' : '错误' }}
        </el-tag>
        <el-card v-else shadow="hover" class="answer-card">
          <pre v-html="renderText(currentQuestion.answer)"></pre>
        </el-card>
        
        <h3>知识点：</h3>
        <el-tag type="info">{{ currentQuestion.knowledge_point || '未分类' }}</el-tag>
        
        <h3>难度：</h3>
        <el-tag :type="difficultyType" size="large">{{ difficultyText }}</el-tag>
        
        <h3>讲解：</h3>
        <el-card shadow="hover" class="explanation-card">
          <p v-html="renderText(currentQuestion.explanation || '暂无讲解')"></p>
        </el-card>
        
        <!-- 前后题导航 -->
        <div class="nav-buttons">
          <el-button type="info" :disabled="!hasPrev" @click="prevQuestion">
            <el-icon name="ArrowLeft" /> 上一题
          </el-button>
          <el-button type="info" :disabled="!hasNext" @click="nextQuestion">
            下一题 <el-icon name="ArrowRight" />
          </el-button>
        </div>
      </div>
    </el-card>
    
    <el-empty v-else description="题目不存在"></el-empty>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { loadQuestions as loadQuestionsFromService, getQuestionById } from '../services/questionService'
import { renderText } from '../utils/textUtils'

export default {
  name: 'QuestionDetail',
  components: {},
  setup() {
    const route = useRoute()
    const router = useRouter()
    const questions = ref([])
    const currentQuestion = ref(null)
    const currentIndex = ref(-1)
    
    // 加载题目数据
    const fetchQuestions = async (questionId) => {
      try {
        // 从本地存储加载真实题目数据
        const loadedQuestions = await loadQuestionsFromService()
        questions.value = loadedQuestions
        
        // 查找当前题目
        const questionIndex = questions.value.findIndex(q => q.id === questionId)
        
        if (questionIndex !== -1) {
          currentQuestion.value = questions.value[questionIndex]
          currentIndex.value = questionIndex
        } else {
          // 尝试直接通过id获取题目，处理id不连续的情况
          const question = questions.value.find(q => q.id === questionId)
          if (question) {
            currentQuestion.value = question
            currentIndex.value = questions.value.findIndex(q => q.id === questionId)
          } else {
            currentQuestion.value = null
            currentIndex.value = -1
          }
        }
      } catch (error) {
        console.error('加载题目失败：', error)
        questions.value = []
        currentQuestion.value = null
        currentIndex.value = -1
      }
    }
    
    // 监听路由参数变化
    watch(
      () => route.params.id,
      (newId) => {
        if (newId) {
          fetchQuestions(parseInt(newId))
        }
      }
    )
    // 题目类型文本
    const questionTypeText = computed(() => {
      if (!currentQuestion.value) return ''
      const typeMap = {
        'single_choice': '单选题',
        'fill_blank': '填空题',
        'judgment': '判断题',
        'write_result': '写结果',
        'write_code': '写程序'
      }
      return typeMap[currentQuestion.value.type] || '未知类型'
    })
    
    // 题目类型标签样式
    const tagType = computed(() => {
      if (!currentQuestion.value) return ''
      const typeMap = {
        'single_choice': 'primary',
        'fill_blank': 'success',
        'judgment': 'warning',
        'write_result': 'info',
        'write_code': 'danger'
      }
      return typeMap[currentQuestion.value.type] || 'info'
    })
    
    // 难度文本
    const difficultyText = computed(() => {
      if (!currentQuestion.value) return ''
      const diffMap = {
        'easy': '简单',
        'medium': '中等',
        'hard': '困难'
      }
      return diffMap[currentQuestion.value.difficulty] || '未知难度'
    })
    
    // 难度标签样式
    const difficultyType = computed(() => {
      if (!currentQuestion.value) return ''
      const diffMap = {
        'easy': 'success',
        'medium': 'warning',
        'hard': 'danger'
      }
      return diffMap[currentQuestion.value.difficulty] || 'info'
    })
    
    // 是否有上一题
    const hasPrev = computed(() => {
      if (!currentQuestion.value) return false;
      
      const questionIds = questions.value
        .map(q => q.id)
        .sort((a, b) => a - b);
      
      const currentIndex = questionIds.findIndex(id => id === currentQuestion.value.id);
      return currentIndex > 0;
    })

    // 是否有下一题
    const hasNext = computed(() => {
      if (!currentQuestion.value) return false;
      
      const questionIds = questions.value
        .map(q => q.id)
        .sort((a, b) => a - b);
      
      const currentIndex = questionIds.findIndex(id => id === currentQuestion.value.id);
      return currentIndex >= 0 && currentIndex < questionIds.length - 1;
    })

    // 导航到指定题目
    const navigateQuestion = (targetId) => {
      if (targetId) {
        router.push(`/question/${targetId}`)
      }
    }

    // 上一题 - 跳转到ID比当前ID小的最大ID题目
    const prevQuestion = () => {
      if (!currentQuestion.value) return;
      
      const questionIds = questions.value
        .map(q => q.id)
        .sort((a, b) => a - b);
      
      const currentIndex = questionIds.findIndex(id => id === currentQuestion.value.id);
      if (currentIndex > 0) {
        const prevId = questionIds[currentIndex - 1];
        navigateQuestion(prevId);
      }
    }

    // 下一题 - 跳转到ID比当前ID大的最小ID题目
    const nextQuestion = () => {
      if (!currentQuestion.value) return;
      
      const questionIds = questions.value
        .map(q => q.id)
        .sort((a, b) => a - b);
      
      const currentIndex = questionIds.findIndex(id => id === currentQuestion.value.id);
      if (currentIndex >= 0 && currentIndex < questionIds.length - 1) {
        const nextId = questionIds[currentIndex + 1];
        navigateQuestion(nextId);
      }
    }

    // 返回题库
    const goBack = () => {
      router.push('/')
    }
    
    onMounted(() => {
      fetchQuestions(parseInt(route.params.id))
    })
    
    return {
      currentQuestion,
      questionTypeText,
      tagType,
      difficultyText,
      difficultyType,
      hasPrev,
      hasNext,
      prevQuestion,
      nextQuestion,
      goBack,
      renderText
    }
  }
}
</script>

<style scoped>
.question-detail-container {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.question-content {
  padding: 20px 0;
}

.question-content h3 {
  margin: 20px 0 10px 0;
  color: #333;
}

.options-list {
  margin: 10px 0;
}

.option-item {
  margin: 10px 0;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.option-label {
  font-weight: bold;
  margin-right: 10px;
}

.option-text {
  margin-left: 5px;
}

.explanation-card {
  margin-top: 20px;
  background-color: #f0f9ff;
  border: 1px solid #bae6fd;
}

.code-card {
  margin-top: 20px;
  background-color: #f5f5f5;
  border: 1px solid #e0e0e0;
  font-family: 'Courier New', Courier, monospace;
}

.answer-card {
  margin-top: 20px;
  background-color: #f0fff4;
  border: 1px solid #9ae6b4;
}

.nav-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
}
</style>