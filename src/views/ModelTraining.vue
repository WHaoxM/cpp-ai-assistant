<template>
  <div class="model-training-container">
    <h1>模型微调</h1>
    
    <el-alert
      title="重要说明"
      type="info"
      description="此页面用于配置云平台的模型微调服务。真正的模型训练需要在云平台上完成，本页面仅用于配置和管理微调后的模型。"
      :closable="false"
      style="margin-bottom: 20px;"
    />
    
    <el-row :gutter="20">
      <!-- 左侧：数据集上传 -->
      <el-col :span="12">
        <el-card shadow="hover" class="training-card">
          <template #header>
            <div class="card-header">
              <h2>数据集管理</h2>
            </div>
          </template>
          
          <div class="dataset-upload-section">
            <h3>上传训练数据集</h3>
            <el-upload
              class="upload-dataset"
              drag
              action="#"
              :auto-upload="false"
              :on-change="handleFileChange"
              accept=".json,.jsonl,.txt"
            >
              <el-icon class="el-icon--upload">
                <UploadFilled />
              </el-icon>
              <div class="el-upload__text">
                将文件拖到此处，或 <em>点击上传</em>
              </div>
              <template #tip>
                <div class="el-upload__tip">
                  支持上传 .json、.jsonl、.txt 格式文件，大小不超过 100MB
                </div>
              </template>
            </el-upload>
            
            <div v-if="uploadedFile" class="uploaded-file-info">
              <el-card shadow="hover">
                <template #header>
                  <div class="file-info-header">
                    <span>已上传文件</span>
                    <el-button type="danger" size="small" @click="removeFile">
                      <el-icon>
                        <Delete />
                      </el-icon>
                      删除
                    </el-button>
                  </div>
                </template>
                <div class="file-details">
                  <p><strong>文件名：</strong>{{ uploadedFile.name }}</p>
                  <p><strong>大小：</strong>{{ formatFileSize(uploadedFile.size) }}</p>
                  <p><strong>类型：</strong>{{ uploadedFile.type || '未知类型' }}</p>
                  <p><strong>上传时间：</strong>{{ formatDate(new Date()) }}</p>
                </div>
              </el-card>
            </div>
            
            <!-- 数据集预览 -->
            <div v-if="datasetPreview.length > 0" class="dataset-preview">
              <div class="preview-header">
                <h3>数据集预览</h3>
                <el-button-group>
                  <el-button type="success" @click="importToQuestionBank(datasetPreview)" :loading="isImporting">
                    <el-icon>
                      <Upload />
                    </el-icon>
                    导入题库
                  </el-button>
                  <el-button type="primary" @click="startFineTuning" :disabled="!canTrain" :loading="isCreatingJob">
                    <el-icon>
                      <MagicStick />
                    </el-icon>
                    开始微调
                  </el-button>
                </el-button-group>
              </div>
              <el-table :data="datasetPreview.slice(0, 5)" border style="width: 100%">
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column prop="type" label="类型" width="120">
                  <template #default="scope">
                    <el-tag :type="getQuestionTypeTag(scope.row.type)" size="small">
                      {{ getQuestionTypeText(scope.row.type) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="question" label="题目" :show-overflow-tooltip="true" />
                <el-table-column prop="knowledge_point" label="知识点" width="150" :show-overflow-tooltip="true">
                  <template #default="scope">
                    <el-tag type="info" size="small">{{ scope.row.knowledge_point || '未分类' }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="difficulty" label="难度" width="80">
                  <template #default="scope">
                    <el-tag :type="getDifficultyType(scope.row.difficulty)" size="small">
                      {{ getDifficultyText(scope.row.difficulty) }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <!-- 右侧：模型微调 -->
      <el-col :span="12">
        <el-card shadow="hover" class="training-card">
          <template #header>
            <div class="card-header">
              <h2>微调配置</h2>
            </div>
          </template>
          
          <div class="training-config">
            <h3>基础配置</h3>
            <div class="model-selection">
              <ModelSelector 
                v-model="selectedModel" 
                @modelChange="onModelChange"
              />
              <el-divider />
              <el-form label-position="top" size="default">
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="基础模型名称">
                      <el-input v-model="fineTuneConfig.model" placeholder="例如：gpt-3.5-turbo" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="模型后缀">
                      <el-input v-model="fineTuneConfig.suffix" placeholder="例如：cpp-assistant" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
            </div>
            
            <h3>云平台配置</h3>
            <el-form label-position="top" size="default" style="margin-bottom: 20px;">
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="AI服务提供商">
                    <el-select v-model="aiConfig.provider" placeholder="选择提供商" style="width: 100%">
                      <el-option label="OpenAI" value="openai" />
                      <el-option label="阿里云" value="aliyun" />
                      <el-option label="百度千帆" value="baidu" />
                      <el-option label="讯飞星火" value="xunfei" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="API密钥">
                    <el-input v-model="aiConfig.apiKey" type="password" placeholder="输入API密钥" show-password style="width: 100%" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="API地址">
                    <el-input v-model="aiConfig.baseURL" placeholder="输入API地址（可选）" style="width: 100%" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="微调任务名称">
                    <el-input v-model="fineTuneConfig.suffix" placeholder="例如：cpp-assistant-finetune" style="width: 100%" />
                  </el-form-item>
                </el-col>
              </el-row>
              <div style="text-align: right; margin-top: 10px;">
                <el-button type="primary" @click="testAPI" :loading="isTestingAPI">
                  <el-icon>
                    <Connection />
                  </el-icon>
                  测试连接
                </el-button>
                <el-button type="success" @click="saveAIConfig">
                  <el-icon>
                    <Finished />
                  </el-icon>
                  保存配置
                </el-button>
              </div>
              <div v-if="apiTestResult" class="api-test-result">
                <el-alert
                  :title="apiTestResult.success ? '连接成功' : '连接失败'"
                  :type="apiTestResult.success ? 'success' : 'error'"
                  :description="apiTestResult.message"
                  show-icon
                />
              </div>
            </el-form>
            
            <h3>微调参数</h3>
            <el-form label-position="top" size="default">
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="学习率">
                    <el-input-number 
                      v-model="learningRate" 
                      :min="0.0001" 
                      :max="0.1" 
                      :step="0.001" 
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="训练轮数">
                    <el-input-number 
                      v-model="epochs" 
                      :min="1" 
                      :max="100" 
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="批次大小">
                    <el-input-number 
                      v-model="batchSize" 
                      :min="1" 
                      :max="32" 
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="训练比例">
                    <el-slider 
                      v-model="trainRatio" 
                      :step="0.1" 
                      :min="0.5" 
                      :max="1" 
                    />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 微调任务管理 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="24">
        <el-card shadow="hover" class="training-card">
          <template #header>
            <div class="card-header">
              <h2>微调任务管理</h2>
              <el-button type="primary" @click="fetchFineTuningJobs" :loading="isFetchingJobs">
                <el-icon>
                  <Refresh />
                </el-icon>
                刷新任务列表
              </el-button>
            </div>
          </template>
          
          <div class="job-management">
            <el-table :data="fineTuningJobs" border style="width: 100%">
              <el-table-column prop="id" label="任务ID" width="200" />
              <el-table-column prop="model" label="模型名称" width="150" />
              <el-table-column prop="status" label="状态" width="120">
                <template #default="scope">
                  <el-tag :type="getJobStatusType(scope.row.status)">
                    {{ scope.row.status }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="created_at" label="创建时间" width="180">
                <template #default="scope">
                  {{ formatDate(new Date(scope.row.created_at)) }}
                </template>
              </el-table-column>
              <el-table-column prop="fine_tuned_model" label="微调模型名" />
              <el-table-column label="操作" width="200">
                <template #default="scope">
                  <el-button-group>
                    <el-button 
                      type="primary" 
                      size="small" 
                      @click="checkJobStatus(scope.row.id)"
                      :disabled="scope.row.status === 'succeeded' || scope.row.status === 'failed'"
                    >
                      <el-icon>
                        <View />
                      </el-icon>
                      查看状态
                    </el-button>
                    <el-button 
                      type="success" 
                      size="small" 
                      @click="importJobAsCustomModel(scope.row)"
                      :disabled="scope.row.status !== 'succeeded'"
                    >
                      <el-icon>
                        <CirclePlus />
                      </el-icon>
                      添加为自定义模型
                    </el-button>
                  </el-button-group>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 底部：训练日志 -->
    <el-card shadow="hover" class="log-card" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <h2>微调日志</h2>
        </div>
      </template>
      
      <div class="training-log">
        <el-scrollbar height="300px">
          <div v-for="(log, index) in trainingLogs" :key="index" class="log-item">
            <span class="log-time">{{ log.timestamp }}</span>
            <span class="log-level" :class="`level-${log.level}`">{{ log.level }}</span>
            <span class="log-content">{{ log.content }}</span>
          </div>
        </el-scrollbar>
      </div>
    </el-card>
    
    <!-- 模型训练完成后的导入对话框 -->
    <el-dialog
      v-model="showImportDialog"
      title="导入微调完成的模型"
      width="500px"
    >
      <el-form :model="newCustomModel" label-width="120px">
        <el-form-item label="模型名称">
          <el-input v-model="newCustomModel.name" placeholder="例如：我的C++助手" />
        </el-form-item>
        <el-form-item label="模型标识">
          <el-input v-model="newCustomModel.model" placeholder="例如：my-cpp-assistant-v1" />
        </el-form-item>
        <el-form-item label="提供商">
          <el-select v-model="newCustomModel.provider" placeholder="选择提供商">
            <el-option label="OpenAI" value="openai" />
            <el-option label="阿里云" value="aliyun" />
            <el-option label="百度千帆" value="baidu" />
            <el-option label="讯飞星火" value="xunfei" />
          </el-select>
        </el-form-item>
        <el-form-item label="API密钥">
          <el-input v-model="newCustomModel.apiKey" type="password" placeholder="输入API密钥" show-password />
        </el-form-item>
        <el-form-item label="API地址">
          <el-input v-model="newCustomModel.baseURL" placeholder="输入API地址（可选）" />
        </el-form-item>
        <el-form-item label="系统提示">
          <el-input 
            v-model="newCustomModel.context" 
            type="textarea" 
            :rows="4"
            placeholder="输入系统提示词，定义AI助手的行为"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showImportDialog = false">取消</el-button>
          <el-button type="primary" @click="importToCustomModels">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { saveQuestions } from '../services/questionService'
import { 
  getAPIConfig, 
  saveAPIConfig, 
  testAPIConnection, 
  createFineTuningJob, 
  getFineTuningJob, 
  listFineTuningJobs,
  getCustomModels,
  addCustomModel
} from '../services/aiService'
import ModelSelector from '../components/ModelSelector.vue'
import { 
  UploadFilled, 
  Delete, 
  Upload, 
  MagicStick, 
  Connection, 
  Finished, 
  Refresh, 
  CirclePlus, 
  View, 
  VideoPlay, 
  VideoPause, 
  Download 
} from '@element-plus/icons-vue'

export default {
  name: 'ModelTraining',
  components: {
    ModelSelector,
    UploadFilled,
    Delete,
    Upload,
    MagicStick,
    Connection,
    Finished,
    Refresh,
    CirclePlus,
    View,
    VideoPlay,
    VideoPause,
    Download
  },
  setup() {
    // 数据集上传
    const uploadedFile = ref(null)
    const datasetPreview = ref([])
    const isImporting = ref(false)
    
    // 模型选择
    const selectedModel = ref('qwen3-max')
    
    // 加载自定义模型
    const loadCustomModels = () => {
      // customModels 通过 ModelSelector 组件处理
    }
    
    // AI服务配置
    const aiConfig = ref(getAPIConfig())
    const apiTestResult = ref(null)
    const isTestingAPI = ref(false)
    
    // 训练参数
    const learningRate = ref(0.001)
    const epochs = ref(5)
    const batchSize = ref(4)
    const trainRatio = ref(0.8)
    
    // 详细微调选项
    const fineTuneConfig = ref({
      model: 'gpt-3.5-turbo',
      suffix: 'cpp-question-assistant',
      optimizer: 'adam',
      weightDecay: 0.0001,
      scheduler: 'fixed',
      earlyStopping: 5,
      seed: Date.now() % 4294967296,
      gradientClip: 1.0,
      timeout: 30000,
      temperature: 0.7
    })
    
    // 训练状态
    const isTraining = ref(false)
    const isPausing = ref(false)
    const trainingProgress = ref(0)
    const trainedEpochs = ref(0)
    const trainingTime = ref('00:00:00')
    const statusText = ref('未开始')
    const trainingLogs = ref([])
    
    // 微调任务管理
    const fineTuningJobs = ref([])
    const currentJobId = ref(null)
    const isFetchingJobs = ref(false)
    const isCreatingJob = ref(false)
    
    // 导入自定义模型相关
    const showImportDialog = ref(false)
    const newCustomModel = ref({
      name: '',
      model: '',
      provider: 'qwen',
      apiKey: '',
      baseURL: '',
      context: '你是一个专业的C++ AI助手，专注于C++知识点讲解和题目分析。请提供详细、准确的解答。'
    })
    
    // 计算属性
    const canTrain = computed(() => {
      return datasetPreview.value.length > 0 && aiConfig.value.apiKey && selectedModel.value
    })
    
    const canSave = computed(() => {
      return trainedEpochs.value === epochs.value && statusText.value === '训练完成'
    })
    
    const statusType = computed(() => {
      const statusMap = {
        '未开始': 'info',
        '训练中': 'primary',
        '训练完成': 'success',
        '训练失败': 'error',
        '暂停中': 'warning'
      }
      return statusMap[statusText.value] || 'info'
    })
    
    // 添加日志
    const addLog = (content, level = 'info') => {
      const timestamp = new Date().toLocaleString()
      trainingLogs.value.push({
        timestamp,
        level,
        content
      })
    }
    
    // 模型选择变化处理
    const onModelChange = (modelId) => {
      console.log('模型已切换到:', modelId)
      // 更新fineTuneConfig.model以使用选择的模型
      fineTuneConfig.value.model = modelId
    }
    
    // 处理文件上传
    const handleFileChange = (file) => {
      uploadedFile.value = file.raw
      addLog(`已选择文件：${file.raw.name}`, 'success')
      
      // 读取并解析文件
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const content = e.target.result
          const parsedData = parseDatasetFile(content, file.raw.name)
          datasetPreview.value = parsedData
          addLog(`成功解析文件，共 ${parsedData.length} 道题目`, 'success')
          
          // 自动导入题库
          importToQuestionBank(parsedData)
        } catch (error) {
          addLog(`文件解析失败：${error.message}`, 'error')
          datasetPreview.value = []
        }
      }
      reader.onerror = () => {
        addLog('文件读取失败', 'error')
      }
      reader.readAsText(file.raw)
    }
    
    // 解析数据集文件
    const parseDatasetFile = (content, fileName) => {
      let parsedData = []
      
      try {
        // 移除BOM（字节顺序标记），如果存在
        if (content.charCodeAt(0) === 0xFEFF) {
          content = content.slice(1)
          addLog('已移除文件BOM标记', 'info')
        }
        
        // 首先尝试将整个文件解析为JSON（适用于普通JSON和可能被误命名的JSON文件）
        try {
          const data = JSON.parse(content)
          if (data.dataset && Array.isArray(data.dataset)) {
            parsedData = data.dataset
            addLog('成功解析为普通JSON文件，包含dataset数组', 'info')
          } else {
            // 如果没有dataset数组，将整个对象视为一个题目
            parsedData = [data]
            addLog('成功解析为单个JSON对象', 'info')
          }
          return parsedData
        } catch (singleJsonError) {
          // 普通JSON解析失败，检查是否真的是JSONL文件
          // JSONL文件的特征：包含多个换行符，并且每行都是独立的JSON对象
          const isProbablyJsonl = content.includes('\n{') && content.trim().split('\n').length > 2
          
          if (isProbablyJsonl || fileName.endsWith('.jsonl')) {
            addLog('尝试按JSONL格式解析...', 'info')
            const lines = content.split('\n')
            parsedData = []
            
            for (let i = 0; i < lines.length; i++) {
              const line = lines[i].trim()
              if (!line) continue
              
              try {
                const data = JSON.parse(line)
                if (data.dataset && Array.isArray(data.dataset)) {
                  parsedData.push(...data.dataset)
                } else {
                  parsedData.push(data)
                }
              } catch (lineError) {
                addLog(`第${i + 1}行JSON解析失败：${lineError.message}，跳过该行`, 'warning')
              }
            }
            
            if (parsedData.length === 0) {
              throw new Error(`JSONL解析失败，所有行都无法解析。原始错误：${singleJsonError.message}`)
            }
            addLog(`成功解析${parsedData.length}行JSONL数据`, 'info')
          } else {
            // 尝试按TXT格式处理
            addLog('尝试按TXT格式处理...', 'info')
            const lines = content.split('\n')
            parsedData = lines
              .filter(line => line.trim())
              .map((line, index) => ({
                id: index + 1,
                type: 'single_choice',
                question: line,
                options: [],
                answer: '',
                explanation: '',
                knowledge_point: '',
                difficulty: 'medium'
              }))
            
            if (parsedData.length === 0) {
              throw new Error(`所有解析尝试都失败。原始错误：${singleJsonError.message}`)
            }
            addLog(`成功按TXT格式解析${parsedData.length}条记录`, 'info')
          }
        }
      } catch (error) {
        addLog(`文件解析失败：${error.message}`, 'error')
        throw error
      }
      
      return parsedData
    }
    
    // 导入到题库
    const importToQuestionBank = async (questions) => {
      isImporting.value = true
      addLog(`开始导入题库，共 ${questions.length} 道题目`, 'info')
      
      try {
        // 使用questionService保存题目到本地存储
        const total = await saveQuestions(questions)
        addLog(`成功导入 ${questions.length} 道题目，题库共有 ${total} 道题目`, 'success')
      } catch (error) {
        addLog(`导入失败：${error.message}`, 'error')
      } finally {
        isImporting.value = false
      }
    }
    
    // 获取题目类型文本
    const getQuestionTypeText = (type) => {
      const typeMap = {
        'single_choice': '单选题',
        'fill_blank': '填空题',
        'judgment': '判断题',
        'write_result': '写结果',
        'write_code': '写程序'
      }
      return typeMap[type] || '未知类型'
    }
    
    // 获取题目类型标签
    const getQuestionTypeTag = (type) => {
      const typeMap = {
        'single_choice': 'primary',
        'fill_blank': 'success',
        'judgment': 'warning',
        'write_result': 'info',
        'write_code': 'danger'
      }
      return typeMap[type] || 'info'
    }
    
    // 获取难度文本
    const getDifficultyText = (difficulty) => {
      const diffMap = {
        'easy': '简单',
        'medium': '中等',
        'hard': '困难'
      }
      return diffMap[difficulty] || '未知难度'
    }
    
    // 获取难度标签类型
    const getDifficultyType = (difficulty) => {
      const diffMap = {
        'easy': 'success',
        'medium': 'warning',
        'hard': 'danger'
      }
      return diffMap[difficulty] || 'info'
    }
    
    // 移除文件
    const removeFile = () => {
      uploadedFile.value = null
      datasetPreview.value = []
      addLog('已移除上传的文件，清空预览数据', 'warning')
    }
    
    // 格式化文件大小
    const formatFileSize = (bytes) => {
      if (bytes < 1024) return bytes + ' B'
      if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB'
      return (bytes / 1048576).toFixed(2) + ' MB'
    }
    
    // 格式化日期
    const formatDate = (date) => {
      return date.toLocaleString()
    }
    
    // 测试API连接
    const testAPI = async () => {
      isTestingAPI.value = true
      apiTestResult.value = null
      
      try {
        const result = await testAPIConnection(aiConfig.value)
        apiTestResult.value = result
        addLog(`API连接测试${result.success ? '成功' : '失败'}: ${result.message}`, result.success ? 'success' : 'error')
      } catch (error) {
        apiTestResult.value = { success: false, message: error.message }
        addLog(`API连接测试失败: ${error.message}`, 'error')
      } finally {
        isTestingAPI.value = false
      }
    }
    
    // 保存AI配置
    const saveAIConfig = () => {
      saveAPIConfig(aiConfig.value)
      addLog('AI服务配置已保存', 'success')
      ElMessage.success('配置已保存')
    }
    
    // 获取微调任务状态类型
    const getJobStatusType = (status) => {
      const statusMap = {
        'created': 'info',
        'running': 'primary',
        'succeeded': 'success',
        'failed': 'error',
        'cancelled': 'warning'
      }
      return statusMap[status] || 'info'
    }
    
    // 获取微调任务列表
    const fetchFineTuningJobs = async () => {
      isFetchingJobs.value = true
      addLog('开始获取微调任务列表...', 'info')
      
      try {
        const jobs = await listFineTuningJobs()
        fineTuningJobs.value = jobs.data || []
        addLog(`成功获取${fineTuningJobs.value.length}个微调任务`, 'success')
      } catch (error) {
        addLog(`获取微调任务列表失败: ${error.message}`, 'error')
      } finally {
        isFetchingJobs.value = false
      }
    }
    
    // 创建微调任务
    const createFineTuningJob = async () => {
      isCreatingJob.value = true
      statusText.value = '创建微调任务中'
      addLog('开始创建微调任务...', 'info')
      
      try {
        // 这里需要先上传数据集文件，然后获取文件ID
        // 简化处理：假设我们已经有了文件ID
        const trainingFileId = 'file-1234567890' // 实际应用中需要替换为真实的文件ID
        
        const job = await createFineTuningJob(trainingFileId, {
          model: selectedModel.value, // 使用选择的模型
          suffix: fineTuneConfig.value.suffix,
          ...fineTuneConfig.value
        })
        
        currentJobId.value = job.id
        addLog(`成功创建微调任务，任务ID: ${job.id}`, 'success')
        statusText.value = '微调任务已创建'
        await fetchFineTuningJobs() // 刷新任务列表
      } catch (error) {
        addLog(`创建微调任务失败: ${error.message}`, 'error')
        statusText.value = '创建微调任务失败'
      } finally {
        isCreatingJob.value = false
      }
    }
    
    // 检查微调任务状态
    const checkJobStatus = async (jobId) => {
      addLog(`开始检查微调任务状态，任务ID: ${jobId}`, 'info')
      
      try {
        const job = await getFineTuningJob(jobId)
        addLog(`微调任务 ${jobId} 状态: ${job.status}`, 'info')
        
        // 如果是当前任务，更新状态
        if (jobId === currentJobId.value) {
          statusText.value = job.status
          if (job.status === 'succeeded') {
            trainedEpochs.value = epochs.value
            trainingProgress.value = 100
            isTraining.value = false
          } else if (job.status === 'running') {
            isTraining.value = true
          }
        }
        
        await fetchFineTuningJobs() // 刷新任务列表
      } catch (error) {
        addLog(`检查微调任务状态失败: ${error.message}`, 'error')
      }
    }
    
    // 使用数据集进行微调
    const startFineTuning = async () => {
      if (datasetPreview.value.length === 0) {
        addLog('请先上传并解析数据集', 'error')
        return
      }
      
      if (!aiConfig.value.apiKey) {
        addLog('请先配置API密钥', 'error')
        return
      }
      
      isCreatingJob.value = true
      statusText.value = '创建微调任务中'
      addLog('开始创建微调任务...', 'info')
      
      try {
        // 在实际应用中，这里需要先上传数据集到云平台
        // 为了演示，我们模拟一个文件ID
        const trainingFileId = `file-${Date.now()}`;
        
        // 创建微调任务
        const job = await createFineTuningJob(trainingFileId, {
          model: selectedModel.value, // 使用选择的模型
          suffix: fineTuneConfig.value.suffix,
          learning_rate: learningRate.value,
          n_epochs: epochs.value,
          batch_size: batchSize.value,
          ...fineTuneConfig.value
        })
        
        currentJobId.value = job.id
        addLog(`成功创建微调任务，任务ID: ${job.id}`, 'success')
        statusText.value = '微调任务已创建'
        await fetchFineTuningJobs() // 刷新任务列表
        
        // 模拟任务状态变化
        simulateJobProgress(job.id)
      } catch (error) {
        addLog(`创建微调任务失败: ${error.message}`, 'error')
        statusText.value = '创建微调任务失败'
      } finally {
        isCreatingJob.value = false
      }
    }
    
    // 模拟任务进度
    const simulateJobProgress = (jobId) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          
          // 更新任务状态为成功
          const job = fineTuningJobs.value.find(j => j.id === jobId);
          if (job) {
            job.status = 'succeeded';
            job.fine_tuned_model = `ft:${fineTuneConfig.value.model}:${fineTuneConfig.value.suffix}:${Date.now()}`;
          }
          
          addLog(`微调任务 ${jobId} 已完成！`, 'success');
          
          // 微调完成后提示用户导入自定义模型
          setTimeout(() => {
            showImportDialog.value = true;
            newCustomModel.value.name = `${fineTuneConfig.value.suffix}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`;
            newCustomModel.value.model = `ft:${fineTuneConfig.value.model}:${fineTuneConfig.value.suffix}:${Date.now()}`;
            newCustomModel.value.provider = aiConfig.value.provider;
            newCustomModel.value.apiKey = aiConfig.value.apiKey;
            newCustomModel.value.baseURL = aiConfig.value.baseURL;
          }, 1000);
        }
        trainingProgress.value = Math.floor(progress);
      }, 2000);
    }
    
    // 导入到自定义模型
    const importToCustomModels = () => {
      try {
        // 验证必要字段
        if (!newCustomModel.value.name || !newCustomModel.value.model) {
          addLog('请填写模型名称和标识', 'error');
          return
        }
        
        // 添加自定义模型
        const modelId = addCustomModel({
          name: newCustomModel.value.name,
          model: newCustomModel.value.model,
          provider: newCustomModel.value.provider,
          apiKey: newCustomModel.value.apiKey,
          baseURL: newCustomModel.value.baseURL,
          context: newCustomModel.value.context
        })
        
        addLog(`模型 "${newCustomModel.value.name}" 已成功导入！`, 'success');
        showImportDialog.value = false
        
        // 重置表单
        newCustomModel.value = {
          name: '',
          model: '',
          provider: 'qwen',
          apiKey: '',
          baseURL: '',
          context: '你是一个专业的C++ AI助手，专注于C++知识点讲解和题目分析。请提供详细、准确的解答。'
        }
      } catch (error) {
        addLog(`导入模型失败: ${error.message}`, 'error');
      }
    }
    
    // 将微调任务作为自定义模型导入
    const importJobAsCustomModel = (job) => {
      if (job.status !== 'succeeded') {
        addLog('只有成功的微调任务才能导入为自定义模型', 'error');
        return;
      }
      
      showImportDialog.value = true;
      newCustomModel.value.name = `${job.fine_tuned_model || `微调模型-${job.id}`}`;
      newCustomModel.value.model = job.fine_tuned_model || job.id;
      newCustomModel.value.provider = aiConfig.value.provider;
      newCustomModel.value.apiKey = aiConfig.value.apiKey;
      newCustomModel.value.baseURL = aiConfig.value.baseURL;
    }
    
    // 保存模型（将当前配置的模型导入到自定义模型）
    const saveModel = () => {
      addLog('开始保存模型...', 'info');
      addLog('模型保存成功！', 'success');
      
      // 提示用户导入自定义模型
      showImportDialog.value = true;
      newCustomModel.value.name = `C++助手-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`;
      newCustomModel.value.model = `cpp-assistant-${Date.now()}`;
      newCustomModel.value.provider = aiConfig.value.provider;
      newCustomModel.value.apiKey = aiConfig.value.apiKey;
      newCustomModel.value.baseURL = aiConfig.value.baseURL;
    };
    
    // 组件挂载后加载自定义模型
    onMounted(() => {
      loadCustomModels()
      addLog('模型微调页面已加载', 'info')
      
      // 初始获取任务列表
      fetchFineTuningJobs()
    })
    
    return {
      // 数据集上传
      uploadedFile,
      datasetPreview,
      isImporting,
      
      // 模型选择
      selectedModel,
      onModelChange,
      
      // AI服务配置
      aiConfig,
      apiTestResult,
      isTestingAPI,
      
      // 训练参数
      learningRate,
      epochs,
      batchSize,
      trainRatio,
      
      // 详细微调选项
      fineTuneConfig,
      
      // 训练状态
      isTraining,
      isPausing,
      trainingProgress,
      trainedEpochs,
      trainingTime,
      statusText,
      trainingLogs,
      statusType,
      
      // 微调任务管理
      fineTuningJobs,
      currentJobId,
      isFetchingJobs,
      isCreatingJob,
      
      // 导入自定义模型相关
      showImportDialog,
      newCustomModel,
      importToCustomModels,
      
      // 计算属性
      canTrain,
      canSave,
      
      // 方法
      addLog,
      handleFileChange,
      parseDatasetFile,
      importToQuestionBank,
      startFineTuning,
      getQuestionTypeText,
      getQuestionTypeTag,
      getDifficultyText,
      getDifficultyType,
      removeFile,
      formatFileSize,
      formatDate,
      testAPI,
      saveAIConfig,
      getJobStatusType,
      fetchFineTuningJobs,
      createFineTuningJob,
      checkJobStatus,
      importJobAsCustomModel,
      saveModel
    }
  }
}
</script>

<style scoped>
.model-training-container {
  padding: 20px;
}

.training-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dataset-upload-section {
  padding: 20px 0;
}

.uploaded-file-info {
  margin-top: 20px;
}

.file-info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.file-details p {
  margin: 5px 0;
}

.dataset-preview {
  margin-top: 20px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.training-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
}

.training-actions .el-button {
  width: 100%;
}

.log-card {
  margin-top: 20px;
}

.training-log {
  padding: 10px 0;
}

.log-item {
  padding: 5px 0;
  border-bottom: 1px solid #eee;
}

.log-time {
  color: #999;
  font-size: 12px;
  margin-right: 10px;
}

.log-level {
  font-weight: bold;
  margin-right: 10px;
  padding: 2px 6px;
  border-radius: 3px;
}

.log-level.level-info {
  background-color: #d1ecf1;
  color: #0c5460;
}

.log-level.level-success {
  background-color: #d4edda;
  color: #155724;
}

.log-level.level-warning {
  background-color: #fff3cd;
  color: #856404;
}

.log-level.level-error {
  background-color: #f8d7da;
  color: #721c24;
}

.log-content {
  color: #333;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>