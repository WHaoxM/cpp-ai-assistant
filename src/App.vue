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
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  color: #333;
  font-smoothing: antialiased; /* 优化字体渲染 */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f5f7fa;
  font-size: 14px;
  line-height: 1.6;
}

/* 统一标题样式 */
h1 {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
  font-smoothing: antialiased;
}

h2 {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 18px;
  font-smoothing: antialiased;
}

h3 {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 16px;
  font-smoothing: antialiased;
}

h4 {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 14px;
  font-smoothing: antialiased;
}

/* 统一正文样式 */
p {
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  margin-bottom: 12px;
}

/* 统一链接样式 */
a {
  color: #1890ff;
  text-decoration: none;
  transition: color 0.3s;
}

a:hover {
  color: #40a9ff;
  text-decoration: underline;
}

/* 统一列表样式 */
ul, ol {
  padding-left: 20px;
  margin-bottom: 12px;
}

li {
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  margin-bottom: 8px;
}

/* 应用容器 */
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed; /* 背景图固定 */
  backdrop-filter: blur(5px); /* 添加毛玻璃效果 */
}

/* 全局Element Plus组件透明度设置 */
:root {
  --el-card-background-color: rgba(255, 255, 255, 0.7);
  --el-table-background-color: rgba(255, 255, 255, 0.7);
}

/* 卡片组件透明度 */
.el-card, .is-hover-shadow, .filter-card {
  background-color: rgba(255, 255, 255, 0.7) !important;
  backdrop-filter: blur(5px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1) !important;
  border-color: rgba(232, 232, 232, 0.7) !important;
}

/* 表格组件透明度 */
.el-table--fit, .el-table, .el-table--layout-fixed, .is-scrolling-none {
  background-color: rgba(255, 255, 255, 0.7) !important;
  backdrop-filter: blur(5px);
  border-color: rgba(232, 232, 232, 0.7) !important;
}

/* 表格行透明度 */
.el-table__body-wrapper {
  background-color: rgba(255, 255, 255, 0.7) !important;
}

/* 表格表头透明度 */
.el-table__header-wrapper {
  background-color: rgba(240, 242, 245, 0.8) !important;
}

/* 表格单元格透明度 */
.el-table__cell {
  background-color: transparent !important;
}

/* 表单元素透明度 */
.el-input__wrapper, .el-select__wrapper, .el-textarea__wrapper {
  background-color: rgba(255, 255, 255, 0.7) !important;
  backdrop-filter: blur(5px);
}

/* 按钮透明度 */
.el-button {
  background-color: rgba(24, 144, 255, 0.9) !important;
  backdrop-filter: blur(5px);
}

/* 下拉菜单透明度 */
.el-dropdown-menu {
  background-color: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(5px);
}

/* 消息提示透明度 */
.el-message-box {
  background-color: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(5px);
}

/* 头部样式 */
.app-header {
  background-color: rgba(255, 255, 255, 0.9); /* 90% 透明度，提高可读性 */
  backdrop-filter: blur(5px); /* 添加毛玻璃效果 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 100;
  border-bottom: 1px solid rgba(232, 232, 232, 0.7);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 60px;
}

.logo h1 {
  font-size: 20px;
  font-weight: bold;
  color: #1890ff;
  margin: 0;
  font-smoothing: antialiased; /* 优化字体渲染 */
}

.top-menu {
  border-bottom: none;
  height: 60px;
  line-height: 60px;
  background-color: transparent; /* 透明背景 */
}

/* 主内容区域 */
.app-main {
  flex: 1;
  padding: 20px 0;
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
  background-color: transparent; /* 透明背景 */
}

/* 内容包装器，设置70%透明度 */
.content-wrapper {
  background-color: rgba(255, 255, 255, 0.9); /* 70% 透明度 */
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(5px); /* 添加毛玻璃效果 */
  min-height: calc(70vh - 40px);
}

/* 底部样式 */
.app-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  width: 100%;
  min-height: 200px;
  background-color: rgba(255, 255, 255, 1.0);
  backdrop-filter: blur(5px);
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  padding: 30px 0 20px 0;
  text-align: center;
  color: #666;
  font-size: 14px;
  margin-top: auto;
  border-top: 1px solid rgba(255, 255, 255, 1);
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.footer-top {
  display: flex;
  justify-content: space-between;
  padding-bottom: 20px;
  border-bottom: 1px solid #e4e7ed;
  margin-bottom: 20px;
}

.footer-section {
  flex: 1;
  text-align: center;
  padding: 40px 20px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.footer-section h4 {
  color: #333;
  margin-bottom: 0px;
  margin-top: 70px;
  font-size: 16px;
  font-weight: 600;
}

.footer-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-section ul li {
  padding: 4px 0;
  line-height: 1.6;
}

.footer-section a {
  color: #666;
  text-decoration: none;
  transition: color 0.3s;
}

.footer-section a:hover {
  color: #1890ff;
  text-decoration: underline;
}

.footer-bottom {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  padding-top: 10px;
  border-top: 1px solid #e4e7ed;
  gap: 20px;
}

.footer-bottom p {
  margin: 5px 0;
  text-align: center;
}

.footer-links {
  display: flex;
  align-items: center;
  gap: 15px;
}

.footer-links .divider {
  color: #ccc;
}

.footer-links a {
  color: #666;
  text-decoration: none;
  font-size: 13px;
  transition: color 0.3s;
}

.footer-links a:hover {
  color: #1890ff;
  text-decoration: underline;
}

@media (max-width: 768px) {
  .app-footer {
    min-height: auto;
    padding: 20px 0;
  }
  
  .footer-top {
    flex-direction: column;
    gap: 20px;
    padding-bottom: 15px;
    margin-bottom: 15px;
  }
  
  .footer-section {
    margin-bottom: 0;
    width: 100%;
    padding: 15px 20px 10px;
  }
  
  .footer-section h4 {
    margin-top: 0;
    margin-bottom: 12px;
    font-size: 15px;
  }
  
  .footer-section ul li {
    padding: 3px 0;
    font-size: 13px;
  }
  
  .footer-bottom {
    flex-direction: column;
    gap: 15px;
    text-align: center;
    padding-top: 15px;
  }
  
  .footer-bottom p {
    text-align: center;
    font-size: 12px;
    margin: 0;
  }
  
  .footer-links {
    justify-content: center;
    gap: 10px;
  }
  
  .footer-links a {
    font-size: 12px;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .footer-section {
    padding: 25px 15px 10px;
  }
  
  .footer-section h4 {
    margin-bottom: 12px;
    margin-top: 5px;
    font-size: 15px;
  }
}
</style>