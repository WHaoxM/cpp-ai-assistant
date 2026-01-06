<template>
  <div class="floating-chat-container" :class="{ expanded: isExpanded }" :style="{ backgroundImage: `url(${backgroundImage})`, transform: `translate(${x}px, ${y}px)` }" @mousedown="onMouseDown" @touchstart="onTouchStart">
    <!-- 聊天窗口头部 -->
    <div class="chat-header">
      <div class="header-content" @click="handleHeaderClick">
        <el-icon class="ai-icon"><ChatDotRound /></el-icon>
        <span class="chat-title">C++ AI 助手</span>
        <el-badge v-if="unreadCount > 0" :value="unreadCount" class="notification-badge" />
      </div>
      <el-select 
        v-if="isExpanded" 
        v-model="selectedModel" 
        placeholder="选择模型" 
        size="small" 
        class="model-selector"
        @mousedown.stop
      >
        <el-option label="gpt-4" value="gpt-4" />
        <el-option label="gpt-3.5-turbo" value="gpt-3.5-turbo" />
        <el-option-group label="自定义模型">
          <el-option 
            v-for="model in customModels" 
            :key="model.id" 
            :label="model.name" 
            :value="model.id" 
          />
        </el-option-group>
      </el-select>
      <el-icon class="expand-icon" @click.stop="toggleExpanded">
        <component :is="isExpanded ? ArrowDown : ArrowUp" />
      </el-icon>
    </div>
    
    <!-- 聊天内容区域 -->
    <div class="chat-content" v-if="isExpanded">
      <!-- 聊天消息列表 -->
      <div class="chat-messages">
        <!-- 系统消息 -->
        <div class="message system-message">
          <div class="message-content">
            <p>您好！我是您的C++ AI助手，专注于C++知识点讲解和题目分析。请随时向我提问，或从题库中选择题目让我分析。</p>
          </div>
        </div>
        
        <!-- 聊天消息 -->
        <div v-for="msg in messages" :key="msg.id" :class="['message', msg.sender === 'user' ? 'user-message' : 'ai-message']">
          <div class="message-header">
            <span class="sender-name">{{ msg.sender === 'user' ? '我' : 'AI助手' }}</span>
            <span class="send-time">{{ formatTime(msg.timestamp) }}</span>
          </div>
          <div class="message-content">
            <div v-html="renderText(msg.content)"></div>
            <!-- 题目预览 -->
            <el-card v-if="msg.question" shadow="hover" class="question-preview">
              <div class="question-preview-header">
                <span class="question-type">{{ getQuestionTypeText(msg.question.type) }}</span>
                <el-tag :type="getDifficultyType(msg.question.difficulty)" size="small">
                  {{ getDifficultyText(msg.question.difficulty) }}
                </el-tag>
              </div>
              <div class="question-preview-content">
                <div v-html="renderText(msg.question.question)"></div>
                <!-- 选项预览 -->
                <div v-if="msg.question.options" class="options-preview">
                  <div v-for="(option, idx) in msg.question.options.slice(0, 2)" :key="idx" class="option-preview-item">
                    <span class="option-label">{{ String.fromCharCode(65 + idx) }}. </span>
                    <span class="option-text">{{ option }}</span>
                  </div>
                  <div v-if="msg.question.options.length > 2" class="more-options">
                    ... 还有 {{ msg.question.options.length - 2 }} 个选项
                  </div>
                </div>
              </div>
              <div class="question-preview-footer">
                <el-tag type="info" size="small">{{ msg.question.knowledge_point }}</el-tag>
              </div>
            </el-card>
          </div>
        </div>
        
        <!-- 加载中 -->
        <div v-if="isLoading" class="message ai-message">
          <div class="message-header">
            <span class="sender-name">AI助手</span>
          </div>
          <div class="message-content">
            <el-skeleton :rows="3" animated />
          </div>
        </div>
      </div>
      
      <!-- 输入区域 -->
      <div class="chat-input-area">
        <el-input
          v-model="inputMessage"
          placeholder="输入您的问题，或选择一道题目让我分析..."
          resize="none"
          :rows="2"
          type="textarea"
          @keyup.enter="handleSend"
          :disabled="isLoading"
        />
        <div class="input-actions">
          <el-button type="primary" @click="handleSend" :loading="isLoading" :disabled="!inputMessage.trim() || isLoading">
            <el-icon><Promotion /></el-icon> 发送
          </el-button>
          <el-button type="info" @click="clearMessages">
            <el-icon><Delete /></el-icon> 清空
          </el-button>
        </div>
      </div>
    </div>
    
    <!-- 快速操作按钮 -->
    <div class="quick-actions" v-if="isExpanded">
      <el-button type="warning" size="small" @click="toggleTopicPanel">
        <el-icon><Document /></el-icon> {{ showTopicPanel ? '收起题库' : '选择题目' }}
      </el-button>
    </div>
    
    <!-- 题目选择面板 -->
    <div class="topic-panel" v-if="isExpanded && showTopicPanel">
      <div class="topic-panel-header">
        <h3>选择题目让AI分析</h3>
        <el-button text @click="toggleTopicPanel">
          <el-icon><Close /></el-icon> 关闭
        </el-button>
      </div>
      <div class="topic-search">
        <el-input
          v-model="topicSearchKeyword"
          placeholder="搜索题目..."
          clearable
          style="margin-bottom: 10px;"
        />
      </div>
      <div class="topic-list">
        <el-scrollbar height="200px">
          <div v-for="topic in filteredTopics" :key="topic.id" class="topic-item" @click="selectTopic(topic)">
            <div class="topic-item-header">
              <span class="topic-id">#{{ topic.id }}</span>
              <el-tag :type="getQuestionTypeTag(topic.type)" size="small">
                {{ getQuestionTypeText(topic.type) }}
              </el-tag>
            </div>
            <div class="topic-item-content">
              <p>{{ topic.question }}</p>
            </div>
            <div class="topic-item-footer">
              <el-tag type="info" size="small">{{ topic.knowledge_point }}</el-tag>
              <el-tag :type="getDifficultyType(topic.difficulty)" size="small">
                {{ getDifficultyText(topic.difficulty) }}
              </el-tag>
            </div>
          </div>
        </el-scrollbar>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch, inject } from 'vue'
import { ChatDotRound, ArrowDown, ArrowUp, Promotion, Delete, Document, Close } from '@element-plus/icons-vue'
import { askAI, analyzeQuestion, getCustomModels } from '../services/aiService'
import { loadQuestions } from '../services/questionService'
import { renderText } from '../utils/textUtils'

export default {
  name: 'FloatingAIChat',
  components: {
    ChatDotRound,
    ArrowDown,
    ArrowUp,
    Promotion,
    Delete,
    Document,
    Close
  },
  props: {
    currentQuestion: {
      type: Object,
      default: null
    }
  },
  emits: ['question-selected'],
  setup(props, { emit }) {
    // 注入事件总线
    const eventBus = inject('eventBus')
    
    // 悬浮窗位置
    const containerWidth = 300
    const containerHeight = 50
    const x = ref(Math.max(0, Math.min(window.innerWidth - containerWidth, window.innerWidth - 320)))
    const y = ref(Math.max(0, Math.min(window.innerHeight - containerHeight, window.innerHeight - 100)))
    const isDragging = ref(false)
    const hasDragged = ref(false)
    const dragThreshold = 5
    const startX = ref(0)
    const startY = ref(0)
    const startXOffset = ref(0)
    const startYOffset = ref(0)
    
    // 缓存窗口尺寸，避免频繁读取导致强制重排
    let cachedWindowWidth = window.innerWidth
    let cachedWindowHeight = window.innerHeight
    let animationFrameId = null
    
    const isExpanded = ref(false)
    const showTopicPanel = ref(false)
    const messages = ref([])
    const inputMessage = ref('')
    const isLoading = ref(false)
    const unreadCount = ref(0)
    
    // 模型选择
    const customModels = ref([])
    const selectedModel = ref('gpt-4')
    
    // 背景图
    const backgroundImage = ref('')
    
    // 题目列表
    const topics = ref([])
    const topicSearchKeyword = ref('')
    
    // 拖动事件处理
    const onMouseDown = (event) => {
      // 只有在头部区域点击才允许拖动，且点击的不是交互元素
      const target = event.target
      const isInteractiveElement = target.closest('.el-select') || 
                                  target.closest('.el-icon') ||
                                  target.tagName === 'BUTTON' ||
                                  target.tagName === 'INPUT' ||
                                  target.tagName === 'SELECT'
      
      if (event.target.closest('.chat-header') && !isInteractiveElement) {
        isDragging.value = true
        hasDragged.value = false
        startX.value = event.clientX
        startY.value = event.clientY
        startXOffset.value = x.value
        startYOffset.value = y.value
        
        // 添加全局事件监听
        document.addEventListener('mousemove', onMouseMove, { passive: false })
        document.addEventListener('mouseup', onMouseUp)
        document.addEventListener('mouseleave', onMouseUp)
        
        // 阻止默认行为，避免文本选择和其他浏览器默认操作
        event.preventDefault()
        event.stopPropagation()
        
        // 添加拖动时的样式类
        document.body.style.userSelect = 'none'
      }
    }
    
    // 触摸开始事件
    const onTouchStart = (event) => {
      const target = event.target
      const isInteractiveElement = target.closest('.el-select') || 
                                  target.closest('.el-icon') ||
                                  target.closest('.el-button') ||
                                  target.tagName === 'BUTTON' ||
                                  target.tagName === 'INPUT' ||
                                  target.tagName === 'SELECT' ||
                                  target.tagName === 'TEXTAREA'
      
      const headerElement = target.closest('.chat-header')
      if (headerElement && !isInteractiveElement) {
        isDragging.value = true
        hasDragged.value = false
        const touch = event.touches[0]
        startX.value = touch.clientX
        startY.value = touch.clientY
        startXOffset.value = x.value
        startYOffset.value = y.value
        
        // 阻止默认行为
        event.preventDefault()
        event.stopPropagation()
        
        // 添加拖动时的样式类
        document.body.style.userSelect = 'none'
        document.body.style.touchAction = 'none'
        
        // 添加触摸事件监听（移动端）
        document.addEventListener('touchmove', onTouchMove, { passive: false })
        document.addEventListener('touchend', onTouchEnd)
        document.addEventListener('touchcancel', onTouchEnd)
      }
    }
    
    // 触摸移动事件
    const onTouchMove = (event) => {
      if (isDragging.value && event.touches.length > 0) {
        const touch = event.touches[0]
        const moveX = touch.clientX - startX.value
        const moveY = touch.clientY - startY.value
        
        // 计算总移动距离
        const totalDistance = Math.sqrt(moveX * moveX + moveY * moveY)
        
        // 只有移动距离超过阈值才标记为已拖动
        if (totalDistance > dragThreshold) {
          hasDragged.value = true
          
          // 取消之前的动画帧，避免堆积
          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId)
          }
          
          // 预先计算边界值，避免在动画帧中频繁读取
          const containerWidth = isExpanded.value ? 350 : 300
          const containerHeight = isExpanded.value ? 500 : 50
          const minX = 0
          const maxX = cachedWindowWidth - containerWidth
          const minY = 0
          const maxY = cachedWindowHeight - containerHeight
          
          // 使用 requestAnimationFrame 优化性能
          animationFrameId = requestAnimationFrame(() => {
            // 计算新位置
            const newX = startXOffset.value + moveX
            const newY = startYOffset.value + moveY
            
            // 更新位置，限制在屏幕范围内
            x.value = Math.max(minX, Math.min(maxX, newX))
            y.value = Math.max(minY, Math.min(maxY, newY))
            
            animationFrameId = null
          })
        }
      }
    }
    
    // 触摸结束事件
    const onTouchEnd = () => {
      if (isDragging.value) {
        isDragging.value = false
        
        // 移除触摸事件监听
        document.removeEventListener('touchmove', onTouchMove)
        document.removeEventListener('touchend', onTouchEnd)
        document.removeEventListener('touchcancel', onTouchEnd)
        
        // 恢复样式
        document.body.style.userSelect = ''
        document.body.style.touchAction = ''
        
        // 确保悬浮窗在屏幕内
        ensureInBounds()
        
        // 延迟重置拖动状态，确保点击事件处理完成
        setTimeout(() => {
          hasDragged.value = false
        }, 50)
      }
    }
    
    const onMouseMove = (event) => {
      if (isDragging.value) {
        // 计算鼠标移动距离
        const moveX = event.clientX - startX.value
        const moveY = event.clientY - startY.value
        
        // 计算总移动距离
        const totalDistance = Math.sqrt(moveX * moveX + moveY * moveY)
        
        // 只有移动距离超过阈值才标记为已拖动
        if (totalDistance > dragThreshold) {
          hasDragged.value = true
          
          // 取消之前的动画帧，避免堆积
          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId)
          }
          
          // 预先计算边界值，避免在动画帧中频繁读取
          const containerWidth = isExpanded.value ? 350 : 300
          const containerHeight = isExpanded.value ? 500 : 50
          const minX = 0
          const maxX = cachedWindowWidth - containerWidth
          const minY = 0
          const maxY = cachedWindowHeight - containerHeight
          
          // 使用 requestAnimationFrame 优化性能
          animationFrameId = requestAnimationFrame(() => {
            // 计算新位置
            const newX = startXOffset.value + moveX
            const newY = startYOffset.value + moveY
            
            // 更新位置，限制在屏幕范围内
            x.value = Math.max(minX, Math.min(maxX, newX))
            y.value = Math.max(minY, Math.min(maxY, newY))
            
            animationFrameId = null
          })
        }
      }
    }
    
    const onMouseUp = () => {
      if (isDragging.value) {
        isDragging.value = false
        // 移除全局事件监听
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
        document.removeEventListener('mouseleave', onMouseUp)
        
        // 恢复样式
        document.body.style.userSelect = ''
        
        // 确保悬浮窗在屏幕内
        ensureInBounds()
        
        // 延迟重置拖动状态，确保点击事件处理完成
        setTimeout(() => {
          hasDragged.value = false
        }, 50)
      }
    }
    
    // 获取随机背景图
    const getBackgroundImage = async () => {
      try {
        // 使用用户提供的API获取背景图
        const response = await fetch('https://t.alcy.cc/fj')
        const data = await response.json()
        if (data.url) {
          backgroundImage.value = data.url
        }
      } catch (error) {
        console.error('获取背景图失败:', error)
      }
    }
    
    // 加载自定义模型
    const loadCustomModels = () => {
      customModels.value = getCustomModels()
    }
    
    // 加载题目列表
    const loadTopics = async () => {
      const questions = await loadQuestions()
      topics.value = questions
    }
    
    // 过滤题目
    const filteredTopics = computed(() => {
      if (!topicSearchKeyword.value) return topics.value
      return topics.value.filter(topic => 
        topic.question.includes(topicSearchKeyword.value) || 
        topic.knowledge_point.includes(topicSearchKeyword.value)
      )
    })
    
    // 确保悬浮窗在屏幕内
    const ensureInBounds = () => {
      const width = isExpanded.value ? 350 : 300
      const height = isExpanded.value ? 500 : 50
      
      // 确保 x 和 y 在有效范围内（使用缓存的窗口尺寸）
      x.value = Math.max(0, Math.min(cachedWindowWidth - width, x.value))
      y.value = Math.max(0, Math.min(cachedWindowHeight - height, y.value))
    }
    
    // 处理头部点击事件
    const handleHeaderClick = (event) => {
      // 只有在没有拖动的情况下才触发展开/收起
      if (!hasDragged.value) {
        isExpanded.value = !isExpanded.value
        if (isExpanded.value) {
          unreadCount.value = 0
        }
        // 确保展开/收起后悬浮窗在屏幕内
        setTimeout(() => {
          ensureInBounds()
        }, 50)
      }
    }
    
    // 切换展开/收起（通过图标点击）
    const toggleExpanded = () => {
      isExpanded.value = !isExpanded.value
      if (isExpanded.value) {
        unreadCount.value = 0
      }
      // 确保展开/收起后悬浮窗在屏幕内
      setTimeout(() => {
        ensureInBounds()
      }, 50)
    }
    
    // 切换题目面板
    const toggleTopicPanel = () => {
      showTopicPanel.value = !showTopicPanel.value
    }
    
    // 发送消息
    const handleSend = async () => {
      if (!inputMessage.value.trim() || isLoading.value) return
      
      // 添加用户消息
      const userMsg = {
        id: Date.now(),
        sender: 'user',
        content: inputMessage.value.trim(),
        timestamp: new Date()
      }
      messages.value.push(userMsg)
      
      // 清空输入
      const msgContent = inputMessage.value.trim()
      inputMessage.value = ''
      
      // 滚动到底部
      scrollToBottom()
      
      // 调用AI服务
      isLoading.value = true
      try {
        const response = await askAI(msgContent, {}, { model: selectedModel.value })
        const aiMsg = {
          id: Date.now() + 1,
          sender: 'ai',
          content: response,
          timestamp: new Date()
        }
        messages.value.push(aiMsg)
        if (!isExpanded.value) {
          unreadCount.value++
        }
      } catch (error) {
        const errorMsg = {
          id: Date.now() + 1,
          sender: 'ai',
          content: '抱歉，AI服务暂时不可用，请稍后重试。',
          timestamp: new Date()
        }
        messages.value.push(errorMsg)
      } finally {
        isLoading.value = false
        scrollToBottom()
      }
    }
    
    // 选择题目让AI分析
    const selectTopic = async (topic) => {
      // 添加用户消息
      const userMsg = {
        id: Date.now(),
        sender: 'user',
        content: `请分析这道题目：${topic.question}`,
        question: topic,
        timestamp: new Date()
      }
      messages.value.push(userMsg)
      
      // 关闭题目面板
      showTopicPanel.value = false
      
      // 滚动到底部
      scrollToBottom()
      
      // 调用AI分析题目
      isLoading.value = true
      try {
        const response = await analyzeQuestion(topic, { model: selectedModel.value })
        const aiMsg = {
          id: Date.now() + 1,
          sender: 'ai',
          content: response,
          question: topic,
          timestamp: new Date()
        }
        messages.value.push(aiMsg)
      } catch (error) {
        const errorMsg = {
          id: Date.now() + 1,
          sender: 'ai',
          content: '抱歉，AI分析服务暂时不可用，请稍后重试。',
          timestamp: new Date()
        }
        messages.value.push(errorMsg)
      } finally {
        isLoading.value = false
        scrollToBottom()
      }
      
      // 通知父组件
      emit('question-selected', topic)
    }
    
    // 清空聊天记录
    const clearMessages = () => {
      messages.value = []
    }
    
    // 滚动到底部
    const scrollToBottom = () => {
      requestAnimationFrame(() => {
        const chatContainer = document.querySelector('.chat-messages')
        if (chatContainer) {
          chatContainer.scrollTop = chatContainer.scrollHeight
        }
      })
    }
    
    // 格式化时间
    const formatTime = (date) => {
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      return `${hours}:${minutes}`
    }
    
    // 获取题目类型文本
    const getQuestionTypeText = (type) => {
      const typeMap = {
        'single_choice': '单选题',
        'fill_blank': '填空题',
        'judgment': '判断题',
        'write_result': '写结果',
        'write_code': '写程序'
      }
      return typeMap[type] || '未知类型'
    }
    
    // 获取题目类型标签
    const getQuestionTypeTag = (type) => {
      const typeMap = {
        'single_choice': 'primary',
        'fill_blank': 'success',
        'judgment': 'warning',
        'write_result': 'info',
        'write_code': 'danger'
      }
      return typeMap[type] || 'info'
    }
    
    // 获取难度文本
    const getDifficultyText = (difficulty) => {
      const diffMap = {
        'easy': '简单',
        'medium': '中等',
        'hard': '困难'
      }
      return diffMap[difficulty] || '未知难度'
    }
    
    // 获取难度标签类型
    const getDifficultyType = (difficulty) => {
      const diffMap = {
        'easy': 'success',
        'medium': 'warning',
        'hard': 'danger'
      }
      return diffMap[difficulty] || 'info'
    }
    
    // 监听外部传入的当前题目
    watch(() => props.currentQuestion, (newVal) => {
      if (newVal) {
        // 自动分析当前题目
        selectTopic(newVal)
      }
    })
    
    // 监听事件总线的题目分析请求
    const handleQuestionAnalysisRequest = (question) => {
      // 展开聊天窗口
      isExpanded.value = true
      // 分析题目
      selectTopic(question)
      // 确保悬浮窗在屏幕内
      setTimeout(() => {
        ensureInBounds()
      }, 50)
    }
    
    // 监听窗口大小变化
    let resizeTimeout = null
    const handleResize = () => {
      // 使用防抖优化性能
      if (resizeTimeout) {
        clearTimeout(resizeTimeout)
      }
      
      resizeTimeout = setTimeout(() => {
        // 更新缓存的窗口尺寸
        cachedWindowWidth = window.innerWidth
        cachedWindowHeight = window.innerHeight
        
        // 确保悬浮窗在屏幕内
        ensureInBounds()
      }, 100)
    }
    
    onMounted(() => {
      loadTopics()
      loadCustomModels()
      // 监听事件总线事件
      eventBus.on('analyzeQuestion', handleQuestionAnalysisRequest)
      // 监听窗口大小变化
      window.addEventListener('resize', handleResize)
    })
    
    onUnmounted(() => {
      // 移除事件监听
      eventBus.off('analyzeQuestion', handleQuestionAnalysisRequest)
      window.removeEventListener('resize', handleResize)
    })
    
    return {
      isExpanded,
      showTopicPanel,
      messages,
      inputMessage,
      isLoading,
      unreadCount,
      topics,
      topicSearchKeyword,
      filteredTopics,
      customModels,
      selectedModel,
      backgroundImage,
      x,
      y,
      onMouseDown,
      handleHeaderClick,
      toggleExpanded,
      toggleTopicPanel,
      handleSend,
      selectTopic,
      clearMessages,
      formatTime,
      getQuestionTypeText,
      getQuestionTypeTag,
      getDifficultyText,
      getDifficultyType,
      renderText,
      ChatDotRound,
      ArrowDown,
      ArrowUp,
      Promotion,
      Delete,
      Document,
      Close
    }
  }
}
</script>

<style scoped>
.floating-chat-container {
  position: fixed;
  width: 300px;
  height: 50px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 25px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), 
              height 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              border-radius 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(5px);
  overflow: hidden;
  cursor: move;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  will-change: transform;
  contain: layout style;
  touch-action: none;
}

.floating-chat-container.expanded {
  width: 350px;
  height: auto;
  max-height: 70vh;
  border-radius: 12px;
}

.chat-header {
  padding: 10px 16px;
  background-color: rgba(24, 144, 255, 0.95);
  color: #fff;
  border-radius: 25px 25px 0 0;
  cursor: move;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 50px;
  box-sizing: border-box;
  user-select: none;
  -webkit-user-select: none;
  touch-action: none;
  -webkit-touch-callout: none;
}

.floating-chat-container.expanded .chat-header {
  border-radius: 12px 12px 0 0;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.ai-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.chat-title {
  font-size: 14px;
  font-weight: bold;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notification-badge {
  transform: translate(50%, -50%);
  flex-shrink: 0;
}

.expand-icon {
  font-size: 14px;
  flex-shrink: 0;
}

.model-selector {
  margin: 0 8px;
  width: 130px;
  flex-shrink: 0;
}

.chat-content {
  display: flex;
  flex-direction: column;
  height: 350px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
  background-color: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(5px);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 13px;
  line-height: 1.5;
  contain: strict;
  will-change: scroll-position;
}

.message {
  margin-bottom: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  max-width: 85%;
  word-wrap: break-word;
  font-size: 13px;
}

.system-message {
  background-color: rgba(230, 247, 255, 0.9);
  border: 1px solid rgba(145, 213, 255, 0.7);
  margin: 0 auto;
  max-width: 90%;
}

.user-message {
  background-color: rgba(246, 255, 237, 0.9);
  border: 1px solid rgba(183, 235, 143, 0.7);
  margin-left: auto;
  margin-right: 0;
}

.ai-message {
  background-color: rgba(255, 247, 230, 0.9);
  border: 1px solid rgba(255, 213, 145, 0.7);
  margin-left: 0;
  margin-right: auto;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
  font-size: 12px;
  color: #666;
}

.sender-name {
  font-weight: bold;
}

.send-time {
  opacity: 0.7;
}

.message-content {
  font-size: 14px;
  line-height: 1.5;
}

.question-preview {
  margin-top: 10px;
  background-color: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  overflow: hidden;
}

.question-preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: #fafafa;
  border-bottom: 1px solid #e8e8e8;
}

.question-type {
  font-weight: bold;
  font-size: 12px;
}

.question-preview-content {
  padding: 12px;
}

.question-preview-content p {
  margin: 0 0 10px 0;
  font-size: 13px;
  line-height: 1.4;
}

.options-preview {
  margin: 10px 0;
}

.option-preview-item {
  margin: 5px 0;
  font-size: 12px;
}

.more-options {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

.question-preview-footer {
  display: flex;
  gap: 8px;
  padding: 8px 12px;
  background-color: #fafafa;
  border-top: 1px solid #e8e8e8;
  flex-wrap: wrap;
}

.chat-input-area {
  padding: 15px;
  border-top: 1px solid rgba(232, 232, 232, 0.7);
  background-color: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(5px);
}

.input-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
}

.quick-actions {
  padding: 0 15px 15px 15px;
  background-color: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(5px);
  border-top: 1px solid rgba(232, 232, 232, 0.7);
  display: flex;
  justify-content: center;
}

.topic-panel {
  position: absolute;
  right: 100%;
  top: 0;
  bottom: 0;
  width: 350px;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(232, 232, 232, 0.7);
  border-radius: 12px 0 0 12px;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  z-index: 10000;
  overflow: hidden;
}

.topic-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid rgba(232, 232, 232, 0.7);
  background-color: rgba(24, 144, 255, 0.9);
  color: #fff;
  border-radius: 12px 0 0 0;
}

.topic-panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
}

.topic-search {
  padding: 0 15px 15px 15px;
  background-color: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(5px);
}

.topic-list {
  flex: 1;
  padding: 0 15px 15px 15px;
  background-color: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(5px);
}

.topic-item {
  padding: 12px;
  margin-bottom: 10px;
  border: 1px solid rgba(232, 232, 232, 0.7);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: rgba(250, 250, 250, 0.9);
  backdrop-filter: blur(5px);
}

.topic-item:hover {
  border-color: #1890ff;
  background-color: #e6f7ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.15);
}

.topic-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.topic-id {
  font-weight: bold;
  font-size: 12px;
  color: #1890ff;
}

.topic-item-content {
  margin-bottom: 8px;
}

.topic-item-content p {
  margin: 0;
  font-size: 13px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.topic-item-footer {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.message-content {
  font-size: 14px;
  line-height: 1.5;
}

.message-content h1,
.message-content h2,
.message-content h3,
.message-content h4,
.message-content h5,
.message-content h6 {
  margin: 16px 0 8px 0;
  font-weight: 600;
  line-height: 1.25;
}

.message-content h1 {
  font-size: 24px;
}

.message-content h2 {
  font-size: 20px;
}

.message-content h3 {
  font-size: 18px;
}

.message-content h4 {
  font-size: 16px;
}

.message-content h5 {
  font-size: 14px;
}

.message-content h6 {
  font-size: 12px;
}

.message-content p {
  margin: 8px 0;
}

.message-content pre {
  background-color: #f6f8fa;
  border-radius: 6px;
  padding: 12px;
  overflow-x: auto;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.5;
  margin: 12px 0;
}

.message-content code {
  background-color: #f6f8fa;
  border-radius: 3px;
  padding: 2px 6px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  color: #e96900;
  word-break: break-word;
}

.message-content ul,
.message-content ol {
  margin: 12px 0;
  padding-left: 24px;
}

.message-content li {
  margin: 4px 0;
  line-height: 1.5;
}

.message-content blockquote {
  border-left: 4px solid #dfe2e5;
  margin: 12px 0;
  padding: 8px 16px;
  color: #6a737d;
  background-color: #fafafa;
  border-radius: 0 6px 6px 0;
}

.message-content hr {
  border: 0;
  height: 1px;
  background-color: #e1e4e8;
  margin: 20px 0;
}

.message-content table {
  border-collapse: collapse;
  width: 100%;
  margin: 12px 0;
  font-size: 13px;
}

.message-content table, 
.message-content th, 
.message-content td {
  border: 1px solid #dfe2e5;
}

.message-content th, 
.message-content td {
  padding: 6px 10px;
  text-align: left;
}

.message-content th {
  background-color: #f6f8fa;
  font-weight: 600;
}

.message-content a {
  color: #1890ff;
  text-decoration: none;
}

.message-content a:hover {
  text-decoration: underline;
}

.message-content strong {
  font-weight: 600;
}

.message-content em {
  font-style: italic;
}

.message-content ul li::marker {
  color: #1890ff;
}

.message-content ol li::marker {
  color: #1890ff;
  font-weight: 600;
}

/* @media (max-width: 768px) { */
  .floating-chat-container {
    width: 200px;
    height: 40px;
  }

  .floating-chat-container.expanded {
    width: 320px;
    max-height: 60vh;
  }

  .chat-header {
    padding: 6px 10px;
    height: 40px;
  }

  .chat-title {
    font-size: 12px;
  }

  .ai-icon {
    font-size: 14px;
  }

  .expand-icon {
    font-size: 11px;
  }

  .model-selector {
    width: 80px;
    font-size: 11px;
  }

  .chat-content {
    height: 300px;
  }

  .chat-messages {
    padding: 12px;
    font-size: 12px;
  }

  .message {
    padding: 6px 10px;
    font-size: 12px;
    max-width: 90%;
  }

  .message-header {
    font-size: 11px;
  }

  .message-content {
    font-size: 13px;
  }

  .question-preview {
    margin-top: 8px;
  }

  .question-preview-header {
    padding: 6px 10px;
  }

  .question-preview-content {
    padding: 10px;
  }

  .question-preview-content p {
    font-size: 12px;
  }

  .question-preview-footer {
    padding: 6px 10px;
  }

  .chat-input-area {
    padding: 12px;
  }

  .input-actions {
    gap: 8px;
  }

  .input-actions .el-button {
    padding: 8px 12px;
    font-size: 13px;
  }

  .quick-actions {
    padding: 0 12px 12px 12px;
  }

  .quick-actions .el-button {
    padding: 6px 12px;
    font-size: 12px;
  }

  .topic-panel {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    border-radius: 0;
    z-index: 10001;
  }

  .topic-panel-header {
    border-radius: 0;
    padding: 12px;
  }

  .topic-panel-header h3 {
    font-size: 15px;
  }

  .topic-search {
    padding: 0 12px 12px 12px;
  }

  .topic-list {
    padding: 0 12px 12px 12px;
  }

  .topic-item {
    padding: 10px;
    margin-bottom: 8px;
  }

  .topic-item-header {
    margin-bottom: 6px;
  }

  .topic-id {
    font-size: 11px;
  }

  .topic-item-content p {
    font-size: 12px;
  }

  .topic-item-footer {
    gap: 6px;
  }

  .message-content h1 {
    font-size: 20px;
  }

  .message-content h2 {
    font-size: 18px;
  }

  .message-content h3 {
    font-size: 16px;
  }

  .message-content h4 {
    font-size: 14px;
  }

  .message-content h5 {
    font-size: 13px;
  }

  .message-content h6 {
    font-size: 12px;
  }

  .message-content pre {
    font-size: 11px;
    padding: 10px;
  }

  .message-content code {
    font-size: 11px;
    padding: 1px 4px;
  }

  .message-content table {
    font-size: 11px;
  }

  .message-content th, 
  .message-content td {
    padding: 4px 8px;
  }
/* } */

/* @media (max-width: 480px) { */
  .floating-chat-container {
    width: 180px;
    height: 36px;
  }

  .floating-chat-container.expanded {
    width: 100%;
    max-width: 300px;
    max-height: 55vh;
  }

  .chat-header {
    padding: 5px 8px;
    height: 36px;
  }

  .chat-title {
    font-size: 11px;
  }

  .model-selector {
    width: 70px;
    font-size: 10px;
  }

  .chat-content {
    height: 250px;
  }

  .chat-messages {
    padding: 10px;
  }

  .message {
    padding: 5px 8px;
    max-width: 95%;
  }

  .chat-input-area {
    padding: 10px;
  }

  .topic-panel-header h3 {
    font-size: 14px;
  }
/* } */
</style>