<template>
  <div class="model-selector">
    <el-select 
      v-model="selectedModel" 
      placeholder="选择模型" 
      @change="onModelChange"
      style="width: 100%;"
    >
      <el-option-group label="系统模型">
        <el-option 
          v-for="model in systemModels" 
          :key="model.value" 
          :label="model.label" 
          :value="model.value"
        />
      </el-option-group>
      
      <el-option-group v-if="customModels.length > 0" label="自定义模型">
        <el-option 
          v-for="model in customModels" 
          :key="model.id" 
          :label="`${model.name} (${model.model})`" 
          :value="model.id"
        />
      </el-option-group>
    </el-select>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { getCustomModels } from '../services/aiService'

export default {
  name: 'ModelSelector',
  props: {
    modelValue: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue', 'modelChange'],
  setup(props, { emit }) {
    const selectedModel = ref('')
    const customModels = ref([])
    const systemModels = ref([
      { value: 'qwen3-max', label: '通义千问3-max' },
      { value: 'gpt-4', label: 'GPT-4' },
      { value: 'claude-3', label: 'Claude-3' },
      { value: 'qwen-max', label: '通义千问-max' },
      { value: 'qwen-plus', label: '通义千问-plus' }
    ])
    
    // 加载自定义模型
    const loadCustomModels = async () => {
      try {
        customModels.value = getCustomModels()
      } catch (error) {
        console.error('加载自定义模型失败:', error)
        customModels.value = []
      }
    }
    
    // 当模型选择改变时
    const onModelChange = (value) => {
      emit('update:modelValue', value)
      emit('modelChange', value)
    }
    
    // 监听外部模型值的变化
    watch(() => props.modelValue, (newVal) => {
      selectedModel.value = newVal
    })
    
    onMounted(() => {
      loadCustomModels()
      selectedModel.value = props.modelValue
    })
    
    return {
      selectedModel,
      customModels,
      systemModels,
      onModelChange
    }
  }
}
</script>

<style scoped>
.model-selector {
  margin: 10px 0;
}
</style>