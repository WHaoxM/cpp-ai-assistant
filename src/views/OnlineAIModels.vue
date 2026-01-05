<template>
  <div class="online-models-container">
    <h1>在线AI模型</h1>
    
    <el-card shadow="hover" class="models-card">
      <template #header>
        <div class="card-header">
          <h2>在线AI模型</h2>
          <p>直接使用DeepSeek和Qwen的在线AI模型，无需配置API密钥</p>
        </div>
      </template>
      
      <el-tabs v-model="activeTab" type="border-card">
        <!-- DeepSeek -->
        <el-tab-pane label="DeepSeek" name="deepseek">
          <div class="model-embed-container">
            <div class="model-info">
              <h3>DeepSeek 在线AI助手</h3>
              <p>DeepSeek是一款功能强大的AI助手，擅长代码生成、数学推理和自然语言处理。</p>
              <el-divider />
              <div class="usage-tips">
                <h4>使用提示：</h4>
                <ul>
                  <li>可以直接在右侧窗口中与DeepSeek进行对话</li>
                  <li>支持C++代码生成、题目解答和知识点讲解</li>
                  <li>无需配置API密钥，直接使用在线服务</li>
                  <li>可以将DeepSeek的回答复制到本地使用</li>
                </ul>
              </div>
            </div>
            <div class="model-iframe-container">
              <div class="iframe-placeholder">
                <el-icon class="placeholder-icon"><Management /></el-icon>
                <h3>DeepSeek 在线AI助手</h3>
                <p>由于安全策略限制，无法在页面中直接嵌入</p>
                <el-button type="primary" @click="openDeepSeek">
                  <el-icon><ChatDotRound /></el-icon> 在新窗口打开 DeepSeek
                </el-button>
              </div>
            </div>
          </div>
        </el-tab-pane>
        
        <!-- Qwen -->
        <el-tab-pane label="Qwen" name="qwen">
          <div class="model-embed-container">
            <div class="model-info">
              <h3>Qwen 在线AI助手</h3>
              <p>Qwen是阿里云开发的AI助手，支持多轮对话、代码生成和知识问答。</p>
              <el-divider />
              <div class="usage-tips">
                <h4>使用提示：</h4>
                <ul>
                  <li>可以直接在右侧窗口中与Qwen进行对话</li>
                  <li>支持C++代码生成、题目解答和知识点讲解</li>
                  <li>无需配置API密钥，直接使用在线服务</li>
                  <li>可以将Qwen的回答复制到本地使用</li>
                </ul>
              </div>
            </div>
            <div class="model-iframe-container">
              <div class="iframe-placeholder">
                <el-icon class="placeholder-icon"><MagicStick /></el-icon>
                <h3>Qwen 在线AI助手</h3>
                <p>由于安全策略限制，无法在页面中直接嵌入</p>
                <el-button type="primary" @click="openQwen">
                  <el-icon><ChatDotRound /></el-icon> 在新窗口打开 Qwen
                </el-button>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    
    <!-- 说明卡片 -->
    <el-card shadow="hover" class="info-card">
      <template #header>
        <h3>使用说明</h3>
      </template>
      <div class="info-content">
        <h4>关于在线AI模型</h4>
        <p>在线AI模型是指直接嵌入第三方AI服务提供商的网页，无需配置API密钥即可使用。这些模型通常具有强大的功能和良好的用户体验，但可能受到网络限制和服务提供商的使用条款约束。</p>
        
        <h4>DeepSeek和Qwen的特点</h4>
        <div class="model-features">
          <el-col :span="12">
            <h5>DeepSeek</h5>
            <ul>
              <li>擅长代码生成和数学推理</li>
              <li>支持多种编程语言</li>
              <li>提供详细的解释和示例</li>
            </ul>
          </el-col>
          <el-col :span="12">
            <h5>Qwen</h5>
            <ul>
              <li>多轮对话能力强</li>
              <li>支持中文语境下的自然语言处理</li>
              <li>提供丰富的知识问答</li>
            </ul>
          </el-col>
        </div>
        
        <h4>使用建议</h4>
        <ul>
          <li>对于简单的问题和代码生成，可以直接使用在线AI模型</li>
          <li>对于需要本地处理或离线使用的场景，建议配置自定义模型</li>
          <li>在使用在线AI模型时，请注意保护敏感信息</li>
          <li>遵守各AI服务提供商的使用条款和隐私政策</li>
        </ul>
      </div>
    </el-card>
  </div>
</template>

<script>
import { ref } from 'vue'
import { Management, MagicStick, ChatDotRound } from '@element-plus/icons-vue'

export default {
  name: 'OnlineAIModels',
  components: {
    Management,
    MagicStick,
    ChatDotRound
  },
  setup() {
    const activeTab = ref('deepseek')
    
    // 在线AI模型的URL
    const deepseekUrl = ref('https://chat.deepseek.com/')
    const qwenUrl = ref('https://tongyi.aliyun.com/qianwen/')
    
    // 打开 DeepSeek
    const openDeepSeek = () => {
      window.open(deepseekUrl.value, '_blank', 'noopener,noreferrer')
    }
    
    // 打开 Qwen
    const openQwen = () => {
      window.open(qwenUrl.value, '_blank', 'noopener,noreferrer')
    }
    
    return {
      activeTab,
      deepseekUrl,
      qwenUrl,
      openDeepSeek,
      openQwen
    }
  }
}
</script>

<style scoped>
.online-models-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.models-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.card-header h2 {
  margin: 0 0 5px 0;
}

.card-header p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.model-embed-container {
  display: flex;
  gap: 20px;
  height: 70vh;
}

.model-info {
  flex: 0 0 300px;
  padding: 20px;
  background-color: #fafafa;
  border-radius: 8px;
  overflow-y: auto;
}

.model-info h3 {
  margin-top: 0;
  margin-bottom: 10px;
}

.model-info p {
  margin-bottom: 15px;
  line-height: 1.5;
}

.usage-tips h4 {
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: bold;
}

.usage-tips ul {
  margin: 0;
  padding-left: 20px;
}

.usage-tips li {
  margin-bottom: 8px;
  font-size: 13px;
  line-height: 1.4;
}

.model-iframe-container {
  flex: 1;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.iframe-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.placeholder-icon {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.9;
}

.iframe-placeholder h3 {
  margin: 0 0 15px 0;
  font-size: 24px;
  font-weight: 600;
}

.iframe-placeholder p {
  margin: 0 0 25px 0;
  font-size: 14px;
  opacity: 0.9;
}

.iframe-placeholder .el-button {
  padding: 12px 24px;
  font-size: 14px;
}

.info-card {
  margin-top: 20px;
}

.info-content h4 {
  margin-top: 15px;
  margin-bottom: 10px;
}

.info-content p {
  margin-bottom: 15px;
  line-height: 1.5;
}

.model-features {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
}

.model-features h5 {
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: bold;
}

.model-features ul {
  margin: 0;
  padding-left: 20px;
}

.model-features li {
  margin-bottom: 8px;
  font-size: 13px;
  line-height: 1.4;
}
</style>