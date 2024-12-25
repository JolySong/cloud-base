<template>
  <div v-if="dialogVisible" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>{{ formData.id ? '编辑应用' : '新增应用' }}</h3>
        <button class="close-button" @click="dialogVisible = false">×</button>
      </div>
      
      <form class="application-form" @submit.prevent="handleSubmit">
        <div class="form-item" :class="{ 'has-error': errors.appName }">
          <label>应用名称：</label>
          <div class="input-wrapper">
            <input
              type="text"
              v-model="formData.appName"
              placeholder="请输入应用名称"
              @blur="validateField('appName')"
            >
            <span class="error-message" v-if="errors.appName">{{ errors.appName }}</span>
          </div>
        </div>

        <div class="form-item" :class="{ 'has-error': errors.appCode }">
          <label>应用编码：</label>
          <div class="input-wrapper">
            <input
              type="text"
              v-model="formData.appCode"
              placeholder="请输入应用编码"
              @blur="validateField('appCode')"
            >
            <span class="error-message" v-if="errors.appCode">{{ errors.appCode }}</span>
          </div>
        </div>

        <div class="form-item" :class="{ 'has-error': errors.frontendUrl }">
          <label>前端地址：</label>
          <div class="input-wrapper">
            <input
              type="text"
              v-model="formData.frontendUrl"
              placeholder="请输入前端地址"
              @blur="validateField('frontendUrl')"
            >
            <span class="error-message" v-if="errors.frontendUrl">{{ errors.frontendUrl }}</span>
          </div>
        </div>

        <div class="form-item" :class="{ 'has-error': errors.backendUrl }">
          <label>后端地址：</label>
          <div class="input-wrapper">
            <input
              type="text"
              v-model="formData.backendUrl"
              placeholder="请输入后端地址"
            >
          </div>
        </div>

        <div class="form-item" :class="{ 'has-error': errors.description }">
          <label>应用描述：</label>
          <div class="input-wrapper">
            <textarea
              v-model="formData.description"
              placeholder="请输入应用描述"
              rows="4"
              @blur="validateField('description')"
            ></textarea>
            <span class="error-message" v-if="errors.description">{{ errors.description }}</span>
          </div>
        </div>

        <div class="form-item" :class="{ 'has-error': errors.status }">
          <label>状态：</label>
          <div class="input-wrapper">
            <div class="radio-group">
              <label class="radio-label">
                <input type="radio" v-model="formData.status" :value="1">
                <span>启用</span>
              </label>
              <label class="radio-label">
                <input type="radio" v-model="formData.status" :value="0">
                <span>禁用</span>
              </label>
            </div>
            <span class="error-message" v-if="errors.status">{{ errors.status }}</span>
          </div>
        </div>

        <div class="form-footer">
          <button type="button" class="btn btn-default" @click="dialogVisible = false">取消</button>
          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? '提交中...' : '确定' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { createApplication, updateApplication } from '@/api/application'
import { showMessage } from '@/utils/message'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  data: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:visible', 'success'])

const dialogVisible = ref(props.visible)
const loading = ref(false)
const errors = ref({})

// 表单数据
const formData = reactive({
  id: '',
  appName: '',
  appCode: '',
  frontendUrl: '',  // 添加前端地址字段
  backendUrl: '',
  description: '',
  status: 1
})

// 表单校验规则
const rules = {
  appName: [
    { required: true, message: '请输入应用名称' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符' }
  ],
  appCode: [
    { required: true, message: '请输入应用编码' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符' }
  ],
  frontendUrl: [  // 添加前端地址验证规则
    { required: true, message: '请输入前端地址' },
    { min: 1, max: 200, message: '长度不能超过 200 个字符' }
  ],
  description: [
    { max: 500, message: '长度不能超过 500 个字符' }
  ],
  status: [
    { required: true, message: '请选择状态' }
  ]
}

// 监听visible变化
watch(
  () => props.visible,
  (val) => {
    dialogVisible.value = val
    if (val && props.data.id) {
      // 编辑模式，填充表单数据
      Object.assign(formData, props.data)
    }
  }
)

// 监听dialog visible变化
watch(
  () => dialogVisible.value,
  (val) => {
    emit('update:visible', val)
    if (!val) {
      handleClosed()
    }
  }
)

const validateField = (field) => {
  const value = formData[field]
  const fieldRules = rules[field]
  
  if (!fieldRules) return true

  for (const rule of fieldRules) {
    if (rule.required && !value) {
      errors.value[field] = rule.message
      return false
    }
    if (rule.min && value.length < rule.min) {
      errors.value[field] = rule.message
      return false
    }
    if (rule.max && value.length > rule.max) {
      errors.value[field] = rule.message
      return false
    }
    if (rule.validator && !rule.validator(value)) {
      errors.value[field] = rule.message
      return false
    }
  }

  errors.value[field] = ''
  return true
}

const validateForm = () => {
  let isValid = true
  for (const field in rules) {
    if (!validateField(field)) {
      isValid = false
    }
  }
  return isValid
}

// 提交表单
const handleSubmit = async () => {
  if (!validateForm()) return
  
  loading.value = true
  try {
    if (formData.id) {
      // 编辑模式
      await updateApplication(formData)
      showMessage('更新成功')
    } else {
      // 新增模式
      await createApplication(formData)
      showMessage('创建成功')
    }
    dialogVisible.value = false
    emit('success')
  } catch (error) {
    console.error('提交失败:', error)
    showMessage('操作失败，请重试', 'error')
  } finally {
    loading.value = false
  }
}

// 关闭时重置表单
const handleClosed = () => {
  errors.value = {}
  Object.assign(formData, {
    id: '',
    appName: '',
    appCode: '',
    frontendUrl: '',  // 重置前端地址
    backendUrl: '',
    description: '',
    status: 1
  })
}

const handleOverlayClick = (e) => {
  if (e.target === e.currentTarget) {
    dialogVisible.value = false
  }
}
</script>

<style scoped>
@import '@/styles/variables.css';

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  background-color: var(--bg-color);
  border-radius: 8px;
  width: 560px;
  max-width: 90vw;
  box-shadow: 0 4px 12px var(--shadow-color);
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--hover-color);
  border-radius: 8px 8px 0 0;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 500;
    color: var(--text-color);
  }
}

.close-button {
  background: none;
  border: none;
  font-size: 20px;
  color: var(--text-color-secondary);
  cursor: pointer;
  padding: 4px 8px;
  line-height: 1;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    color: var(--text-color);
    background-color: var(--border-color);
  }
}

.application-form {
  padding: 28px 32px;
}

.form-item {
  margin-bottom: 20px;
  margin-right: 30px;
  position: relative;
  display: flex;
  align-items: flex-start;

  &:last-child {
    margin-bottom: 0;
  }

  &.has-error input,
  &.has-error textarea {
    border-color: #ff4d4f;
  }

  label {
    flex: 0 0 80px;
    padding-top: 10px;
    color: var(--text-color);
    font-size: 14px;
    font-weight: 500;
  }

  .input-wrapper {
    flex: 1;
    min-width: 0;
    position: relative;
  }

  input,
  textarea {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    background-color: var(--bg-color);
    color: var(--text-color);
    font-size: 14px;
    transition: all 0.2s;

    &:hover {
      border-color: var(--primary-color);
    }

    &:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
    }

    &::placeholder {
      color: var(--text-color-secondary);
    }
  }

  textarea {
    resize: vertical;
    min-height: 90px;
    line-height: 1.6;
  }
}

.radio-group {
  display: flex;
  gap: 32px;
  padding: 10px 0;
}

.radio-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: var(--text-color);
  user-select: none;

  input[type="radio"] {
    width: 16px;
    height: 16px;
    margin-right: 8px;
    cursor: pointer;
  }

  span {
    font-size: 14px;
  }
}

.error-message {
  position: absolute;
  left: 0;
  bottom: -20px;
  color: #ff4d4f;
  font-size: 12px;
}

.form-footer {
  margin-top: 40px;
  padding-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid var(--border-color);
  margin-left: 80px;
}

.btn {
  padding: 9px 20px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  min-width: 80px;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
}

.btn-default {
  background-color: var(--hover-color);
  color: var(--text-color);

  &:hover:not(:disabled) {
    background-color: var(--border-color);
  }
}

.btn-primary {
  background-color: var(--primary-color);
  color: #fff;
  font-weight: 500;

  &:hover:not(:disabled) {
    opacity: 0.85;
  }
}

.message {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 20px;
  border-radius: 4px;
  color: #fff;
  font-size: 14px;
  z-index: 2001;
  transition: opacity 0.3s;
}

.message-success {
  background-color: #52c41a;
}

.message-error {
  background-color: #ff4d4f;
}

.message-fade-out {
  opacity: 0;
}
</style> 