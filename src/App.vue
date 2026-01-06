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
/* 1. 彻底锁定全屏，消除默认边距 */
* { margin: 0; padding: 0; box-sizing: border-box; }

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden; /* 防止双滚动条 */
}

.app-container {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
}

/* 2. 导航栏透明化，与背景融合 */
.app-header {
  background: rgba(255, 255, 255, 0.7) !important; /* 半透明 */
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  z-index: 10;
}

.header-content {
  width: 95%;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
}

.logo h1 {
  font-size: 1.2rem !important;
  color: #333;
  margin-right: 40px;
}

/* 3. 主区域：垂直居中，且支持内部滚动 */
.app-main {
  flex: 1;
  overflow-y: auto; /* 允许内容过多时滚动 */
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: flex-start; /* 从顶部开始排列，防止内容被切断 */
  padding: 40px 15px 100px 15px; /* 底部预留空间给 TabBar */
}

/* 4. 内容卡片：精致磨砂感 */
.content-wrapper {
  width: 100% !important;
  max-width: 1100px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
}

/* 5. 移动端收纳适配 */
@media (max-width: 768px) {
  .pc-only { display: none !important; }
  
  .app-main {
    padding: 10px 10px 80px 10px;
  }
  
  .content-wrapper {
    padding: 15px;
    border-radius: 12px;
  }

  /* 解决截图里“标题重复”问题：如果是移动端，隐藏卡片内可能存在的重复大标题 */
  .content-wrapper h1, 
  .content-wrapper .page-title {
    font-size: 1.1rem;
    margin-bottom: 15px;
    text-align: center;
  }
}
</style>
