<template>
  <div class="app-container" :style="{ backgroundImage: `url(${backgroundImage})` }">
    <!-- 顶部导航栏 -->
    <el-header class="app-header">
      <div class="header-content">
        <div class="logo">
          <h1>C++ AI 题库助手</h1>
        </div>
        <el-menu
          mode="horizontal"
          :default-active="activeMenu"
          class="top-menu"
          router
        >
          <el-menu-item index="/">
            <el-icon><Document /></el-icon>
            <span>题库列表</span>
          </el-menu-item>
          <el-menu-item index="/ai-chat">
            <el-icon><ChatDotRound /></el-icon>
            <span>AI 聊天</span>
          </el-menu-item>
          <el-menu-item index="/model-training">
            <el-icon><MagicStick /></el-icon>
            <span>模型训练</span>
          </el-menu-item>
          <el-menu-item index="/custom-models">
            <el-icon><Management /></el-icon>
            <span>自定义模型</span>
          </el-menu-item>
          <el-menu-item index="/api-config">
            <el-icon><Setting /></el-icon>
            <span>API配置</span>
          </el-menu-item>
          <el-menu-item index="/online-ai-models">
            <el-icon><Grid /></el-icon>
            <span>在线AI模型</span>
          </el-menu-item>
        </el-menu>
      </div>
    </el-header>
    
    <!-- 主内容区域 -->
  <el-main class="app-main">
  <div class="content-wrapper">
    <router-view />
    <div class="empty-decoration">
      <div class="decoration-text">专注 C++ 进阶提升</div>
    </div>
  </div>
</el-main>
    <div class="mobile-tab-bar">
  <div class="tab-item" :class="{active: activeMenu === '/'}" @click="$router.push('/')">
    <el-icon><Document /></el-icon>
    <span>题库</span>
  </div>
  <div class="tab-item" :class="{active: activeMenu === '/ai-chat'}" @click="$router.push('/ai-chat')">
    <el-icon><ChatDotRound /></el-icon>
    <span>AI聊天</span>
  </div>
  <div class="tab-item" :class="{active: activeMenu === '/model-training'}" @click="$router.push('/model-training')">
    <el-icon><MagicStick /></el-icon>
    <span>训练</span>
  </div>
  <div class="tab-item" :class="{active: activeMenu === '/api-config'}" @click="$router.push('/api-config')">
    <el-icon><Setting /></el-icon>
    <span>设置</span>
  </div>
</div>

    <!-- 底部信息 -->
    <el-footer class="app-footer">
      <div class="footer-content">
        <div class="footer-top">
          <div class="footer-section">
            <h4>产品</h4>
            <ul>
              <li><a href="/">题库列表</a></li>
              <li><a href="/ai-chat">AI 聊天</a></li>
              <li><a href="/model-training">模型训练</a></li>
              <li><a href="/docs/index.html">小白指南</a></li>
            </ul>
          </div>
          <div class="footer-section">
            <h4>服务</h4>
            <ul>
              <li><a href="/custom-models">自定义模型</a></li>
              <li><a href="/api-config">API 配置</a></li>
              <li><a href="/online-ai-models">在线 AI 模型</a></li>
            </ul>
          </div>
          <div class="footer-section">
            <h4>关于我</h4>
            <ul>
              <li>C++ AI 题库助手</li>
              <li>个人项目</li>
              <li>助力高效学习 C++</li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2026 C++ AI 题库助手. 版权所有 | 帮助您高效复习 C++ 知识</p>
          <div class="footer-links">
            <a href="#" @click.prevent="showPrivacy">隐私政策</a>
            <span class="divider">|</span>
            <a href="#" @click.prevent="showTerms">使用条款</a>
          </div>
        </div>
      </div>
    </el-footer>
    
    <!-- 悬浮AI聊天组件 -->
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
/* --- 1. 全局基础重构 --- */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --app-primary: #1890ff;
  --glass-bg: rgba(255, 255, 255, 0.85);
  --glass-border: rgba(255, 255, 255, 0.4);
  --tab-bar-height: 65px;
}

html, body {
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  -webkit-text-size-adjust: 100%; /* 防止移动端旋转时字体缩放 */
}

/* --- 2. 容器修复 --- */
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100vw;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: scroll; /* 移动端scroll性能更好，避开缩放Bug */
}

/* --- 3. 头部 --- */
.app-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(15px);
  border-bottom: 1px solid var(--glass-border);
  height: 60px !important;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 100%;
}

/* --- 4. 主内容与装饰位 (核心修复) --- */
.app-main {
  flex: 1; /* 撑开垂直空间 */
  display: flex;
  flex-direction: column;
  padding: 20px 0;
}

.content-wrapper {
  flex: 1; 
  display: flex;
  flex-direction: column;
  position: relative; /* 为装饰图定位 */
  margin: 0 16px 20px 16px;
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
  min-height: 70vh;
  z-index: 1;
}

/* 装饰性占位图样式 */
.empty-decoration {
  position: absolute;
  bottom: 40px;
  right: 20px;
  width: 150px;
  height: 150px;
  opacity: 0.1; /* 淡淡的底纹感 */
  pointer-events: none; /* 不挡住点击 */
  z-index: -1;
  background-image: url('https://cdn-icons-png.flaticon.com/512/2103/2103633.png'); /* 这是一个代码相关的Icon，你可以换成自己的 */
  background-size: contain;
  background-repeat: no-repeat;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.decoration-text {
  font-size: 12px;
  color: #000;
  white-space: nowrap;
  transform: translateY(20px);
}

/* --- 5. 移动端 TabBar --- */
.mobile-tab-bar {
  display: none;
}

@media (max-width: 768px) {
  .top-menu { display: none !important; }
  .header-content { justify-content: center; }

  .app-main {
    padding: 10px 0 80px 0; /* 为底部TabBar留位 */
  }

  .content-wrapper {
    margin: 0 12px;
    padding: 16px;
    min-height: calc(100vh - 180px); /* 确保背景撑满屏幕 */
  }

  .mobile-tab-bar {
    display: flex;
    position: fixed;
    bottom: 0; left: 0; right: 0;
    height: var(--tab-bar-height);
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(20px);
    border-top: 1px solid rgba(0, 0, 0, 0.05);
    justify-content: space-around;
    align-items: center;
    z-index: 2000;
    padding-bottom: env(safe-area-inset-bottom);
  }

  .tab-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #8e8e93;
    font: 10px/1.5 inherit;
  }

  .tab-item.active { color: var(--app-primary); }
  
  .app-footer {
    padding: 20px 0 120px 0 !important; /* 彻底移除移动端页脚的视觉负担 */
    background: transparent;
  }
  
  .footer-top { display: none !important; }
}

/* --- 6. PC版底部 --- */
@media (min-width: 769px) {
  .app-footer {
    background: #fff;
    padding: 40px 0 20px;
    margin-top: auto;
    border-top: 1px solid #eee;
  }
  
  .footer-top {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    max-width: 1200px;
    margin: 0 auto 30px;
  }
}

/* --- 7. Element Plus 修正 --- */
.el-table {
  background-color: transparent !important;
}
.el-table tr, .el-table th {
  background-color: transparent !important;
}
</style>