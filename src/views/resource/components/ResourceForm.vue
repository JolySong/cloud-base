<template>
  <div v-if="dialogVisible" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>{{ formData.id ? '编辑资源' : '新增资源' }}</h3>
        <button class="close-button" @click="dialogVisible = false">×</button>
      </div>
      
      <form class="resource-form" @submit.prevent="handleSubmit">
        <div class="form-item" :class="{ 'has-error': errors.resourceName }">
          <label>资源名称：</label>
          <div class="input-wrapper">
            <input
              type="text"
              v-model="formData.resourceName"
              placeholder="请输入资源名称"
              @blur="validateField('resourceName')"
            >
            <span class="error-message" v-if="errors.resourceName">{{ errors.resourceName }}</span>
          </div>
        </div>

        <div class="form-item">
          <label>上级资源：</label>
          <div class="input-wrapper">
            <div 
              class="tree-select"
              :class="{ active: showTreeSelect }"
              @click="showTreeSelect = true"
            >
              <span v-if="selectedParent">{{ selectedParent.resourceName }}</span>
              <span v-else class="placeholder">请选择上级资源</span>
              <span class="clear-icon" @click.stop="clearParent" v-if="formData.parentId">×</span>
            </div>
            <div v-if="showTreeSelect" class="tree-select-dropdown" @click.stop>
              <div class="tree-select-header">
                <span>选择上级资源</span>
                <button class="close-button" @click="showTreeSelect = false">×</button>
              </div>
              <div class="tree-select-body">
                <div class="tree-node root-node" @click="selectParent(null)">
                  <span class="node-content">
                    <span class="node-label">作为顶级资源</span>
                  </span>
                </div>
                <template v-for="item in visibleNodes" :key="item.id">
                  <div 
                    class="tree-node"
                    :class="{ 
                      'is-disabled': isDisabled(item),
                      'is-selected': formData.parentId === item.id
                    }"
                    :style="{ paddingLeft: item.level * 20 + 'px' }"
                    @click="selectParent(item)"
                  >
                    <span class="node-content">
                      <span 
                        v-if="hasChildren(item)"
                        class="expand-icon"
                        @click.stop="toggleExpand(item)"
                      >
                        {{ isExpanded(item) ? '▼' : '▶' }}
                      </span>
                      <span v-else class="expand-placeholder"></span>
                      <span :class="['resource-tag', `tag-${getResourceTypeTag(item.resourceType)}`]">
                        {{ getResourceTypeLabel(item.resourceType) }}
                      </span>
                      <span class="node-label">{{ item.resourceName }}</span>
                    </span>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>

        <div class="form-item" :class="{ 'has-error': errors.resourceType }">
          <label>资源类型：</label>
          <div class="input-wrapper">
            <div class="resource-type-options">
              <label 
                v-for="(type, key) in resourceTypes" 
                :key="key"
                class="type-option"
                :class="{ active: formData.resourceType === key }"
              >
                <input
                  type="radio"
                  :value="key"
                  v-model="formData.resourceType"
                  @change="handleTypeChange"
                >
                <span class="type-icon">{{ type.icon }}</span>
                <span class="type-label">{{ type.label }}</span>
              </label>
            </div>
            <span class="error-message" v-if="errors.resourceType">{{ errors.resourceType }}</span>
          </div>
        </div>

        <div class="form-item" :class="{ 'has-error': errors.resourceKey }">
          <label>权限标识：</label>
          <div class="input-wrapper">
            <input
              type="text"
              v-model="formData.resourceKey"
              placeholder="请输入权限标识"
              @blur="validateField('resourceKey')"
            >
            <span class="error-message" v-if="errors.resourceKey">{{ errors.resourceKey }}</span>
          </div>
        </div>

        <template v-if="formData.resourceType === 'A'">
          <div class="form-item" :class="{ 'has-error': errors.method }">
            <label>请求方法：</label>
            <div class="input-wrapper">
              <select
                v-model="formData.method"
                @blur="validateField('method')"
              >
                <option value="">请选择请求方法</option>
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
              <span class="error-message" v-if="errors.method">{{ errors.method }}</span>
            </div>
          </div>

          <div class="form-item" :class="{ 'has-error': errors.apiUrl }">
            <label>接口地址：</label>
            <div class="input-wrapper">
              <input
                type="text"
                v-model="formData.apiUrl"
                placeholder="请输入接口地址"
                @blur="validateField('apiUrl')"
              >
              <span class="error-message" v-if="errors.apiUrl">{{ errors.apiUrl }}</span>
            </div>
          </div>
        </template>

        <template v-else>
          <div class="form-item" :class="{ 'has-error': errors.resourceUrl }">
            <label>路由地址：</label>
            <div class="input-wrapper">
              <input
                type="text"
                v-model="formData.resourceUrl"
                placeholder="请输入路由地址"
                @blur="validateField('resourceUrl')"
              >
              <span class="error-message" v-if="errors.resourceUrl">{{ errors.resourceUrl }}</span>
            </div>
          </div>

          <div class="form-item">
            <label>图标：</label>
            <div class="input-wrapper">
              <input
                type="text"
                v-model="formData.icon"
                placeholder="请输入图标"
              >
            </div>
          </div>
        </template>

        <div class="form-item">
          <label>排序：</label>
          <div class="input-wrapper">
            <input
              type="number"
              v-model="formData.sort"
              placeholder="请输入排序号"
            >
          </div>
        </div>

        <div class="form-item">
          <label>状态：</label>
          <div class="input-wrapper checkbox-wrapper">
            <label class="checkbox-label">
              <input
                type="checkbox"
                v-model="formData.status"
              >
              <span>隐藏</span>
            </label>
          </div>
        </div>

        <div class="form-item">
          <label>是否公开：</label>
          <div class="input-wrapper checkbox-wrapper">
            <label class="checkbox-label">
              <input
                type="checkbox"
                v-model="formData.isPublic"
              >
              <span>是</span>
            </label>
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
import { ref, reactive, watch, computed, onMounted } from 'vue'
import { createResource, updateResource, getResourceList } from '@/api/resource'
import { showMessage } from '@/utils/message'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  data: {
    type: Object,
    default: () => ({})
  },
  parentId: {
    type: [String, Number],
    default: null
  },
  appId: {
    type: [String, Number],
    default: null
  }
})

const emit = defineEmits(['update:visible', 'success'])

const dialogVisible = ref(props.visible)
const loading = ref(false)
const errors = ref({})

// 表单数据
const formData = reactive({
  id: '',
  resourceName: '',
  resourceType: '',
  resourceKey: '',
  resourceUrl: '',
  apiUrl: '',
  method: '',
  icon: '',
  sort: 0,
  status: false,
  isPublic: false,
  parentId: null,
  appId: null
})

// 表单校验规则
const rules = {
  resourceName: [
    { required: true, message: '请输入资源名称' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符' }
  ],
  resourceType: [
    { required: true, message: '请选择资源类型' }
  ],
  resourceKey: [
    { required: true, message: '请输入权限标识' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符' }
  ],
  resourceUrl: [
    { required: true, message: '请输入路由地址' }
  ],
  apiUrl: [
    { required: true, message: '请输入接口地址' }
  ],
  method: [
    { required: true, message: '请选择请求方法' }
  ]
}

// 资源树数据
const resourceTreeOptions = ref([])

// 展开状态管理
const expandedKeys = ref(new Set())

// 检查是否有子节点
const hasChildren = (node) => {
  return node.children && node.children.length > 0
}

// 检查是否展开
const isExpanded = (node) => {
  return expandedKeys.value.has(node.id)
}

// 切换展开状态
const toggleExpand = (node) => {
  if (expandedKeys.value.has(node.id)) {
    expandedKeys.value.delete(node.id)
  } else {
    expandedKeys.value.add(node.id)
  }
}

// 获取资源树数据
const fetchResourceTree = async () => {
  if (!props.appId) return
  
  try {
    const res = await getResourceList({ appId: props.appId })
    // 过滤掉当前编辑的节点及其子节点
    if (formData.id) {
      resourceTreeOptions.value = filterCurrentNode(res.data)
    } else {
      resourceTreeOptions.value = res.data
    }
  } catch (error) {
    console.error('获取资源树失败:', error)
    showMessage('获取资源树失败', 'error')
  }
}

// 过滤当前节点及其子节点
const filterCurrentNode = (data) => {
  return data.filter(node => {
    if (node.id === formData.id) {
      return false
    }
    if (node.children && node.children.length > 0) {
      node.children = filterCurrentNode(node.children)
    }
    return true
  })
}

// 修改模板中的遍历部分
const visibleNodes = computed(() => {
  const flattenNodes = (nodes, level = 0) => {
    const result = []
    nodes.forEach(node => {
      result.push({ ...node, level })
      if (node.children && node.children.length > 0 && expandedKeys.value.has(node.id)) {
        result.push(...flattenNodes(node.children, level + 1))
      }
    })
    return result
  }
  return flattenNodes(resourceTreeOptions.value)
})

// 获取缩进文本
const getIndentText = (level) => {
  return level > 0 ? '　'.repeat(level) + '├ ' : ''
}

// 判断是否是当前节点或其子节点
const isChildOrSelf = (node, id) => {
  if (node.id === id) return true
  if (node.children) {
    return node.children.some(child => isChildOrSelf(child, id))
  }
  return false
}

// 判断是否禁用选项
const isDisabled = (node) => {
  // 如果是编辑模式，禁用自己和子节点
  if (formData.id && isChildOrSelf(node, formData.id)) {
    return true
  }
  // 如果选择了资源类型，根据类型限制上级
  if (formData.resourceType) {
    // 目录可以选择目录作为上级
    if (formData.resourceType === 'M') {
      return node.resourceType !== 'M'
    }
    // 菜单可以选择目录作为上级
    if (formData.resourceType === 'C') {
      return node.resourceType !== 'M'
    }
    // 按钮和接口只能选择菜单作为上级
    if (['F', 'A'].includes(formData.resourceType)) {
      return node.resourceType !== 'C'
    }
  }
  return false
}

// 递归查找节点
const findNodeById = (nodes, id) => {
  for (const node of nodes) {
    if (node.id === id) return node
    if (node.children) {
      const found = findNodeById(node.children, id)
      if (found) return found
    }
  }
  return null
}

// 获取选中的父节点信息
const selectedParent = computed(() => {
  if (!formData.parentId) return null
  return findNodeById(resourceTreeOptions.value, formData.parentId)
})

// 监听visible变化
watch(
  () => props.visible,
  (val) => {
    dialogVisible.value = val
    if (val) {
      // 重置展开状态
      expandedKeys.value = new Set()
      // 获取资源树数据
      fetchResourceTree()
      // 编辑模式，填充表单数据
      Object.assign(formData, {
        ...props.data,
        parentId: props.parentId,
        appId: props.appId
      })
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

  // 如果是路由地址或接口地址，根据资源类型判断是否需要校验
  if (field === 'resourceUrl' && formData.resourceType === 'A') return true
  if (field === 'apiUrl' && formData.resourceType !== 'A') return true
  if (field === 'method' && formData.resourceType !== 'A') return true

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

// 监听资源类型变化
const handleTypeChange = () => {
  // 清空相关字段
  formData.resourceUrl = ''
  formData.apiUrl = ''
  formData.method = ''
  formData.icon = ''
  
  // 根据资源类型限制，可能需要清空上级资源
  if (formData.parentId) {
    const parent = resourceTreeOptions.value.find(item => item.id === formData.parentId)
    if (parent && isDisabled(parent)) {
      formData.parentId = ''
    }
  }
  
  // 清空相关错误
  errors.value.resourceUrl = ''
  errors.value.apiUrl = ''
  errors.value.method = ''
}

// 提交表单
const handleSubmit = async () => {
  if (!validateForm()) return
  
  loading.value = true
  try {
    if (formData.id) {
      // 编辑模式
      await updateResource(formData)
      showMessage('更新成功')
    } else {
      // 新增模式
      await createResource(formData)
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
  expandedKeys.value = new Set()
  Object.assign(formData, {
    id: '',
    resourceName: '',
    resourceType: '',
    resourceKey: '',
    resourceUrl: '',
    apiUrl: '',
    method: '',
    icon: '',
    sort: 0,
    status: false,
    isPublic: false,
    parentId: null,
    appId: null
  })
}

const handleOverlayClick = (e) => {
  if (e.target === e.currentTarget) {
    dialogVisible.value = false
  }
}

// 资源类型配置
const resourceTypes = {
  M: { label: '目录', icon: '📁', type: 'primary' },
  C: { label: '菜单', icon: '📋', type: 'success' },
  F: { label: '按钮', icon: '🔘', type: 'warning' },
  A: { label: '接口', icon: '🔗', type: 'info' }
}

// 获取资源类型标签
const getResourceTypeLabel = (type) => {
  return resourceTypes[type]?.label || type
}

// 获取资源类型样式
const getResourceTypeTag = (type) => {
  return resourceTypes[type]?.type || 'default'
}

const showTreeSelect = ref(false)

// 选择父节点
const selectParent = (node) => {
  if (node && isDisabled(node)) return
  formData.parentId = node?.id || null
  showTreeSelect.value = false
}

// 清空父节点
const clearParent = () => {
  formData.parentId = null
}

// 点击其他区域关闭下拉框
onMounted(() => {
  document.addEventListener('click', () => {
    showTreeSelect.value = false
  })
})
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

.resource-form {
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
  &.has-error select {
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
  select {
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

    &:disabled {
      background-color: var(--hover-color);
      cursor: not-allowed;
      color: var(--text-color-secondary);
    }
  }

  select {
    appearance: none;
    padding-right: 30px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23666' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
    background-position: right 8px center;
    background-repeat: no-repeat;
    background-size: 20px;
  }
}

.checkbox-wrapper {
  padding-top: 10px;
}

.checkbox-label {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  user-select: none;

  input[type="checkbox"] {
    width: 16px;
    height: 16px;
    margin: 0 8px 0 0;
    cursor: pointer;
  }

  span {
    color: var(--text-color);
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

.resource-type-options {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.type-option {
  flex: 1;
  min-width: 100px;
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s;
  background-color: var(--bg-color);

  &:hover {
    border-color: var(--primary-color);
  }

  &.active {
    border-color: var(--primary-color);
    background-color: var(--active-bg);

    .type-label {
      color: var(--primary-color);
    }
  }

  input[type="radio"] {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }

  .type-icon {
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .type-label {
    font-size: 14px;
    color: var(--text-color);
  }
}

.tree-select {
  width: 100%;
  min-height: 40px;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--bg-color);
  color: var(--text-color);
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.2s;

  &:hover {
    border-color: var(--primary-color);
  }

  &.active {
    border-color: var(--primary-color);
  }

  .placeholder {
    color: var(--text-color-secondary);
  }

  .clear-icon {
    color: var(--text-color-secondary);
    font-size: 16px;
    padding: 2px 6px;
    margin-right: -6px;
    border-radius: 4px;
    transition: all 0.2s;

    &:hover {
      color: var(--text-color);
      background-color: var(--hover-color);
    }
  }
}

.tree-select-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background-color: var(--bg-color);
  border-radius: 4px;
  box-shadow: 0 4px 12px var(--shadow-color);
  z-index: 2001;
}

.tree-select-header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--text-color);
  font-weight: 500;
}

.tree-select-body {
  max-height: 300px;
  overflow-y: auto;
  padding: 4px 0;
}

.tree-node {
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-color);
  display: flex;
  align-items: center;

  &:hover {
    background-color: var(--hover-color);
  }

  &.is-selected {
    color: var(--primary-color);
    background-color: var(--active-bg);
  }

  &.is-disabled {
    cursor: not-allowed;
    opacity: 0.6;
    background-color: var(--hover-color);
  }

  &.root-node {
    border-bottom: 1px solid var(--border-color);
    margin-bottom: 4px;
  }
}

.node-content {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.node-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.expand-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  cursor: pointer;
  user-select: none;
  color: var(--text-color-secondary);
  font-size: 12px;
  transition: all 0.2s;

  &:hover {
    color: var(--text-color);
  }
}

.expand-placeholder {
  display: inline-block;
  width: 20px;
}
</style> 