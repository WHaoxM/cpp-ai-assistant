<template>
  <div class="api-config-container">
    <h1>AI服务配置</h1>
    
    <el-card shadow="hover" class="config-card">
      <template #header>
        <div class="card-header">
          <h2>AI API 配置</h2>
        </div>
      </template>
      
      <el-form label-position="top" size="default" style="margin-bottom: 20px;">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="AI服务提供商" required>
              <el-select 
                v-model="config.provider" 
                placeholder="选择提供商" 
                style="width: 100%"
                @change="onProviderChange"
              >
                <el-option label="OpenAI" value="openai" />
                <el-option label="Anthropic" value="anthropic" />
                <el-option label="Qwen" value="qwen" />
                <!-- 自定义模型提供商选项 -->
                <el-divider v-if="customModels.length > 0" />
                <el-option
                  v-for="model in customModels"
                  :key="model.id"
                  :label="`自定义: ${model.name} (${model.provider})`"
                  :value="model.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="默认模型">
              <el-select 
                v-model="config.model" 
                placeholder="选择或输入模型" 
                style="width: 100%" 
                filterable 
                allow-create
                @change="onModelChange"
              >
                <!-- 默认模型选项 -->
                <el-option label="gpt-4" value="gpt-4" />
                <el-option label="gpt-3.5-turbo" value="gpt-3.5-turbo" />
                <el-option label="claude-3-opus-20240229" value="claude-3-opus-20240229" />
                <el-option label="claude-3-sonnet-20240229" value="claude-3-sonnet-20240229" />
                <el-option label="qwen-plus" value="qwen-plus" />
                <el-option label="qwen-max" value="qwen-max" />
                <!-- 自定义模型选项 -->
                <el-divider v-if="customModels.length > 0" />
                <el-option
                  v-for="model in customModels"
                  :key="model.id"
                  :label="`自定义: ${model.name} (${model.model})`"
                  :value="model.id"
                />
              </el-select>
              <div style="margin-top: 5px; font-size: 12px; color: #999;">
                可以选择内置模型或自定义模型，也可以直接输入模型ID
              </div>
            </el-form-item>
          </el-col>
        </el-row>
        
        <!-- 默认对接商配置 -->
        <el-card shadow="hover" style="margin-bottom: 20px; background-color: #f0f9ff;">
          <template #header>
            <div class="card-header">
              <h3>默认对接商配置</h3>
              <span class="tip">为当前选择的默认对接商设置API密钥和地址</span>
            </div>
          </template>
          
          <div v-if="isValidProvider(config.provider)" class="default-provider-config">
            <div class="provider-name" :class="`provider-${getDefaultProvider()}`">
              当前对接商：{{ getDefaultProviderName() }}
            </div>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="API密钥" required>
                  <el-input 
                    v-model="defaultProviderConfig.apiKey" 
                    type="password" 
                    placeholder="sk-..." 
                    show-password 
                    style="width: 100%" 
                    @change="onDefaultProviderConfigChange"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="API地址">
                  <el-input 
                    v-model="defaultProviderConfig.baseURL" 
                    :placeholder="getDefaultBaseURLPlaceholder()" 
                    style="width: 100%" 
                    @change="onDefaultProviderConfigChange"
                  />
                  <div style="margin-top: 5px; font-size: 12px; color: #999;">
                    留空使用默认地址
                  </div>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
          <div v-else class="no-provider-selected">
            <el-alert
              title="请先选择一个AI服务提供商"
              type="info"
              show-icon
              style="margin: 0;"
            />
          </div>
        </el-card>
        
        <!-- 提供商配置 -->
        <el-card shadow="hover" style="margin-bottom: 20px;">
          <template #header>
            <div class="card-header">
              <h3>提供商配置</h3>
              <span class="tip">为每个提供商单独配置API密钥和地址</span>
            </div>
          </template>
          
          <!-- OpenAI配置 -->
          <div class="provider-config-section">
            <h4>OpenAI</h4>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="API密钥">
                  <el-input 
                    v-model="config.providers.openai.apiKey" 
                    type="password" 
                    placeholder="sk-..." 
                    show-password 
                    style="width: 100%" 
                    @change="onConfigChange"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="API地址">
                  <el-input 
                    v-model="config.providers.openai.baseURL" 
                    placeholder="https://api.openai.com/v1" 
                    style="width: 100%" 
                    @change="onConfigChange"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </div>
          
          <el-divider />
          
          <!-- Anthropic配置 -->
          <div class="provider-config-section">
            <h4>Anthropic</h4>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="API密钥">
                  <el-input 
                    v-model="config.providers.anthropic.apiKey" 
                    type="password" 
                    placeholder="sk-..." 
                    show-password 
                    style="width: 100%" 
                    @change="onConfigChange"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="API地址">
                  <el-input 
                    v-model="config.providers.anthropic.baseURL" 
                    placeholder="https://api.anthropic.com/v1" 
                    style="width: 100%" 
                    @change="onConfigChange"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </div>
          
          <el-divider />
          
          <!-- Qwen配置 -->
          <div class="provider-config-section">
            <h4>Qwen</h4>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="API密钥">
                  <el-input 
                    v-model="config.providers.qwen.apiKey" 
                    type="password" 
                    placeholder="sk-..." 
                    show-password 
                    style="width: 100%" 
                    @change="onConfigChange"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="API地址">
                  <el-input 
                    v-model="config.providers.qwen.baseURL" 
                    placeholder="https://dashscope.aliyuncs.com/compatible-mode/v1" 
                    style="width: 100%" 
                    @change="onConfigChange"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </el-card>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="默认温度">
              <el-slider v-model="config.temperature" :min="0" :max="2" :step="0.1" @change="onConfigChange"/>
              <div style="text-align: center; margin-top: 10px;">{{ config.temperature }}</div>
              <div style="margin-top: 5px; font-size: 12px; color: #999;">
                控制输出的随机性，值越大越随机
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="默认最大令牌数">
              <el-input-number 
                v-model="config.maxTokens" 
                :min="100" 
                :max="4096" 
                :step="100" 
                style="width: 100%" 
                @change="onConfigChange"
              />
              <div style="margin-top: 5px; font-size: 12px; color: #999;">
                控制输出的最大长度
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      
      <!-- 测试连接和导入模型 -->
      <div class="test-section">
        <el-button type="primary" @click="testConnection" :loading="isTesting">
          <el-icon name="Connection" /> 测试连接
        </el-button>
        <el-button type="warning" @click="importModels" :loading="isImportingModels" :disabled="!config.apiKey">
          <el-icon name="Download" /> 导入模型
        </el-button>
        <el-alert
          v-if="testResult"
          :title="testResult.success ? '连接成功' : '连接失败'"
          :message="testResult.message"
          :type="testResult.success ? 'success' : 'error'"
          show-icon
          style="margin-top: 15px;"
        />
        <el-alert
          v-if="importResult"
          :title="importResult.success ? '导入成功' : '导入失败'"
          :message="importResult.message"
          :type="importResult.success ? 'success' : 'error'"
          show-icon
          style="margin-top: 15px;"
        />
      </div>
      
      <!-- 自定义模型列表 -->
      <div class="custom-models-section">
        <h3>自定义模型列表</h3>
        <div class="model-list">
          <el-card 
            v-for="model in customModels" 
            :key="model.id" 
            shadow="hover" 
            class="model-card"
          >
            <div class="model-info">
              <span class="model-name">{{ model.name }}</span>
              <span class="model-provider" :class="`provider-${model.provider}`">{{ model.provider }}</span>
            </div>
            <div class="model-details">
              <p><strong>模型:</strong> {{ model.model }}</p>
              <p><strong>描述:</strong> {{ model.description || '无描述' }}</p>
            </div>
            <div class="model-actions">
              <el-button size="small" @click="editCustomModel(model)">编辑</el-button>
              <el-button size="small" type="danger" @click="deleteCustomModel(model.id)">删除</el-button>
            </div>
          </el-card>
          
          <div v-if="customModels.length === 0" class="empty-models">
            <p>暂无自定义模型，可在"自定义模型"页面添加</p>
          </div>
        </div>
      </div>
      
      <!-- 测试连接 -->
      <div class="test-section">
        <el-button type="primary" @click="testConnection" :loading="isTesting">
          <el-icon name="Connection" /> 测试连接
        </el-button>
        <el-alert
          v-if="testResult"
          :title="testResult.success ? '连接成功' : '连接失败'"
          :message="testResult.message"
          :type="testResult.success ? 'success' : 'error'"
          show-icon
          style="margin-top: 15px;"
        />
      </div>
      
      <!-- 保存配置 -->
      <div class="save-section">
        <el-button type="success" size="large" @click="saveConfig" :loading="isSaving">
          <el-icon name="Save" /> 保存配置
        </el-button>
        <el-button type="danger" @click="resetConfig">
          <el-icon name="RefreshLeft" /> 重置默认
        </el-button>
      </div>
      
      <!-- 导入的模型列表 -->
      <div v-if="importedModels.length > 0" class="imported-models">
        <el-card shadow="hover">
          <template #header>
            <h3>已导入模型 ({{ importedModels.length }})</h3>
          </template>
          <el-scrollbar height="200px">
            <div class="model-list">
              <el-tag
                v-for="model in importedModels"
                :key="model.id"
                :type="getProviderType(model.provider)"
                class="model-tag"
              >
                {{ model.name }}
              </el-tag>
            </div>
          </el-scrollbar>
        </el-card>
      </div>
      
      <!-- 配置说明 -->
      <el-card shadow="hover" class="info-card">
        <template #header>
          <h3>配置说明</h3>
        </template>
        <div class="info-content">
          <h4>OpenAI 配置</h4>
          <ul>
            <li>API密钥：从 <a href="https://platform.openai.com/api-keys" target="_blank">OpenAI 控制台</a> 获取</li>
            <li>默认模型：gpt-4, gpt-3.5-turbo 等</li>
            <li>默认API地址：https://api.openai.com/v1</li>
          </ul>
          
          <h4>Anthropic 配置</h4>
          <ul>
            <li>API密钥：从 <a href="https://console.anthropic.com/settings/keys" target="_blank">Anthropic 控制台</a> 获取</li>
            <li>默认模型：claude-3-opus-20240229, claude-3-sonnet-20240229 等</li>
            <li>默认API地址：https://api.anthropic.com/v1</li>
          </ul>
        </div>
      </el-card>
    </el-card>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { 
  getAPIConfig, 
  saveAPIConfig, 
  testAPIConnection, 
  getCustomModels, 
  getOpenAIModels, 
  addCustomModel,
  getCustomModelById
} from '../services/aiService'

export default {
  name: 'APIConfig',
  components: {},
  setup() {
    const config = ref({
      provider: '',
      model: '',
      temperature: 0.7,
      maxTokens: 1000,
      // 按提供商存储的配置
      providers: {
        openai: {
          apiKey: '',
          baseURL: ''
        },
        anthropic: {
          apiKey: '',
          baseURL: ''
        },
        qwen: {
          apiKey: '',
          baseURL: ''
        }
      }
    })
    
    // 默认对接商配置，用于UI绑定
    const defaultProviderConfig = ref({
      apiKey: '',
      baseURL: ''
    })
    
    const isTesting = ref(false)
    const isSaving = ref(false)
    const isImportingModels = ref(false)
    const testResult = ref(null)
    const importResult = ref(null)
    const customModels = ref([])
    const importedModels = ref([])
    
    // 加载现有配置
    const loadConfig = () => {
      const savedConfig = getAPIConfig()
      config.value = {
        ...config.value,
        ...savedConfig
      }
      // 初始化默认提供商配置
      updateDefaultProviderConfig()
      // 加载自定义模型
      customModels.value = getCustomModels()
    }
    
    // 更新默认提供商配置
    const updateDefaultProviderConfig = () => {
      const defaultProvider = getDefaultProvider()
      if (defaultProvider && config.value.providers?.[defaultProvider]) {
        defaultProviderConfig.value.apiKey = config.value.providers[defaultProvider].apiKey
        defaultProviderConfig.value.baseURL = config.value.providers[defaultProvider].baseURL
      }
    }
    
    // 判断当前提供商是否有效
    const isValidProvider = (provider) => {
      return ['openai', 'anthropic', 'qwen'].includes(provider)
    }
    
    // 获取默认提供商（处理自定义模型情况）
    const getDefaultProvider = () => {
      let provider = config.value.provider
      // 如果是自定义模型，获取其实际提供商
      const customModel = customModels.value.find(m => m.id === provider)
      if (customModel) {
        provider = customModel.provider
      }
      return provider
    }
    
    // 获取默认提供商名称
    const getDefaultProviderName = () => {
      const provider = getDefaultProvider()
      const providerNames = {
        'openai': 'OpenAI',
        'anthropic': 'Anthropic',
        'qwen': 'Qwen'
      }
      return providerNames[provider] || provider
    }
    
    // 获取默认baseURL占位符
    const getDefaultBaseURLPlaceholder = () => {
      const provider = getDefaultProvider()
      const placeholders = {
        'openai': 'https://api.openai.com/v1',
        'anthropic': 'https://api.anthropic.com/v1',
        'qwen': 'https://dashscope.aliyuncs.com/compatible-mode/v1'
      }
      return placeholders[provider] || 'https://api.example.com/v1'
    }
    
    // 当默认提供商配置变化时
    const onDefaultProviderConfigChange = () => {
      const defaultProvider = getDefaultProvider()
      if (defaultProvider) {
        // 更新对应提供商的配置
        config.value.providers = config.value.providers || {}
        config.value.providers[defaultProvider] = {
          apiKey: defaultProviderConfig.value.apiKey,
          baseURL: defaultProviderConfig.value.baseURL
        }
        // 保存配置
        saveAPIConfig(config.value)
      }
    }
    
    // 当提供商变化时，更新默认提供商配置
    const updateDefaultProviderConfigOnChange = () => {
      updateDefaultProviderConfig()
    }
    
    // 更新配置为自定义模型的配置
    const updateConfigWithCustomModel = (customModel) => {
      if (customModel) {
        config.value.provider = customModel.provider
        config.value.apiKey = customModel.apiKey || config.value.apiKey
        config.value.baseURL = customModel.baseURL || config.value.baseURL
        config.value.model = customModel.id
      }
    }

    // 当提供商选择变化时
    const onProviderChange = (provider) => {
      // 保存原始提供商（可能是自定义模型ID）
      config.value.provider = provider
      
      // 检查是否是自定义模型的ID
      const customModel = customModels.value.find(m => m.id === provider)
      if (customModel) {
        // 如果是自定义模型，更新模型设置，但不覆盖提供商配置
        config.value.model = customModel.model || customModel.id
      }
      
      // 更新默认提供商配置
      updateDefaultProviderConfig()
      // 保存更新后的配置到localStorage
      saveAPIConfig(config.value)
    }
    
    // 当模型选择变化时
    const onModelChange = (model) => {
      // 保存模型设置
      config.value.model = model
      
      // 检查是否是自定义模型的ID
      const customModel = customModels.value.find(m => m.id === model)
      if (customModel) {
        // 如果是自定义模型，更新模型设置，但不覆盖提供商配置
        config.value.model = customModel.model || customModel.id
      }
      
      // 保存配置
      saveAPIConfig(config.value)
    }
    
    // 当配置变化时
    const onConfigChange = () => {
      // 保存当前配置到localStorage
      saveAPIConfig(config.value)
    }
    
    // 编辑自定义模型
    const editCustomModel = (model) => {
      // 跳转到自定义模型页面并编辑该模型
      // 这里我们只是更新配置为该模型的配置
      config.value.provider = model.provider
      config.value.apiKey = model.apiKey || config.value.apiKey
      config.value.baseURL = model.baseURL || config.value.baseURL
      config.value.model = model.model  // 使用实际模型名称而不是ID
    }
    
    // 删除自定义模型
    const deleteCustomModel = (id) => {
      if (confirm('确定要删除这个自定义模型吗？')) {
        const models = getCustomModels()
        const updatedModels = models.filter(model => model.id !== id)
        localStorage.setItem('ai_custom_models', JSON.stringify(updatedModels))
        customModels.value = updatedModels
        
        // 如果当前配置使用的是被删除的模型，重置配置
        if (config.value.model === id) {
          config.value.model = 'gpt-4'
          config.value.provider = 'openai'
        }
      }
    }
    
    // 保存配置
    const saveConfig = () => {
      isSaving.value = true
      
      try {
        saveAPIConfig(config.value)
        ElMessage.success('配置保存成功')
      } catch (error) {
        ElMessage.error(`配置保存失败：${error.message}`)
      } finally {
        isSaving.value = false
      }
    }
    
    // 重置默认配置
    const resetConfig = () => {
      config.value = {
        provider: '',
        model: '',
        temperature: 0.7,
        maxTokens: 1000,
        // 按提供商存储的配置
        providers: {
          openai: {
            apiKey: '',
            baseURL: ''
          },
          anthropic: {
            apiKey: '',
            baseURL: ''
          },
          qwen: {
            apiKey: '',
            baseURL: ''
          },
          iflow: {
            apiKey: '',
            baseURL: ''
          }
        }
      }
      // 更新默认提供商配置
      updateDefaultProviderConfig()
    }
    
    // 测试连接
    const testConnection = async () => {
      isTesting.value = true
      testResult.value = null
      
      try {
        let testConfig = { ...config.value };
        
        // 从按提供商存储的配置中获取API密钥和baseURL
        let providerToUse = testConfig.provider;
        let apiKeyToUse = '';
        let baseURLToUse = '';
        
        // 如果当前配置的provider是自定义模型ID，完全使用自定义模型的配置
        const customModelByProvider = customModels.value.find(m => m.id === testConfig.provider);
        if (customModelByProvider) {
          providerToUse = customModelByProvider.provider;
          apiKeyToUse = customModelByProvider.apiKey || testConfig.providers?.[customModelByProvider.provider]?.apiKey || '';
          baseURLToUse = customModelByProvider.baseURL || testConfig.providers?.[customModelByProvider.provider]?.baseURL || '';
          testConfig.model = customModelByProvider.model;
        } 
        // 否则，从提供商配置中获取API密钥和baseURL
        else if (['openai', 'anthropic', 'qwen'].includes(providerToUse)) {
          apiKeyToUse = testConfig.providers?.[providerToUse]?.apiKey || '';
          baseURLToUse = testConfig.providers?.[providerToUse]?.baseURL || '';
        }
        
        // 如果当前model是自定义模型ID，也完全使用自定义模型的配置
        const customModelByModel = customModels.value.find(m => m.id === testConfig.model);
        if (customModelByModel) {
          providerToUse = customModelByModel.provider;
          apiKeyToUse = customModelByModel.apiKey || testConfig.providers?.[customModelByModel.provider]?.apiKey || '';
          baseURLToUse = customModelByModel.baseURL || testConfig.providers?.[customModelByModel.provider]?.baseURL || '';
          testConfig.model = customModelByModel.model;
        }
        
        // 构建最终的测试配置
        const finalTestConfig = {
          provider: providerToUse,
          apiKey: apiKeyToUse,
          baseURL: baseURLToUse,
          model: testConfig.model || 'gpt-4'
        };
        
        const result = await testAPIConnection(finalTestConfig);
        testResult.value = result;
      } catch (error) {
        testResult.value = { success: false, message: error.message };
      } finally {
        isTesting.value = false;
      }
    }
    
    // 导入模型
    const importModels = async () => {
      // 从提供商配置中获取API密钥
      const apiKeyToUse = config.value.providers?.[config.value.provider]?.apiKey || '';
      if (!apiKeyToUse) {
        ElMessage.error('请先为当前提供商输入API密钥')
        return
      }
      
      isImportingModels.value = true
      importResult.value = null
      importedModels.value = []
      
      try {
        let result;
        
        // 构建导入模型的配置
        const importConfig = {
          ...config.value,
          apiKey: apiKeyToUse,
          baseURL: config.value.providers?.[config.value.provider]?.baseURL || ''
        };
        
        // 根据提供商获取模型列表
        switch (config.value.provider) {
          case 'openai':
            result = await getOpenAIModels(importConfig)
            break;
          default:
            throw new Error(`暂不支持从 ${config.value.provider} 导入模型`)
        }
        
        if (result.success) {
          // 保存导入的模型
          const importedCount = result.models.length
          importedModels.value = result.models
          
          // 添加到自定义模型
          for (const model of result.models) {
            // 只添加聊天模型（包含gpt或chat的模型）
            if (model.id.includes('gpt') || model.id.includes('chat')) {
              addCustomModel({
                name: model.name,
                model: model.id,
                provider: model.provider,
                baseURL: config.value.providers?.[config.value.provider]?.baseURL || '',
                description: `从 ${config.value.provider} 导入的模型，创建于 ${model.created}`
              })
            }
          }
          
          importResult.value = {
            success: true,
            message: `成功导入 ${importedCount} 个模型，其中聊天模型已添加到自定义模型列表`
          }
          
          // 重新加载自定义模型
          customModels.value = getCustomModels()
          
          ElMessage.success('模型导入成功')
        } else {
          importResult.value = {
            success: false,
            message: result.message
          }
          ElMessage.error(`模型导入失败：${result.message}`)
        }
      } catch (error) {
        importResult.value = {
          success: false,
          message: error.message
        }
        ElMessage.error(`模型导入失败：${error.message}`)
      } finally {
        isImportingModels.value = false
      }
    }
    
    // 获取提供商类型标签
    const getProviderType = (provider) => {
      const typeMap = {
        'openai': 'primary',
        'anthropic': 'success',
        'qwen': 'warning'
      }
      return typeMap[provider] || 'info'
    }
    
    onMounted(() => {
      loadConfig()
    })
    
    return {
      config,
      defaultProviderConfig,
      isTesting,
      isSaving,
      isImportingModels,
      testResult,
      importResult,
      customModels,
      importedModels,
      saveConfig,
      resetConfig,
      testConnection,
      importModels,
      getProviderType,
      onProviderChange,
      onModelChange,
      onConfigChange,
      onDefaultProviderConfigChange,
      editCustomModel,
      deleteCustomModel,
      isValidProvider,
      getDefaultProvider,
      getDefaultProviderName,
      getDefaultBaseURLPlaceholder
    }
  }
}
</script>

<style scoped>
.api-config-container {
  width: 100%;
  padding: 0;
}

.config-card {
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

.card-header h3 {
  margin: 0 0 5px 0;
  font-size: 18px;
}

.card-header p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.card-header .tip {
  font-size: 12px;
  color: #666;
  margin-left: 10px;
}

/* 默认对接商配置样式 */
.default-provider-config {
  margin-top: 10px;
}

.default-provider-config .provider-name {
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 15px;
  padding: 5px 10px;
  border-radius: 4px;
  color: white;
  display: inline-block;
}

.default-provider-config .provider-openai {
  background-color: #1976d2;
}

.default-provider-config .provider-anthropic {
  background-color: #4caf50;
}

.default-provider-config .provider-qwen {
  background-color: #ff9800;
}

.default-provider-config .provider-iflow {
  background-color: #9c27b0;
}

.no-provider-selected {
  margin: 10px 0;
}

/* 提供商配置样式 */
.provider-config-section h4 {
  margin: 0 0 15px 0;
  font-size: 16px;
  color: #333;
}

.test-section {
  margin: 20px 0;
}

.test-section .el-button {
  margin-right: 10px;
}

.save-section {
  margin: 20px 0;
  text-align: center;
}

.save-section .el-button {
  margin: 0 10px;
}

.info-card {
  margin-top: 20px;
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
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

.custom-models-section {
  margin: 30px 0;
}

.model-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.model-card {
  display: flex;
  flex-direction: column;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
}

.model-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.model-name {
  font-weight: bold;
  font-size: 16px;
}

.model-provider {
  padding: 2px 8px;
  border-radius: 4px;
  color: white;
  font-size: 12px;
}

.provider-openai {
  background-color: #1976d2;
}

.provider-anthropic {
  background-color: #4caf50;
}

.provider-qwen {
  background-color: #ff9800;
}

.provider-iflow {
  background-color: #9c27b0;
}

.model-details p {
  margin: 5px 0;
  font-size: 14px;
  color: #666;
}

.model-actions {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.empty-models {
  text-align: center;
  padding: 20px;
  color: #999;
}

.imported-models {
  margin-top: 20px;
}

.model-tag {
  margin-right: 8px;
  margin-bottom: 8px;
}
</style>