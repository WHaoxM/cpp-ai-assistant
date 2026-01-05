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
/* --- 1. 基础重置：禁止全局横向溢出 --- */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  /* 关键：禁止页面整体左右晃动，确保上下滑动顺畅 */
  overflow-x: hidden; 
  -webkit-overflow-scrolling: touch; /* iOS 滚动优化 */
}

/* --- 2. 容器适配：PC丝滑，移动端固定宽度 --- */
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100vw;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  /* PC端固定背景实现丝滑感，移动端改为滚动防止Bug */
  background-attachment: fixed; 
}

@media (max-width: 768px) {
  .app-container {
    background-attachment: scroll;
  }
}

/* --- 3. 头部适配：缩小视野杀手 --- */
.app-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(15px);
  border-bottom: 1px solid rgba(255,255,255,0.3);
  height: 50px !important; /* 缩小高度 */
}

.logo h1 {
  /* 使用 clamp 确保标题在手机上不会像截图里那么巨大 */
  font-size: clamp(14px, 4vw, 18px); 
  text-align: center;
  line-height: 50px;
  color: #1890ff;
}

/* --- 4. 主区域：实现“完美拖动”的核心 --- */
.app-main {
  flex: 1;
  padding: 10px 0 80px 0;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.content-wrapper {
  flex: 1;
  margin: 0 10px;
  padding: 15px !important;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(15px);
  border-radius: 12px;
  /* 修复：即使题目少，也撑开高度，保证视觉平衡 */
  min-height: calc(100vh - 160px); 
  
  /* 关键：锁定容器宽度，内部溢出则允许局部滚动 */
  max-width: calc(100vw - 20px);
  overflow: hidden; 
  display: flex;
  flex-direction: column;
}

/* --- 5. 针对 Element Plus 表格的移动端“横向拖动”修复 --- */
@media (max-width: 768px) {
  /* 强制表格容器允许横向滚动 */
  .el-table {
    width: 100% !important;
  }

  /* 使得表格内的所有列可以完整显示并通过拖动查看 */
  .el-table__inner-wrapper {
    overflow-x: auto !important; 
  }
  
  /* 隐藏滚动条，但保留滚动功能（可选，美化界面） */
  .el-table__inner-wrapper::-webkit-scrollbar {
    display: none;
  }

  /* 修复截图中的按钮挤压问题 */
  .el-table .cell {
    white-space: nowrap !important; /* 保证文字不折行 */
    padding: 0 4px !important;
  }

  /* 调整子页面内标题大小 */
  .content-wrapper h1, .content-wrapper h2 {
    font-size: 18px !important;
    margin: 10px 0 !important;
  }
}

/* --- 6. 底部导航栏（小程序感） --- */
.mobile-tab-bar {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  height: 60px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  display: flex;
  z-index: 2000;
  padding-bottom: env(safe-area-inset-bottom);
  border-top: 1px solid rgba(0,0,0,0.05);
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 10px;
}

.tab-item.active {
  color: #1890ff;
}

/* --- 7. PC 端丝滑优化 --- */
@media (min-width: 769px) {
  .app-main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 30px 0;
  }
  .content-wrapper {
    margin: 0 20px;
    padding: 30px !important;
  }
}

</style>