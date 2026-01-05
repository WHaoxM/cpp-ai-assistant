<template>
  <div class="app-container" :style="{ backgroundImage: `url(${backgroundImage})` }">
    <el-header class="app-header">
      <div class="header-content">
        <div class="logo">
          <h1>C++ AI 题库</h1>
        </div>
        <el-menu mode="horizontal" :default-active="activeMenu" class="top-menu pc-only" router>
          <el-menu-item index="/">题库列表</el-menu-item>
          <el-menu-item index="/ai-chat">AI 聊天</el-menu-item>
          <el-menu-item index="/model-training">模型训练</el-menu-item>
          <el-menu-item index="/api-config">API配置</el-menu-item>
        </el-menu>
      </div>
    </el-header>
    
    <el-main class="app-main">
      <div class="content-wrapper">
        <router-view />
        <div class="empty-decoration">
          <div class="decoration-icon"></div>
          <p>专注 C++ 进阶提升</p>
        </div>
      </div>
    </el-main>

    <nav class="mobile-tab-bar">
      <div class="tab-item" :class="{active: activeMenu === '/'}" @click="$router.push('/')">
        <el-icon><Document /></el-icon><span>题库</span>
      </div>
      <div class="tab-item" :class="{active: activeMenu === '/ai-chat'}" @click="$router.push('/ai-chat')">
        <el-icon><ChatDotRound /></el-icon><span>AI聊天</span>
      </div>
      <div class="tab-item" :class="{active: activeMenu === '/model-training'}" @click="$router.push('/model-training')">
        <el-icon><MagicStick /></el-icon><span>训练</span>
      </div>
      <div class="tab-item" :class="{active: activeMenu === '/api-config'}" @click="$router.push('/api-config')">
        <el-icon><Setting /></el-icon><span>设置</span>
      </div>
    </nav>
    
    <el-footer class="app-footer pc-only">
      <div class="footer-bottom">
        <p>&copy; 2026 C++ AI 题库助手</p>
      </div>
    </el-footer>

    <FloatingAIChat ref="floatingChat" @question-selected="handleQuestionSelected" />
  </div>
</template>


<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Document, ChatDotRound, MagicStick, Management, Setting, Grid } from '@element-plus/icons-vue'
import FloatingAIChat from './components/FloatingAIChat.vue'

export default {
  name: 'App',
  components: {
    Document,
    ChatDotRound,
    MagicStick,
    Management,
    Setting,
    Grid,
    FloatingAIChat
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const activeMenu = computed(() => {
      return route.path
    })
    
    // 处理题目选择事件
    const handleQuestionSelected = (question) => {
      router.push(`/question/${question.id}`)
    }
    
    // 背景图URL
    const backgroundImage = ref('')
    
    // 获取随机背景图
    const getBackgroundImage = async () => {
      try {
        // 根据设备类型使用不同的背景图API
        const isMobile = window.innerWidth < 768;
        // PC端使用风景图，移动端使用移动端专用图
        backgroundImage.value = isMobile ? 'https://t.alcy.cc/mp' : 'https://t.alcy.cc/fj'
      } catch (error) {
        console.error('获取背景图失败:', error)
        // 发生错误时，使用备用URL
        backgroundImage.value = 'https://t.alcy.cc/fj'
      }
    }
    
    // 显示隐私政策
    const showPrivacy = () => {
      alert('隐私政策：我们重视您的隐私，不会存储或泄露您的个人信息。')
    }
    
    // 显示使用条款
    const showTerms = () => {
      alert('使用条款：请合理使用本系统，不要输入任何敏感或违法信息。')
    }
    
    onMounted(() => {
      // 页面加载时获取背景图
      getBackgroundImage()
    })
    
    return {
      activeMenu,
      showPrivacy,
      showTerms,
      backgroundImage,
      handleQuestionSelected
    }
  }
}
</script>
<style>
/* --- 1. 移动端优先与防溢出重置 --- */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --app-primary: #1890ff;
  --glass-bg: rgba(255, 255, 255, 0.82);
  --glass-border: rgba(255, 255, 255, 0.4);
}

html, body {
  width: 100%;
  height: 100%;
  /* 解决移动端左右晃动的关键 */
  overflow-x: hidden; 
  -webkit-font-smoothing: antialiased;
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  /* 防止子元素（如表格）撑破容器 */
  overflow-x: hidden; 
  background-size: cover;
  background-position: center;
  background-attachment: scroll; 
}

/* --- 2. 头部：移动端大幅收缩 --- */
.app-header {
  height: 54px !important;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--glass-border);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
  display: flex;
  align-items: center;
  height: 100%;
}

.logo h1 {
  font-size: 16px; /* 解决标题过大挡住视野 */
  font-weight: bold;
  color: var(--app-primary);
  white-space: nowrap;
}

/* --- 3. 主内容：实现小程序般的容器感 --- */
.app-main {
  flex: 1;
  padding: 12px 0 80px 0; /* 底部留出TabBar空间 */
  display: flex;
  flex-direction: column;
}

.content-wrapper {
  flex: 1;
  margin: 0 12px;
  padding: 16px;
  background: var(--glass-bg);
  backdrop-filter: blur(15px);
  border-radius: 12px;
  border: 1px solid var(--glass-border);
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  min-height: calc(100vh - 160px);
  display: flex;
  flex-direction: column;
  /* 确保内部长内容不撑开父级 */
  overflow: hidden; 
}

/* --- 4. 移动端底部 TabBar --- */
.mobile-tab-bar {
  display: flex;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(0,0,0,0.05);
  z-index: 2000;
  padding-bottom: env(safe-area-inset-bottom);
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #909399;
  font-size: 11px;
}

.tab-item .el-icon {
  font-size: 20px;
  margin-bottom: 2px;
}

.tab-item.active {
  color: var(--app-primary);
  font-weight: bold;
}

/* --- 5. 装饰位与响应式修正 --- */
.empty-decoration {
  margin-top: auto;
  padding-top: 40px;
  text-align: center;
  opacity: 0.3;
}

.empty-decoration p {
  font-size: 12px;
  color: #666;
}

/* 隐藏PC端的各种元素 */
@media (max-width: 768px) {
  .pc-only {
    display: none !important;
  }

  /* 核心：修复截图中“题目助手”四个大字挡住视野 */
  /* 假设你在子页面有 h1 或 h2 */
  .app-main h1, .app-main h2 {
    font-size: 20px !important;
    margin-bottom: 12px !important;
    text-align: center;
  }

  /* 修复表格溢出（最重要！） */
  .el-table {
    font-size: 12px !important;
  }
  
  .el-table__body-wrapper, .el-table__header-wrapper {
    overflow-x: auto !important; /* 允许表格内部横向滚动，而非全屏缩放 */
  }

  /* 搜索表单在移动端改为单列 */
  .el-form--inline .el-form-item {
    display: block !important;
    margin-right: 0 !important;
  }
}

/* PC 端隐藏移动端组件 */
@media (min-width: 769px) {
  .mobile-tab-bar {
    display: none !important;
  }
}

</style>