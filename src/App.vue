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
/* --- 1. 全局防溢出与小程序化重置 --- */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  /* 彻底禁止页面左右晃动，像小程序一样稳定 */
  overflow-x: hidden; 
  -webkit-text-size-adjust: 100%;
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100vw; /* 锁定宽度为屏幕宽度 */
  overflow-x: hidden;
  background-attachment: scroll; /* 移动端不建议用 fixed，防止缩放 Bug */
}

/* --- 2. 头部标题修复 (针对截图中的巨大字号) --- */
.app-header {
  height: 50px !important;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.logo h1 {
  font-size: 16px !important; /* 大幅缩小标题，避免遮挡视野 */
  text-align: center;
  color: #1890ff;
}

/* --- 3. 容器自适应修复 --- */
.app-main {
  flex: 1;
  padding: 10px 0 80px 0; /* 底部留出 TabBar 的位置 */
  display: flex;
  flex-direction: column;
}

.content-wrapper {
  flex: 1;
  margin: 0 10px; /* 减小外边距 */
  padding: 15px !important; /* 减小内边距 */
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(15px);
  border-radius: 12px;
  min-height: calc(100vh - 160px);
  /* 关键：防止内部元素（表格）撑开容器 */
  width: auto; 
  max-width: calc(100vw - 20px);
  overflow: hidden; 
}

/* --- 4. 解决表格溢出 (最重要的部分) --- */
@media (max-width: 768px) {
  /* 强制表格开启局部横向滚动，而不影响页面整体宽度 */
  .el-table {
    width: 100% !important;
    max-width: 100% !important;
  }
  
  .el-table__body-wrapper, 
  .el-table__header-wrapper {
    overflow-x: auto !important; /* 允许在表格内滑动查看详情 */
  }

  /* 缩小子页面内部的 H1/H2 标题 */
  .content-wrapper h1, 
  .content-wrapper h2 {
    font-size: 20px !important;
    margin-bottom: 15px !important;
    text-align: center;
  }

  /* 筛选区域表单改为垂直排列，防止横向挤压 */
  .el-form--inline .el-form-item {
    display: block !important;
    margin-right: 0 !important;
    margin-bottom: 10px !important;
  }
  
  /* 按钮宽度自适应 */
  .el-button {
    width: auto;
    padding: 8px 12px;
    font-size: 12px;
  }
}

/* --- 5. 底部 TabBar 优化 --- */
.mobile-tab-bar {
  display: flex;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-top: 1px solid #eee;
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

.tab-item.active {
  color: #1890ff;
  font-weight: bold;
}


</style>