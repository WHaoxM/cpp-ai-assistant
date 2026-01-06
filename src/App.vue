8<template>
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
/* 1. 全局锁定 */
* { margin: 0; padding: 0; box-sizing: border-box; }

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden; 
}

/* 2. 容器：确保 100% 占满且居中 */
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  position: fixed; /* 锁定位置，防止乱晃 */
  top: 0; left: 0;
  background-size: cover;
  background-position: center;
  overflow-y: auto; /* 允许纵向滚动 */
}

/* 3. 主区域：实现“居中卡片”感 */
.app-main {
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center; /* 关键：强制内容水平居中 */
  padding: 10px 0 80px 0;
}

.content-wrapper {
  /* 移动端分辨率固定感：占满 95% 宽度，两侧对等留白 */
  width: 95% !important; 
  max-width: 1200px;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(15px);
  border-radius: 12px;
  padding: 15px;
  overflow: hidden; /* 禁止卡片本身被撑大 */
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
}

/* 4. 表格局部滑动：解决内容显示不全 */
.el-table {
  width: 100% !important;
}
/* 强制表格在卡片内部开启横向拖动 */
.el-table__inner-wrapper {
  overflow-x: auto !important; 
}

/* 5. 移动端 UI 细节微调 */
@media (max-width: 768px) {
  .pc-only { display: none !important; }
  
  .app-header { height: 44px !important; } /* 缩小头部高度 */
  .logo h1 { font-size: 14px !important; }
  
  /* 修复截图中的按钮挤压，让文字不换行，支持向左拖动查看 */
  .el-table .cell {
    white-space: nowrap !important;
  }
}

/* 6. 底部导航栏置顶显示 */
.mobile-tab-bar {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  height: 60px;
  z-index: 9999;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  display: flex;
  border-top: 1px solid #eee;
}
</style>
