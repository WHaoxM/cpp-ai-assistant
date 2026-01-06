<template>
  <div class="custom-models-container">
    <h1>自定义模型</h1>
    
    <el-card shadow="hover" class="models-card">
      <template #header>
        <div class="card-header">
          <h2>自定义AI模型</h2>
          <p>配置和管理自定义AI模型，用于特定的AI服务调用</p>
        </div>
      </template>
      
      <!-- 添加模型按钮和提供商选择 -->
      <div class="add-model-section">
        <el-button type="primary" @click="openAddModelDialog">
          <el-icon name="Plus" /> 添加自定义模型
        </el-button>
        <el-select v-model="selectedProvider" placeholder="选择提供商" style="width: 200px; margin-left: 10px;">
          <el-option label="使用全局配置" value="global" />
          <el-option label="OpenAI" value="openai" />
          <el-option label="Anthropic" value="anthropic" />
          <el-option label="Qwen/DashScope" value="qwen" />
          <el-option-group label="自定义模型">
            <el-option 
              v-for="model in customModels" 
              :key="model.id" 
              :label="`自定义: ${model.name} (${model.provider})`" 
              :value="model.id" 
            />
          </el-option-group>
        </el-select>
        <el-button type="success" @click="getDeployableModelsList" style="margin-left: 10px;">
          <el-icon name="Download" /> 获取可部署模型
        </el-button>
      </div>
      
      <!-- 模型列表 -->
      <div class="models-list">
        <div v-if="customModels.length === 0" class="empty-state">
          <el-empty description="暂无自定义模型" />
        </div>
        
        <el-table 
          :data="customModels" 
          style="width: 100%"
          @row-dblclick="openEditModelDialog"
        >
          <el-table-column prop="name" label="模型名称" width="200" />
          <el-table-column prop="model" label="模型ID" width="180" />
          <el-table-column label="提供商" width="120">
            <template #default="scope">
              <el-tag :type="getProviderType(scope.row.provider)">
                {{ scope.row.provider }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="描述" show-overflow-tooltip />
          <el-table-column label="操作" width="200">
            <template #default="scope">
              <el-button 
                size="small" 
                @click="openEditModelDialog(scope.row)"
              >
                编辑
              </el-button>
              <el-button 
                size="small" 
                type="danger" 
                @click="deleteModel(scope.row.id)"
              >
                删除
              </el-button>
              <el-button 
                size="small" 
                @click="testModel(scope.row)"
              >
                测试
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
    
    <!-- 添加/编辑模型对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
    >
      <el-form :model="formData" label-position="top" size="default">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="模型名称" required>
              <el-input v-model="formData.name" placeholder="请输入模型名称" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="模型ID" required>
              <el-input v-model="formData.model" placeholder="请输入模型ID（如：gpt-4, qwen-plus）" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="提供商" required>
              <el-input 
                v-model="formData.provider" 
                placeholder="输入提供商名称，如：openai, anthropic, qwen, iflow"
              />
              <div style="margin-top: 5px; font-size: 12px; color: #999;">
                常见提供商：openai, anthropic, qwen, iflow
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="API密钥">
              <el-input v-model="formData.apiKey" type="password" placeholder="sk-..." show-password />
              <div style="margin-top: 5px; font-size: 12px; color: #999;">
                留空则使用全局API密钥
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="API地址">
              <el-input v-model="formData.baseURL" placeholder="https://api.example.com/v1" />
              <div style="margin-top: 5px; font-size: 12px; color: #999;">
                留空则使用提供商默认地址
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="模型描述">
              <el-input
                v-model="formData.description"
                type="textarea"
                :rows="3"
                placeholder="请输入模型描述（可选）"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="消息角色">
              <el-input 
                v-model="formData.role" 
                placeholder="如：assistant, user"
              />
              <div style="margin-top: 5px; font-size: 12px; color: #999;">
                消息角色，默认为 assistant
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="消息内容">
              <el-input 
                v-model="formData.messageContent" 
                placeholder="默认消息内容"
              />
              <div style="margin-top: 5px; font-size: 12px; color: #999;">
                消息内容模板，留空则使用上下文
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="上下文内容" required>
              <el-input
                v-model="formData.context"
                type="textarea"
                :rows="5"
                placeholder="请输入模型的系统提示语，用于指导模型的回答风格和能力范围"
              />
              <div style="margin-top: 5px; font-size: 12px; color: #999;">
                上下文内容是模型的系统提示语，会影响模型的回答风格和能力范围
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveModel" :loading="isSaving">保存</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 模型测试对话框 -->
    <el-dialog
      v-model="testDialogVisible"
      title="测试模型"
      width="600px"
    >
      <el-form :model="testForm" label-position="top">
        <el-form-item label="测试消息">
          <el-input
            v-model="testForm.message"
            type="textarea"
            :rows="4"
            placeholder="输入要测试的消息"
          />
        </el-form-item>
        <el-form-item label="测试结果">
          <el-input
            v-model="testForm.result"
            type="textarea"
            :rows="6"
            placeholder="测试结果将显示在这里"
            readonly
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="testModelSubmit" :loading="isTestingModel">发送测试</el-button>
      </template>
    </el-dialog>
    
    <!-- 可部署模型列表对话框 -->
    <el-dialog
      v-model="deployableModelsDialogVisible"
      title="可部署模型列表"
      width="800px"
      :before-close="() => { deployableModels.value = [] }"
    >
      <el-table 
        :data="deployableModels.output?.models || []" 
        style="width: 100%"
        v-loading="isLoadingDeployableModels"
      >
        <el-table-column prop="model_name" label="模型名称" width="300" />
        <el-table-column prop="base_capacity" label="基础容量" width="150" />
        <el-table-column label="模型ID" width="250">
          <template #default="scope">
            {{ scope.row.model_name }}
          </template>
        </el-table-column>
        <el-table-column label="模型类型" width="150">
          <template #default="scope">
            <el-tag type="info">自定义模型</el-tag>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="deployableModelsDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
    
    <!-- 配置说明 -->
    <el-card shadow="hover" class="info-card">
      <template #header>
        <h3>配置说明</h3>
      </template>
      <div class="info-content">
        <h4>添加自定义模型</h4>
        <ul>
          <li>模型名称：自定义模型的显示名称，用于在界面中选择</li>
          <li>模型ID：模型的唯一标识符，由AI服务提供商分配</li>
          <li>提供商：选择模型所属的AI服务提供商</li>
          <li>API密钥：模型的专用API密钥，留空则使用全局配置的API密钥</li>
          <li>API地址：模型的API访问地址，留空则使用提供商默认地址</li>
        </ul>
        
        <h4>使用自定义模型</h4>
        <ul>
          <li>在聊天、题目分析等功能中，可以选择自定义模型</li>
          <li>自定义模型将优先使用自身配置的API密钥和地址</li>
          <li>可以随时编辑或删除自定义模型</li>
        </ul>
      </div>
    </el-card>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { 
  getCustomModels, 
  addCustomModel, 
  updateCustomModel, 
  deleteCustomModel,
  getCustomModelById,
  callAIModel,
  getDeployableModels,
  getAPIConfig
} from '../services/aiService'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'CustomModels',
  components: {},
  setup() {
    const customModels = ref([])
    const deployableModels = ref([])
    const dialogVisible = ref(false)
    const deployableModelsDialogVisible = ref(false)
    const testDialogVisible = ref(false)
    const isSaving = ref(false)
    const isTestingModel = ref(false)
    const isLoadingDeployableModels = ref(false)
    const editingModelId = ref(null)
    const selectedProvider = ref('global')
    
    // 表单数据
    const formData = ref({
      name: '',
      model: '',
      provider: '',
      apiKey: '',
      baseURL: '',
      description: '',
      role: 'assistant',
      messageContent: '',
      context: '你是一个专业的C++ AI助手，专注于C++知识点讲解和题目分析。请提供详细、准确的解答。'
    })
    
    // 测试表单
    const testForm = ref({
      message: '你好，请简单介绍一下自己',
      result: ''
    })
    
    // 当前测试的模型
    const currentTestModel = ref(null)
    
    // 对话框标题
    const dialogTitle = computed(() => {
      return editingModelId.value ? '编辑自定义模型' : '添加自定义模型'
    })
    
    // 加载自定义模型列表
    const loadModels = () => {
      customModels.value = getCustomModels()
    }
    
    // 打开添加模型对话框
    const openAddModelDialog = () => {
      editingModelId.value = null
      resetForm()
      dialogVisible.value = true
    }
    
    // 打开编辑模型对话框
    const openEditModelDialog = (model) => {
      editingModelId.value = model.id
      formData.value = { ...model }
      dialogVisible.value = true
    }
    
    // 重置表单
    const resetForm = () => {
      formData.value = {
        name: '',
        model: '',
        provider: '',
        apiKey: '',
        baseURL: '',
        description: '',
        role: 'assistant',
        messageContent: '',
        context: '你是一个专业的C++ AI助手，专注于C++知识点讲解和题目分析。请提供详细、准确的解答。'
      }
    }
    
    // 保存模型
    const saveModel = () => {
      // 验证表单
      if (!formData.value.name.trim() || !formData.value.model.trim()) {
        ElMessage.error('模型名称和模型ID不能为空')
        return
      }
      
      isSaving.value = true
      
      try {
        if (editingModelId.value) {
          // 更新现有模型
          updateCustomModel(editingModelId.value, formData.value)
          ElMessage.success('自定义模型更新成功')
        } else {
          // 添加新模型
          addCustomModel(formData.value)
          ElMessage.success('自定义模型添加成功')
        }
        
        dialogVisible.value = false
        loadModels()
      } catch (error) {
        ElMessage.error(`操作失败：${error.message}`)
      } finally {
        isSaving.value = false
      }
    }
    
    // 删除模型
    const deleteModel = (id) => {
      ElMessageBox.confirm('确定要删除这个自定义模型吗？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        try {
          deleteCustomModel(id)
          ElMessage.success('自定义模型删除成功')
          loadModels()
        } catch (error) {
          ElMessage.error(`删除失败：${error.message}`)
        }
      }).catch(() => {
        // 取消删除
      })
    }
    
    // 测试模型
    const testModel = (model) => {
      currentTestModel.value = model
      testForm.value = {
        message: '你好，请简单介绍一下自己',
        result: ''
      }
      testDialogVisible.value = true
    }
    
    // 提交模型测试
    const testModelSubmit = async () => {
      if (!currentTestModel.value) return
      
      isTestingModel.value = true
      try {
        // 创建一个包含模型信息的配置对象
        const modelConfig = {
          provider: currentTestModel.value.provider,
          apiKey: currentTestModel.value.apiKey,
          baseURL: currentTestModel.value.baseURL,
          model: currentTestModel.value.model
        }
        
        // 调用AI模型进行测试
        const response = await callAIModel([
          { role: 'system', content: currentTestModel.value.context },
          { role: 'user', content: testForm.value.message }
        ], modelConfig)
        
        testForm.value.result = response
      } catch (error) {
        testForm.value.result = `测试失败: ${error.message}`
      } finally {
        isTestingModel.value = false
      }
    }
    
    // 获取提供商类型标签
    const getProviderType = (provider) => {
      const typeMap = {
        'openai': 'primary',
        'anthropic': 'success',
        'qwen': 'warning',
        'iflow': 'danger'
      }
      return typeMap[provider] || 'info'
    }
    
    // 格式化日期
    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleString()
    }
    
    // 获取可部署模型列表
    const getDeployableModelsList = async () => {
      isLoadingDeployableModels.value = true
      try {
        let requestConfig = {}
        const globalConfig = getAPIConfig()
        
        // 根据选择的提供商或自定义模型构建请求配置
        if (selectedProvider.value === 'global') {
          // 使用全局配置
          requestConfig = {
            provider: globalConfig.provider,
            apiKey: globalConfig.providers?.[globalConfig.provider]?.apiKey || '',
            baseURL: globalConfig.providers?.[globalConfig.provider]?.baseURL || ''
          }
        } else if (['openai', 'anthropic', 'qwen'].includes(selectedProvider.value)) {
          // 使用预定义提供商和对应提供商的配置
          requestConfig = {
            provider: selectedProvider.value,
            apiKey: globalConfig.providers?.[selectedProvider.value]?.apiKey || '',
            baseURL: globalConfig.providers?.[selectedProvider.value]?.baseURL || ''
          }
        } else {
          // 使用自定义模型配置
          const customModel = customModels.value.find(m => m.id === selectedProvider.value)
          if (customModel) {
            requestConfig = {
              provider: customModel.provider,
              apiKey: customModel.apiKey || globalConfig.providers?.[customModel.provider]?.apiKey || '',
              baseURL: customModel.baseURL || globalConfig.providers?.[customModel.provider]?.baseURL || ''
            }
          } else {
            throw new Error('未找到选中的自定义模型')
          }
        }
        
        // 调用获取可部署模型的函数
        const result = await getDeployableModels(requestConfig)
        
        if (result.success) {
          deployableModels.value = result.models
          deployableModelsDialogVisible.value = true
          ElMessage.success('成功获取可部署模型列表')
        } else {
          ElMessage.error(result.message)
        }
      } catch (error) {
        console.error('获取可部署模型列表失败:', error)
        ElMessage.error(`获取可部署模型列表失败: ${error.message}`)
      } finally {
        isLoadingDeployableModels.value = false
      }
    }
    
    // 组件挂载时加载模型列表
    onMounted(() => {
      loadModels()
    })
    
    return {
      customModels,
      deployableModels,
      dialogVisible,
      deployableModelsDialogVisible,
      testDialogVisible,
      isSaving,
      isTestingModel,
      isLoadingDeployableModels,
      selectedProvider,
      dialogTitle,
      formData,
      testForm,
      currentTestModel,
      openAddModelDialog,
      openEditModelDialog,
      saveModel,
      deleteModel,
      testModel,
      testModelSubmit,
      getDeployableModelsList,
      getProviderType,
      formatDate
    }
  }
}
</script>

<style scoped>
.custom-models-container {
  width: 100%;
  padding: 0;
}

.models-card {
  margin-bottom: 20px;
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  overflow: hidden;
}

.card-header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
}

.card-header h2 {
  margin: 0 0 5px 0;
  font-size: 20px;
}

.card-header p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.add-model-section {
  margin-bottom: 20px;
}

.models-list {
  margin-top: 20px;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #999;
}

.info-card {
  margin-top: 20px;
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  overflow: hidden;
}

.info-content h4 {
  margin-top: 15px;
  margin-bottom: 10px;
  font-size: 16px;
}

.info-content ul {
  margin: 0;
  padding-left: 20px;
}

.info-content li {
  margin-bottom: 8px;
  font-size: 14px;
  line-height: 1.6;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 适配iflow提供商样式 */
.el-tag.provider-iflow {
  background-color: #9c27b0;
  color: white;
}
</style>