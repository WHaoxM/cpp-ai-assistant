<!-- views/AIChat.vue -->
<template>
  <div class="ai-chat-container">
    <el-container class="chat-layout">
      <el-header class="chat-header">
        <h2 class="header-title">
          <el-icon style="margin-right: 10px;">
            <ChatLineRound />
          </el-icon>
          AI 聊天助手
        </h2>
        <div class="model-selection">
          <label>选择模型：</label>
          <ModelSelector 
            v-model="selectedModel" 
            @modelChange="onModelChange"
          />
          <span class="current-model" v-if="currentModelName">
            当前：{{ currentModelName }}
          </span>
        </div>
      </el-header>
      
      <el-main class="chat-main">
        <div class="chat-messages" ref="messagesContainer">
          <div 
            v-for="(message, index) in messages" 
            :key="index" 
            :class="['message', message.role]"
          >
            <div class="message-avatar">
              <el-icon v-if="message.role === 'user'" class="user-icon">
                <User />
              </el-icon>
              <el-icon v-else class="assistant-icon">
                <ChatDotRound />
              </el-icon>
            </div>
            <div class="message-content">
              <div class="message-header">
                <span class="message-sender">{{ message.role === 'user' ? '我' : 'AI助手' }}</span>
                <span class="message-time">{{ message.timestamp ? formatTime(message.timestamp) : currentTime }}</span>
              </div>
              <div class="message-text" v-html="renderText(message.content)"></div>
            </div>
          </div>
          
          <div v-if="isLoading" class="message assistant">
            <div class="message-avatar">
              <el-icon class="assistant-icon">
                <ChatDotRound />
              </el-icon>
            </div>
            <div class="message-content">
              <div class="message-header">
                <span class="message-sender">AI助手</span>
                <span class="message-time">{{ currentTime }}</span>
              </div>
              <div class="message-text">
                <el-skeleton :rows="1" animated />
              </div>
            </div>
          </div>
        </div>
      </el-main>
      
      <el-footer class="chat-footer">
        <div class="input-area">
          <el-input
            v-model="inputMessage"
            placeholder="输入消息..."
            type="textarea"
            :rows="2"
            maxlength="1000"
            show-word-limit
            @keyup.enter="handleEnter"
            :disabled="isLoading"
          />
          <div class="send-button">
            <el-button 
              type="primary" 
              @click="sendMessage" 
              :loading="isLoading"
              :disabled="!inputMessage.trim() || isLoading"
              size="large"
            >
              <el-icon>
                <Promotion />
              </el-icon>
              发送
            </el-button>
          </div>
        </div>
      </el-footer>
    </el-container>
  </div>
</template>

<script>
import { ref, computed, onMounted, nextTick } from 'vue'
import { askAI, getCustomModels } from '../services/aiService'
import { renderText } from '../utils/textUtils'
import ModelSelector from '../components/ModelSelector.vue'
import { 
  ChatLineRound, 
  User, 
  ChatDotRound, 
  Promotion 
} from '@element-plus/icons-vue'

export default {
  name: 'AIChat',
  components: {
    ModelSelector,
    ChatLineRound,
    User,
    ChatDotRound,
    Promotion
  },
  setup() {
    const messages = ref([])
    const inputMessage = ref('')
    const isLoading = ref(false)
    const selectedModel = ref('qwen3-max')
    const messagesContainer = ref(null)
    
    // 系统模型列表
    const systemModels = [
      { value: 'qwen3-max', label: '通义千问3-max' },
      { value: 'gpt-4', label: 'GPT-4' },
      { value: 'claude-3', label: 'Claude-3' },
      { value: 'qwen-max', label: '通义千问-max' },
      { value: 'qwen-plus', label: '通义千问-plus' }
    ]
    
    // 获取当前模型名称
    const currentModelName = computed(() => {
      // 先在系统模型中查找
      const systemModel = systemModels.find(m => m.value === selectedModel.value)
      if (systemModel) {
        return systemModel.label
      }
      
      // 如果不是系统模型，在自定义模型中查找
      const customModels = getCustomModels()
      const customModel = customModels.find(m => m.id === selectedModel.value)
      if (customModel) {
        return customModel.name
      }
      
      // 如果都没找到，返回模型ID
      return selectedModel.value
    })
    
    // 获取当前时间
    const currentTime = ref(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    
    const onModelChange = (modelId) => {
      console.log('模型已切换到:', modelId)
      // 可以在这里重置对话或执行其他操作
    }
    
    // 格式化时间
    const formatTime = (date) => {
      if (!date) return currentTime.value;
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    
    // 自动滚动到底部
    const scrollToBottom = async () => {
      await nextTick()
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    }
    
    // 处理回车键
    const handleEnter = (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        if (!isLoading.value && inputMessage.value.trim()) {
          sendMessage()
        }
      }
    }
    
    const sendMessage = async () => {
      if (!inputMessage.value.trim() || isLoading.value) return
      
      // 添加用户消息
      const userMessageContent = inputMessage.value
      messages.value.push({
        role: 'user',
        content: userMessageContent,
        timestamp: new Date()
      })
      
      inputMessage.value = ''
      isLoading.value = true
      
      try {
        // 构建聊天上下文
        const context = {
          history: messages.value
            .filter(msg => msg.role !== 'assistant' || msg.content !== '正在输入...') // 过滤临时消息
            .slice(-10) // 只保留最近10条消息
        }
        
        // 使用选择的模型进行AI调用
        const response = await askAI(userMessageContent, context, {
          model: selectedModel.value // 传递选择的模型
        })
        
        // 添加AI回复
        messages.value.push({
          role: 'assistant',
          content: response,
          timestamp: new Date()
        })
      } catch (error) {
        console.error('发送消息失败:', error)
        messages.value.push({
          role: 'assistant',
          content: `错误: ${error.message || '未知错误'}`,
          timestamp: new Date()
        })
      } finally {
        isLoading.value = false
        scrollToBottom()
      }
    }
    
    onMounted(() => {
      // 添加欢迎消息
      messages.value.push({
        role: 'assistant',
        content: '您好！我是您的C++ AI助手，专注于C++知识点讲解和题目分析。请问我可以帮您解答什么问题？',
        timestamp: new Date()
      })
    })
    
    return {
      messages,
      inputMessage,
      isLoading,
      selectedModel,
      currentModelName,
      messagesContainer,
      currentTime,
      onModelChange,
      formatTime,
      handleEnter,
      sendMessage,
      scrollToBottom,
      renderText
    }
  }
}
</script>

<style scoped>
.ai-chat-container {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.chat-layout {
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  background-color: transparent;
}

.chat-header {
  background: linear-gradient(135deg, #72a8ff, #4a7dff);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: 60px;
}

.header-title {
  display: flex;
  align-items: center;
  margin: 0;
  font-size: 20px;
}

.model-selection {
  color: white;
  font-size: 14px;
  margin-left: auto;
  margin-right: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  max-width: 500px;
}

.model-selection label {
  font-weight: bold;
  white-space: nowrap;
  font-size: 14px;
}

.current-model {
  font-size: 13px;
  opacity: 0.9;
  padding: 4px 12px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  white-space: nowrap;
}

.chat-main {
  padding: 20px;
  background-color: transparent;
  display: flex;
  flex-direction: column;
  min-height: 400px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-height: calc(100vh - 300px);
  padding: 10px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
  backdrop-filter: blur(5px);
}

.message {
  display: flex;
  gap: 12px;
  max-width: 90%;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.message.user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message-avatar {
  display: flex;
  align-items: flex-start;
  margin-top: 5px;
}

.message-avatar .user-icon {
  color: #4a7dff;
  font-size: 24px;
  background: #e1e7ff;
  border-radius: 50%;
  padding: 8px;
}

.message-avatar .assistant-icon {
  color: #42b983;
  font-size: 24px;
  background: #e0f5e9;
  border-radius: 50%;
  padding: 8px;
}

.message-content {
  flex: 1;
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.message-sender {
  font-weight: bold;
  font-size: 14px;
  color: #333;
}

.message-time {
  font-size: 12px;
  color: #909399;
}

.message-text {
  padding: 12px 16px;
  border-radius: 18px;
  line-height: 1.6;
  word-wrap: break-word;
  white-space: pre-wrap;
  font-size: 14px;
}

.message.user .message-content {
  display: flex;
  flex-direction: column;
}

.message.user .message-text {
  background: #4a7dff;
  color: white;
  border-bottom-right-radius: 4px;
}

.message.assistant .message-text {
  background: #f0f4f8;
  color: #303133;
  border-bottom-left-radius: 4px;
}

.chat-footer {
  padding: 15px 20px;
  background: rgba(255, 255, 255, 0.9);
  border-top: 1px solid #e4e7ed;
  backdrop-filter: blur(5px);
}

.input-area {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.input-area .el-textarea {
  flex: 1;
}

.send-button {
  flex-shrink: 0;
}

.send-button .el-button {
  height: 42px;
  min-width: 80px;
  font-weight: 600;
}

@media (max-width: 768px) {
  .chat-header {
    flex-direction: column;
    gap: 15px;
    padding: 15px;
    height: auto;
  }
  
  .header-title {
    font-size: 18px;
  }
  
  .model-selection {
    width: 100%;
    max-width: 100%;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .model-selection label {
    font-size: 13px;
  }
  
  .current-model {
    font-size: 12px;
    padding: 3px 8px;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .message {
    max-width: 95%;
  }
  
  .chat-main {
    padding: 10px;
  }
  
  .chat-messages {
    max-height: calc(100vh - 350px);
  }

  .chat-footer {
    padding: 12px 15px;
  }

  .input-area {
    flex-direction: column;
    gap: 10px;
  }

  .input-area .el-textarea {
    width: 100%;
  }

  .send-button {
    width: 100%;
  }

  .send-button .el-button {
    width: 100%;
    height: 44px;
    font-size: 15px;
  }
}

@media (max-width: 480px) {
  .chat-header {
    padding: 12px;
  }

  .header-title {
    font-size: 16px;
  }

  .model-selection {
    gap: 6px;
  }

  .model-selection label {
    font-size: 12px;
  }

  .current-model {
    font-size: 11px;
    padding: 2px 6px;
  }

  .message {
    max-width: 98%;
  }

  .chat-main {
    padding: 8px;
  }

  .chat-messages {
    padding: 8px;
    max-height: calc(100vh - 380px);
  }

  .message-avatar .user-icon,
  .message-avatar .assistant-icon {
    font-size: 20px;
    padding: 6px;
  }

  .message-text {
    padding: 10px 12px;
    font-size: 13px;
  }

  .message-header {
    font-size: 11px;
  }

  .message-sender {
    font-size: 13px;
  }

  .chat-footer {
    padding: 10px 12px;
  }

  .input-area .el-textarea {
    font-size: 14px;
  }

  .send-button .el-button {
    height: 40px;
    font-size: 14px;
  }
}
</style>