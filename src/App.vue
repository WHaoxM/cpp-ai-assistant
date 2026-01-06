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
      </nav>
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
/* 1. 基础全局锁定 */
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: 100%; height: 100%; overflow: hidden; [cite_start]} [cite: 1, 2]

.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  [cite_start]position: fixed; [cite: 3]
  top: 0; left: 0;
  background-size: cover;
  background-position: center;
  overflow: hidden; /* 容器本身不滚动，交由 app-main */
}

/* 2. PC端：博客风格浮动导航栏 */
.app-header.pc-only {
  background: rgba(255, 255, 255, 0.7); /* 半透明 */
  backdrop-filter: blur(10px);
  height: 60px !important;
  display: flex;
  justify-content: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  z-index: 100;
}

.header-inner {
  width: 95%;
  max-width: 1200px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-logo {
  font-size: 20px;
  font-weight: bold;
  color: #2c3e50;
}

/* 去掉 Element Menu 的默认背景和边框 */
.blog-menu.el-menu--horizontal {
  background: transparent !important;
  border-bottom: none !important;
}

/* 3. 主区域布局优化 */
.app-main {
  flex: 1;
  width: 100%;
  display: flex;
  justify-content: center; [cite_start]/* 水平居中 */ [cite: 5]
  padding: 40px 15px 100px 15px; /* 顶部留出导航空隙，底部留出TabBar */
  [cite_start]overflow-y: auto; 
}

.content-wrapper {
  [cite_start]width: 100% !important; [cite: 6]
  max-width: 1100px;
  background: rgba(255, 255, 255, 0.85); /* 提升磨砂透明度 */
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.15);
  height: fit-content; /* 紧贴内容 */
}

/* 4. 移动端细节微调 */
@media (max-width: 768px) {
  .pc-only { display: none !important; [cite_start]} [cite: 9]
  .mobile-only { display: flex !important; }

  .app-main {
    padding: 20px 10px 80px 10px;
  }

  .content-wrapper {
    [cite_start]width: 95% !important; [cite: 6]
    padding: 15px;
  }
}

/* 5. 底部 TabBar 沉浸式处理 */
.mobile-tab-bar {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  height: 65px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(15px);
  display: flex;
  justify-content: space-around;
  align-items: center;
  [cite_start]z-index: 9999; [cite: 12]
  border-top: 1px solid rgba(0,0,0,0.05);
  padding-bottom: env(safe-area-inset-bottom); /* 适配刘海屏 */
}
</style>
