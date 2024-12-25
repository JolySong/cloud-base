<template>
  <div class="resource-container">
    <div class="container-wrapper">
      <!-- 左侧应用树 -->
      <div class="left-tree">
        <div class="tree-header">应用列表</div>
        <div class="search-box">
          <input
            type="text"
            v-model="searchKey"
            placeholder="输入关键字搜索"
            class="search-input"
          >
        </div>
        <div class="tree-content">
          <div 
            v-for="app in filteredApps" 
            :key="app.id"
            :class="['tree-node', { active: currentApp?.id === app.id }]"
            @click="handleNodeClick(app)"
          >
            {{ app.appName }}
          </div>
        </div>
      </div>

      <!-- 右侧资源列表 -->
      <div class="right-content">
        <div class="resource-header">
          <div class="header-left">
            <h1>资源管理</h1>
            <span v-if="currentApp" class="app-info">
              ({{ currentApp.appName }})
            </span>
          </div>
          <div class="header-right">
            <button 
              class="btn btn-danger" 
              @click="handleBatchDelete" 
              :disabled="!selectedResources.length"
            >
              批量删除
            </button>
            <button 
              class="btn btn-warning" 
              @click="handleBatchMove" 
              :disabled="!selectedResources.length"
            >
              批量移动
            </button>
            <button 
              class="btn btn-primary" 
              @click="handleAdd" 
              :disabled="!currentApp"
            >
              新增资源
            </button>
          </div>
        </div>
        
        <div class="table-container">
          <div class="table-wrapper" v-loading="loading">
            <table class="custom-table">
              <thead>
                <tr>
                  <th width="20">
                    <input 
                      type="checkbox" 
                      :checked="isAllSelected"
                      @change="handleSelectAll"
                      :disabled="!resourceList.length"
                    >
                  </th>
                  <th width="140">资源名称</th>
                  <th width="40">类型</th>
                  <th width="100">所属系统</th>
                  <th width="100">权限标识</th>
                  <th width="200">地址</th>
                  <th width="80">排序</th>
                  <th width="80">状态</th>
                  <th width="90">是否公开</th>
                  <th width="200">操作</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="(row, index) in resourceList" :key="row.id">
                  <tr>
                    <td>
                      <input 
                        type="checkbox" 
                        :checked="isSelected(row)"
                        @change="handleSelect($event, row)"
                        :disabled="!isSelectable(row)"
                      >
                    </td>
                    <td class="resource-name">
                      <span class="indent" :style="{ width: getIndent(row) + 'px' }"></span>
                      <span 
                        v-if="hasChildren(row)"
                        class="expand-icon"
                        @click.stop="toggleExpand(row)"
                      >
                        {{ isExpanded(row) ? '▼' : '▶' }}
                      </span>
                      <span v-else class="expand-placeholder"></span>
                      <el-icon v-if="row.icon && row.icon !== '#'" class="icon">
                        <component :is="row.icon" />
                      </el-icon>
                      {{ row.resourceName }}
                    </td>
                    <td>
                      <span :class="['resource-tag', `tag-${getResourceTypeTag(row.resourceType)}`]">
                        {{ getResourceTypeLabel(row.resourceType) }}
                      </span>
                    </td>
                    <td>{{ row.appName || currentApp?.appName || '-' }}</td>
                    <td class="monospace">{{ row.resourceKey }}</td>
                    <td class="resource-url">
                      <template v-if="row.resourceType === 'A'">
                        <span :class="['method-tag', `method-${row.method.toLowerCase()}`]">
                          {{ row.method }}
                        </span>
                        <span class="api-url">{{ row.apiUrl }}</span>
                      </template>
                      <template v-else>
                        {{ row.resourceUrl === '#' ? '-' : row.resourceUrl }}
                      </template>
                    </td>
                    <td>{{ row.sort }}</td>
                    <td>
                      <span :class="['status-tag', row.status ? 'status-danger' : 'status-success']">
                        {{ row.status ? '隐藏' : '显示' }}
                      </span>
                    </td>
                    <td>
                      <span :class="['status-tag', row.isPublic ? 'status-success' : 'status-info']">
                        {{ row.isPublic ? '是' : '否' }}
                      </span>
                    </td>
                    <td>
                      <div class="operation-column">
                        <button class="btn-text" @click="handleAdd(row)">新增</button>
                        <button class="btn-text" @click="handleEdit(row)">编辑</button>
                        <button class="btn-text" @click="handleCopy(row)">复制</button>
                        <button class="btn-text btn-danger-del" @click="handleDelete(row)">删除</button>
                      </div>
                    </td>
                  </tr>
                </template>
                <tr v-if="!resourceList.length">
                  <td colspan="10" class="empty-cell">暂无数据</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- 表单组件 -->
    <resource-form
      v-model:visible="formVisible"
      :data="currentRow"
      :parent-id="currentParentId"
      :app-id="currentApp?.id"
      @success="handleSuccess"
    />

    <!-- 复制表单组件 -->
    <copy-resource-form
      v-model:visible="copyFormVisible"
      :source-data="currentRow"
      @success="handleSuccess"
    />

    <!-- 移动表单组件 -->
    <move-resource-form
      v-model:visible="moveFormVisible"
      :source-data="selectedResources"
      :current-app-id="currentApp?.id"
      @success="handleSuccess"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { getResourceList, deleteResource, batchDeleteResources } from '@/api/resource'
import { getApplicationList } from '@/api/application'
import { showMessage, showConfirm } from '@/utils/message'
import ResourceForm from './components/ResourceForm.vue'
import CopyResourceForm from './components/CopyResourceForm.vue'
import MoveResourceForm from './components/MoveResourceForm.vue'

const loading = ref(false)
const rawResourceList = ref([])
const appTreeData = ref([])
const currentApp = ref(null)
const searchKey = ref('')

// 表单相关
const formVisible = ref(false)
const copyFormVisible = ref(false)
const moveFormVisible = ref(false)
const currentRow = ref({})
const currentParentId = ref(null)

const selectedResources = ref([])

// 过滤应用列表
const filteredApps = computed(() => {
  if (!searchKey.value) return appTreeData.value
  const keyword = searchKey.value.toLowerCase()
  return appTreeData.value.filter(app => 
    app.appName.toLowerCase().includes(keyword)
  )
})

// 获取应用列表
const fetchAppList = async () => {
  try {
    const res = await getApplicationList()
    appTreeData.value = res.data
  } catch (error) {
    console.error('获取应用列表失败:', error)
    showMessage('获取应用列表失败', 'error')
  }
}

// 获取资源列表
const fetchResourceList = async (appId) => {
  if (!appId) {
    rawResourceList.value = []
    return
  }
  
  loading.value = true
  try {
    const res = await getResourceList({ appId })
    rawResourceList.value = res.data
  } finally {
    loading.value = false
  }
}

// 处理应用树节点点击
const handleNodeClick = (app) => {
  currentApp.value = app
  selectedResources.value = []
  fetchResourceList(app.id)
}

// 资源类型配置
const resourceTypes = {
  M: { label: '目录', type: 'primary' },
  C: { label: '菜单', type: 'success' },
  F: { label: '按钮', type: 'warning' },
  A: { label: '接口', type: 'info' }
}

const getResourceTypeLabel = (type) => {
  return resourceTypes[type]?.label || type
}

const getResourceTypeTag = (type) => {
  return resourceTypes[type]?.type || 'default'
}

// 获取缩进宽度
const getIndent = (row) => {
  return row.level * 20
}

// 查找父节点
const findParentNode = (node) => {
  const findParent = (data, targetId) => {
    for (const item of data) {
      if (item.children) {
        const found = item.children.find(child => child.id === targetId)
        if (found) return item
        const result = findParent(item.children, targetId)
        if (result) return result
      }
    }
    return null
  }
  return findParent(rawResourceList.value, node.id)
}

// 选择相关
const isAllSelected = computed(() => {
  return resourceList.value.length > 0 && 
    resourceList.value.every(item => isSelected(item))
})

const isSelected = (row) => {
  return selectedResources.value.some(item => item.id === row.id)
}

const handleSelectAll = (event) => {
  const checked = event.target.checked
  if (checked) {
    selectedResources.value = [...resourceList.value]
  } else {
    selectedResources.value = []
  }
}

const handleSelect = (event, row) => {
  const checked = event.target.checked
  if (checked) {
    selectedResources.value.push(row)
  } else {
    const index = selectedResources.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      selectedResources.value.splice(index, 1)
    }
  }
}

const isSelectable = (row) => {
  // 如果当前节点有选中子节点，则不可选择
  const hasSelectedChild = (node) => {
    if (node.children) {
      return node.children.some(child => 
        selectedResources.value.some(selected => selected.id === child.id) || 
        hasSelectedChild(child)
      )
    }
    return false
  }

  // 如果当前节点的父节点已选中，则不可选择
  const hasSelectedParent = (node) => {
    const parent = findParentNode(node)
    if (!parent) return false
    if (selectedResources.value.some(selected => selected.id === parent.id)) {
      return true
    }
    return hasSelectedParent(parent)
  }

  return !hasSelectedChild(row) && !hasSelectedParent(row)
}

// 修改新增方法
const handleAdd = (row) => {
  if (!currentApp.value) {
    showMessage('请先选择应用', 'error')
    return
  }
  currentRow.value = {}
  currentParentId.value = row?.id || null
  formVisible.value = true
}

// 修改编辑方法
const handleEdit = (row) => {
  currentRow.value = { ...row }
  currentParentId.value = row.parentId
  formVisible.value = true
}

const handleDelete = (row) => {
  showConfirm(
    '确认删除该资源吗？',
    '警告'
  ).then(async () => {
    try {
      await deleteResource(row.id)
      showMessage('删除成功')
      fetchResourceList(currentApp.value.id)
    } catch (error) {
      console.error('删除失败:', error)
      showMessage('删除失败，请重试', 'error')
    }
  }).catch(() => {})
}

// 处理复制
const handleCopy = (row) => {
  currentRow.value = { ...row }
  copyFormVisible.value = true
}

// 批量删除
const handleBatchDelete = () => {
  if (!selectedResources.value.length) return

  showConfirm(
    `确认删除选中的 ${selectedResources.value.length} 个资源吗？`,
    '警告'
  ).then(async () => {
    try {
      await batchDeleteResources(selectedResources.value.map(item => item.id))
      showMessage('删除成功')
      selectedResources.value = []
      fetchResourceList(currentApp.value.id)
    } catch (error) {
      console.error('删除失败:', error)
      showMessage('删除失败，请重试', 'error')
    }
  }).catch(() => {})
}

// 处理批量移动
const handleBatchMove = () => {
  if (!selectedResources.value.length) return
  moveFormVisible.value = true
}

const handleSuccess = () => {
  selectedResources.value = []
  fetchResourceList(currentApp.value.id)
}

// 展开状态管理
const expandedKeys = ref(new Set())

// 检查是否有子节点
const hasChildren = (row) => {
  return row.children && row.children.length > 0
}

// 检查是否展开
const isExpanded = (row) => {
  return expandedKeys.value.has(row.id)
}

// 切换展开状态
const toggleExpand = (row) => {
  if (expandedKeys.value.has(row.id)) {
    expandedKeys.value.delete(row.id)
  } else {
    expandedKeys.value.add(row.id)
  }
}

// 获取扁平化的资源列表
const resourceList = computed(() => {
  const flattenResources = (resources, level = 0) => {
    const result = []
    resources.forEach(resource => {
      result.push({ ...resource, level })
      if (resource.children && resource.children.length > 0 && expandedKeys.value.has(resource.id)) {
        result.push(...flattenResources(resource.children, level + 1))
      }
    })
    return result
  }
  return flattenResources(rawResourceList.value)
})

onMounted(() => {
  fetchAppList()
})
</script>

<style scoped>
@import '@/styles/variables.css';

.resource-container {
  height: 100%;
  padding: 20px;
}

.container-wrapper {
  display: flex;
  gap: 20px;
  height: 100%;
}

.left-tree {
  width: 280px;
  min-width: 280px;
  background-color: var(--bg-color);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 2px 0 var(--shadow-color);
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 3px 6px var(--shadow-color);
  }
}

.tree-header {
  padding: 16px 24px;
  border-bottom: 1px solid var(--border-color);
  font-size: 16px;
  font-weight: 500;
  color: var(--text-color);
}

.search-box {
  padding: 16px 24px;
  border-bottom: 1px solid var(--border-color);
}

.search-input {
  width: 100%;
  padding: 8px 4px;
  margin-right: 30px;
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

.tree-content {
  flex: 1;
  overflow: auto;
  padding: 8px 0;
}

.tree-node {
  padding: 8px 24px;
  cursor: pointer;
  color: var(--text-color);
  transition: all 0.2s;
  text-align: left;
  margin: 4px;
  &:hover {
    background-color: var(--hover-color);
  }

  &.active {
    background-color: var(--active-bg);
    color: var(--primary-color);
  }
}

.right-content {
  flex: 1;
  background-color: var(--bg-color);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 2px 0 var(--shadow-color);
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 3px 6px var(--shadow-color);
  }
}

.resource-header {
  padding: 16px 24px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;

  .header-left {
    display: flex;
    align-items: center;
    gap: 8px;

    h1 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
      color: var(--text-color);
    }

    .app-info {
      color: var(--text-color-secondary);
      font-size: 13px;
    }
  }

  .header-right {
    display: flex;
    gap: 8px;
  }
}

.table-container {
  flex: 1;
  overflow: auto;
  padding: 0 24px 24px;
}

.table-wrapper {
  position: relative;
  min-height: 200px;
}

.custom-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  
  th, td {
    padding: 8px 12px;
    text-align: center;
    border-bottom: 1px solid var(--border-color);
    height: 40px;
    line-height: 24px;
    box-sizing: border-box;
  }

  th {
    background-color: var(--hover-color);
    color: var(--text-color);
    font-weight: 500;
    white-space: nowrap;
    &:nth-child(2), &:nth-child(6) {
      text-align: left;
      padding-left: 24px;
    }
  }

  td {
    color: var(--text-color);
    vertical-align: middle;
    &:nth-child(6) {
      text-align: left;
      padding-left: 24px;
    }
  }

  tbody tr:hover {
    background-color: var(--hover-color);
  }
}

.resource-name {
  display: flex;
  align-items: center;
  gap: 4px;
  text-align: left;
  padding-left: 12px !important;
  
}

.indent {
  display: inline-block;
  height: 1px;
}

.icon {
  font-size: 16px;
  color: var(--text-color-secondary);
}

.resource-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 16px;
}

.tag-primary {
  background-color: rgba(24, 144, 255, 0.1);
  color: #1890ff;
}

.tag-success {
  background-color: rgba(82, 196, 26, 0.1);
  color: #52c41a;
}

.tag-warning {
  background-color: rgba(250, 173, 20, 0.1);
  color: #faad14;
}

.tag-info {
  background-color: rgba(144, 147, 153, 0.1);
  color: #909399;
}

.monospace {
  font-family: Consolas, Monaco, monospace;
  color: var(--text-color-secondary);
}

.resource-url {
  display: flex;
  align-items: center;
  gap: 8px;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.method-tag {
  flex: 0 0 auto;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  min-width: 30px;
  text-align: center;
}

.method-get {
  background-color: rgba(82, 196, 26, 0.1);
  color: #52c41a;
}

.method-post {
  background-color: rgba(24, 144, 255, 0.1);
  color: #1890ff;
}

.method-put {
  background-color: rgba(250, 173, 20, 0.1);
  color: #faad14;
}

.method-delete {
  background-color: rgba(255, 77, 79, 0.1);
  color: #ff4d4f;
}

.api-url {
  flex: 1;
  min-width: 0;
  font-family: Consolas, Monaco, monospace;
  color: var(--text-color-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 20px;
}

.status-success {
  background-color: rgba(82, 196, 26, 0.1);
  color: #52c41a;
}

.status-danger {
  background-color: rgba(255, 77, 79, 0.1);
  color: #ff4d4f;
}

.status-info {
  background-color: rgba(144, 147, 153, 0.1);
  color: #909399;
}

.operation-column {
  justify-content: center;
  gap: 8px;
}

.btn-text {
  background: none;
  border: none;
  color: var(--primary-color);
  cursor: pointer;
  padding: 4px 8px;
  font-size: 14px;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background-color: var(--hover-color);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  &.btn-danger {
    color: #ff4d4f;

    &:hover {
      color: #ff7875;
    }
  }
  &.btn-danger-del{
    color: #ff4d4f;
    &:hover {
      color: #ff7875;
    }
  }
}

.empty-cell {
  text-align: center;
  color: var(--text-color-secondary);
  padding: 32px 0;
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

.btn-primary {
  background-color: var(--primary-color);
  color: #fff;
  font-weight: 500;

  &:hover:not(:disabled) {
    opacity: 0.85;
  }
}

.btn-danger {
  background-color: #ff4d4f;
  color: #fff;
  font-weight: 500;

  &:hover:not(:disabled) {
    opacity: 0.85;
  }
}

.btn-warning {
  background-color: #faad14;
  color: #fff;
  font-weight: 500;

  &:hover:not(:disabled) {
    opacity: 0.85;
  }
}

.expand-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  margin-right: 4px;
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
  margin-right: 4px;
}
</style> 