<template>
  <div class="app-container" :style="{ backgroundImage: `url(${backgroundImage})` }">
    <el-header class="app-header pc-only">
      <div class="header-inner">
        <div class="header-logo">C++ AI 题库助手</div>
        <el-menu mode="horizontal" :default-active="activeMenu" class="blog-menu" router>
          <el-menu-item index="/">题库列表</el-menu-item>
          <el-menu-item index="/ai-chat">AI 聊天</el-menu-item>
          <el-menu-item index="/model-training">模型训练</el-menu-item>
          <el-menu-item index="/api-config">API配置</el-menu-item>
        </el-menu>
      </div>
    </el-header>

    <div class="mobile-top-bar mobile-only">
      <span>C++ AI Assistant</span>
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
    
    <FloatingAIChat ref="floatingChat" />
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
/* 1. 全局锁定与全屏容器 [cite: 1, 2, 3] */
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: 100%; height: 100%; overflow: hidden; }

.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  position: fixed; /* 锁定位置防止晃动  */
  top: 0; left: 0;
  background-size: cover;
  background-position: center;
  z-index: 1;
}

/* 2. PC端：博客风毛玻璃导航 */
.app-header.pc-only {
  background: rgba(255, 255, 255, 0.4) !important; /* 极浅透明 */
  backdrop-filter: blur(12px); /* 毛玻璃效果 */
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  height: 60px !important;
  display: flex;
  justify-content: center;
  z-index: 100;
}

.header-inner {
  width: 90%;
  max-width: 1200px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-logo {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  letter-spacing: 1px;
}

/* 极简菜单样式 */
.blog-menu.el-menu--horizontal {
  background: transparent !important;
  border-bottom: none !important;
}
.blog-menu .el-menu-item {
  background: transparent !important;
  font-weight: 500;
}

/* 3. 主区域布局 [cite: 4, 5] */
.app-main {
  flex: 1;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start; /* 内容从上方开始 */
  padding: 30px 15px 100px 15px; /* 留出底部空间 [cite: 5] */
  overflow-y: auto; /* 仅允许纵向滚动 [cite: 4] */
}

.content-wrapper {
  width: 95% !important; /* [cite: 5] */
  max-width: 1100px; /* [cite: 6] */
  background: rgba(255, 255, 255, 0.75); /* 毛玻璃卡片 [cite: 6] */
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* 4. 移动端：底部导航栏  */
.mobile-tab-bar {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  height: 65px;
  background: rgba(255, 255, 255, 0.85); /* 毛玻璃 [cite: 12] */
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: space-around;
  align-items: center;
  border-top: 1px solid rgba(0,0,0,0.05);
  z-index: 9999;
  padding-bottom: env(safe-area-inset-bottom);
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 12px;
  color: #666;
}
.tab-item.active { color: #409EFF; font-weight: bold; }
.tab-item .el-icon { font-size: 22px; margin-bottom: 3px; }

/* 5. 响应式控制 */
@media (max-width: 768px) {
  .pc-only { display: none !important; }
  .mobile-only { display: flex !important; }
  
  .mobile-top-bar {
    height: 44px;
    justify-content: center;
    align-items: center;
    background: rgba(255, 255, 255, 0.4);
    backdrop-filter: blur(5px);
    font-size: 14px;
    font-weight: bold;
    color: #333;
  }
}

@media (min-width: 769px) {
  .mobile-only { display: none !important; }
}
</style>
