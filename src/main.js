import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './style.css'
import './styles/text-render.css'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'

// 导入页面组件
import QuestionBank from './views/QuestionBank.vue'
import QuestionDetail from './views/QuestionDetail.vue'
import AIChat from './views/AIChat.vue'
import ModelTraining from './views/ModelTraining.vue'
import CustomModels from './views/CustomModels.vue'
import OnlineAIModels from './views/OnlineAIModels.vue'
import APIConfig from './views/APIConfig.vue'
import MarkdownViewer from './views/MarkdownViewer.vue'
import MarkdownEditor from './views/MarkdownEditor.vue'
import MarkdownUpload from './views/MarkdownUpload.vue'

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'QuestionBank',
      component: QuestionBank
    },
    {
      path: '/question/:id',
      name: 'QuestionDetail',
      component: QuestionDetail
    },
    {
      path: '/ai-chat',
      name: 'AIChat',
      component: AIChat
    },
    {
      path: '/model-training',
      name: 'ModelTraining',
      component: ModelTraining
    },
    {
      path: '/custom-models',
      name: 'CustomModels',
      component: CustomModels
    },
    {
      path: '/online-ai-models',
      name: 'OnlineAIModels',
      component: OnlineAIModels
    },
    {
      path: '/api-config',
      name: 'APIConfig',
      component: APIConfig
    },
    {
      path: '/markdown-viewer',
      name: 'MarkdownViewer',
      component: MarkdownViewer
    },
    {
      path: '/markdown-editor',
      name: 'MarkdownEditor',
      component: MarkdownEditor
    },
    {
      path: '/markdown-upload',
      name: 'MarkdownUpload',
      component: MarkdownUpload
    }
  ]
})

const app = createApp(App)

// 创建事件总线
const eventBus = {
  _events: {},
  emit(event, ...args) {
    if (this._events[event]) {
      this._events[event].forEach(callback => callback(...args))
    }
  },
  on(event, callback) {
    if (!this._events[event]) {
      this._events[event] = []
    }
    this._events[event].push(callback)
  },
  off(event, callback) {
    if (this._events[event]) {
      this._events[event] = this._events[event].filter(cb => cb !== callback)
    }
  }
}

// 全局提供事件总线
app.provide('eventBus', eventBus)

app.use(ElementPlus)
app.use(router)
app.mount('#app')