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
/* --- 1. 全局基础重置 --- */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --app-primary: #1890ff;
  --glass-bg: rgba(255, 255, 255, 0.75);
  --glass-border: rgba(255, 255, 255, 0.3);
  --tab-bar-height: 65px;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
  color: #333;
  -webkit-font-smoothing: antialiased;
  background-color: #f0f2f5;
  line-height: 1.6;
}

/* --- 2. 容器与背景 --- */
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  transition: background-image 0.5s ease-in-out;
}

/* --- 3. 头部导航 (响应式) --- */
.app-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(15px);
  border-bottom: 1px solid var(--glass-border);
  height: 60px !important;
  padding: 0 !important;
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

.logo h1 {
  font-size: 18px;
  font-weight: 800;
  color: var(--app-primary);
  margin: 0;
  letter-spacing: -0.5px;
}

/* --- 4. 主内容区域 --- */
.app-main {
  flex: 1;
  padding: 20px 0;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.content-wrapper {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 24px;
  margin: 0 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--glass-border);
  min-height: 60vh;
}

/* --- 5. PC版底部 (大屏显示) --- */
.app-footer {
  background: #fff;
  padding: 40px 0 20px 0 !important;
  height: auto !important;
  margin-top: 40px;
  border-top: 1px solid #eee;
}

.footer-top {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  max-width: 1200px;
  margin: 0 auto 30px;
  padding: 0 20px;
}

.footer-section h4 {
  font-size: 16px;
  margin-bottom: 15px;
  color: #333;
}

.footer-section ul {
  list-style: none;
  padding: 0;
}

.footer-section ul li {
  margin-bottom: 8px;
  font-size: 14px;
}

.footer-section a {
  color: #666;
  transition: color 0.3s;
}

.footer-section a:hover {
  color: var(--app-primary);
}

.footer-bottom {
  border-top: 1px solid #f0f0f0;
  padding-top: 20px;
  text-align: center;
  font-size: 13px;
  color: #999;
}

/* --- 6. 移动端底部 TabBar (默认隐藏) --- */
.mobile-tab-bar {
  display: none;
}

/* --- 7. 移动端适配 (核心代码) --- */
@media (max-width: 768px) {
  /* 隐藏PC端导航，Logo居中 */
  .top-menu {
    display: none !important;
  }
  
  .header-content {
    justify-content: center;
  }

  /* 调整内容区域间距，防止被底部TabBar遮挡 */
  .app-main {
    padding: 12px 0 80px 0; /* 底部留出 80px */
  }

  .content-wrapper {
    margin: 0 12px;
    padding: 16px;
    border-radius: 12px;
  }

  /* 极简页脚：移动端不显示复杂链接，只显示版权 */
  .footer-top {
    display: none !important;
  }

  .app-footer {
    background: transparent;
    border: none;
    margin-top: 0;
    padding: 20px 0 100px 0 !important; /* 额外padding防止TabBar遮挡版权字 */
  }

  .footer-bottom {
    border: none;
  }

  /* 显示底部导航栏 */
  .mobile-tab-bar {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: var(--tab-bar-height);
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(20px);
    border-top: 1px solid rgba(0, 0, 0, 0.05);
    justify-content: space-around;
    align-items: center;
    z-index: 2000;
    padding-bottom: env(safe-area-inset-bottom); /* 适配全面屏底部横条 */
  }

  .tab-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #8e8e93;
    font-size: 10px;
    flex: 1;
    transition: all 0.2s;
  }

  .tab-item .el-icon {
    font-size: 22px;
    margin-bottom: 4px;
  }

  .tab-item.active {
    color: var(--app-primary);
  }

  /* 浮动AI按钮位置调整，防止遮挡TabBar */
  .floating-ai-chat {
    bottom: 85px !important;
    right: 20px !important;
  }
}

/* --- 8. Element Plus 组件美化 --- */
.el-card {
  border: none !important;
  border-radius: 12px !important;
  background: rgba(255, 255, 255, 0.6) !important;
  backdrop-filter: blur(5px);
}

.el-button--primary {
  --el-button-bg-color: var(--app-primary);
  border-radius: 8px;
}

</style>