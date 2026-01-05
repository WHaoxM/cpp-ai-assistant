<template>
  <div class="app-container" :style="{ backgroundImage: `url(${backgroundImage})` }">
    <el-header class="app-header">
      <div class="header-content">
        <div class="logo">
          <h1>C++ AI 题库助手</h1>
        </div>
        <el-menu
          mode="horizontal"
          :default-active="activeMenu"
          class="top-menu pc-only"
          router
        >
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
        <div class="empty-decoration mobile-only">
          <p>专注 C++ 进阶提升</p>
        </div>
      </div>
    </el-main>

    <nav class="mobile-tab-bar mobile-only">
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
        <p>&copy; 2026 C++ AI 题库助手. 助力您高效复习</p>
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
/* --- 1. 核心重置与全局变量 --- */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --app-primary: #1890ff;
  --glass-bg: rgba(255, 255, 255, 0.8);
  --glass-border: rgba(255, 255, 255, 0.4);
}

html, body {
  width: 100%;
  height: 100%;
  overflow-x: hidden; /* 强制消除物理溢出，防止缩放错误 */
  background-color: #f5f7fa;
}

/* --- 2. 响应式布局显示控制 --- */
@media (max-width: 768px) {
  .pc-only { display: none !important; }
}
@media (min-width: 769px) {
  .mobile-only { display: none !important; }
}

/* --- 3. 容器布局：PC端丝滑，移动端稳定 --- */
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100vw;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed; /* PC端背景固定，增加丝滑感 */
  transition: background 0.3s ease;
}

@media (max-width: 768px) {
  .app-container {
    background-attachment: scroll; /* 移动端滚动背景，提升性能，防止渲染Bug */
  }
}

/* --- 4. 头部导航适配 --- */
.app-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(15px);
  border-bottom: 1px solid var(--glass-border);
  height: 60px !important;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

.logo h1 {
  font-size: clamp(14px, 4vw, 20px); /* 自动根据屏幕缩放字号 */
  color: var(--app-primary);
  font-weight: 800;
}

/* --- 5. 主内容区域适配 (解决拖动不全) --- */
.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px 0;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.content-wrapper {
  flex: 1;
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 24px;
  margin: 0 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--glass-border);
  /* 修复移动端大小错误的关键 */
  width: auto;
  overflow: hidden; 
  display: flex;
  flex-direction: column;
}

@media (max-width: 768px) {
  .app-main {
    padding: 10px 0 80px 0; /* 为底部TabBar预留空间 */
  }
  .content-wrapper {
    margin: 0 10px;
    padding: 15px !important;
    border-radius: 12px;
    min-height: calc(100vh - 160px);
  }
  
  /* 强制子页面内部所有表格允许局部横向滚动，不撑开父容器 */
  .el-table {
    max-width: 100% !important;
  }
  .el-table__inner-wrapper {
    overflow-x: auto !important;
  }
}

/* --- 6. 移动端 TabBar (小程序化视觉) --- */
.mobile-tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 65px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 2000;
  padding-bottom: env(safe-area-inset-bottom);
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #8e8e93;
  font-size: 11px;
}

.tab-item .el-icon {
  font-size: 22px;
  margin-bottom: 3px;
}

.tab-item.active {
  color: var(--app-primary);
  font-weight: bold;
}

/* --- 7. 页面平滑过渡 (丝滑感) --- */
.router-view-content {
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}


</style>