<template>
  <div class="app-container" :style="{ backgroundImage: `url(${backgroundImage})` }">
    <el-header class="app-header pc-only">
      <div class="header-content">
        <div class="logo">C++ AI 题库助手</div>
        <el-menu mode="horizontal" :default-active="activeMenu" class="top-menu" router>
          <el-menu-item index="/">题库列表</el-menu-item>
          <el-menu-item index="/ai-chat">AI 聊天</el-menu-item>
          <el-menu-item index="/model-training">模型训练</el-menu-item>
          <el-menu-item index="/api-config">API配置</el-menu-item>
        </el-menu>
      </div>
    </el-header>

    <div class="mobile-header mobile-only">
      <span>C++ AI 题库助手</span>
    </div>

    <el-main class="app-main">
      <div class="content-wrapper">
        <router-view />
      </div>
    </el-main>

    <nav class="mobile-tab-bar mobile-only">
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
/* 全局基础重置 */
body, html {
  margin: 0; padding: 0;
  height: 100%; width: 100%;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.app-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  transition: background-image 0.5s ease-in-out;
}

/* 背景蒙版：增加一层微暗磨砂感，提升文字可读性 */
.app-container::before {
  content: "";
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.15); 
  z-index: 0;
}

/* 主内容区 */
.app-main {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  justify-content: center;
  padding: 20px 15px 80px 15px; /* 底部预留 TabBar 空间 */
  overflow-y: auto;
}

.content-wrapper {
  width: 100%;
  max-width: 1100px;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  height: fit-content; /* 随内容高度变化 */
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* 移动端专属样式 */
@media (max-width: 768px) {
  .pc-only { display: none !important; }
  
  .mobile-header {
    position: sticky;
    top: 0;
    z-index: 100;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    font-weight: bold;
    color: #333;
    border-bottom: 1px solid rgba(0,0,0,0.05);
  }

  .content-wrapper {
    padding: 15px;
    margin-top: 10px;
  }

  /* 表格收纳优化：允许横向滚动，但不撑破父容器 */
  .el-table {
    border-radius: 8px;
  }
}

/* 底部 TabBar 优化 */
.mobile-tab-bar {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  height: 65px;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  justify-content: space-around;
  align-items: center;
  border-top: 1px solid rgba(0,0,0,0.05);
  padding-bottom: env(safe-area-inset-bottom); /* 适配刘海屏底部 */
  z-index: 1000;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #909399;
  font-size: 12px;
  transition: all 0.3s;
}

.tab-item.active {
  color: #409EFF;
  transform: translateY(-2px);
}

.tab-item .el-icon {
  font-size: 24px;
  margin-bottom: 4px;
}
</style>
