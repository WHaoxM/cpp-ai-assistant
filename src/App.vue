<template>
  <div class="app-container" :style="{ backgroundImage: `url(${backgroundImage})` }">
    <el-header class="app-header">
      <div class="header-content">
        <div class="logo">
          <h1>C++ AI 题库助手</h1>
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
      </div>
    </el-main>

    <nav class="mobile-tab-bar">
      <div class="tab-item" :class="{active: activeMenu === '/'}" @click="$router.push('/')">
        <el-icon><Document /></el-icon><span>题库</span>
      </div>
      <div class="tab-item" :class="{active: activeMenu === '/ai-chat'}" @click="$router.push('/ai-chat')">
        <el-icon><ChatDotRound /></el-icon><span>聊天</span>
      </div>
      <div class="tab-item" :class="{active: activeMenu === '/model-training'}" @click="$router.push('/model-training')">
        <el-icon><MagicStick /></el-icon><span>训练</span>
      </div>
      <div class="tab-item" :class="{active: activeMenu === '/api-config'}" @click="$router.push('/api-config')">
        <el-icon><Setting /></el-icon><span>设置</span>
      </div>
    </nav>
    
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
/* --- 1. 全局重置：彻底禁止横向晃动 --- */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  overflow-x: hidden; /* 核心：防止左右出现黑边或空白 */
  -webkit-text-size-adjust: 100%;
}

/* --- 2. 容器：锁定移动端分辨率感 --- */
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100vw;
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
}

/* --- 3. 头部适配 --- */
.app-header {
  height: 50px !important;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 1000;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

.logo h1 {
  font-size: 16px;
  color: #1890ff;
  font-weight: bold;
}

/* --- 4. 主区域：居中且占满 --- */
.app-main {
  flex: 1;
  padding: 10px 0 70px 0; /* 为底部留位 */
  display: flex;
  flex-direction: column;
  align-items: center; /* 居中内容 */
}

.content-wrapper {
  width: 94%; /* 移动端占满 94% 宽度，左右留一点点呼吸感 */
  max-width: 1200px; /* PC端限制最大宽度 */
  flex: 1;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(15px);
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 关键：防止内部内容撑破容器 */
}

/* --- 5. 解决表格无法展示完全的问题 --- */
/* 当表格太宽时，允许在卡片内部左右拖动，而不是整个页面拖动 */
.el-table {
  width: 100% !important;
}

.el-table__inner-wrapper {
  overflow-x: auto !important; 
}

/* --- 6. 响应式显示切换 --- */
@media (max-width: 768px) {
  .pc-only {
    display: none !important;
  }
  
  .app-container {
    background-attachment: scroll; /* 移动端背景不固定，更顺滑 */
  }

  /* 调整标题在移动端的比例 */
  .content-wrapper h1 {
    font-size: 1.2rem !important;
    text-align: center;
  }
}

/* --- 7. 移动端底部 TabBar (始终显示) --- */
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
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 11px;
}

.tab-item .el-icon {
  font-size: 20px;
  margin-bottom: 2px;
}

.tab-item.active {
  color: #1890ff;
  font-weight: bold;
}

@media (min-width: 769px) {
  .mobile-tab-bar {
    display: none !important; /* PC端隐藏底部导航 */
  }
}
</style>