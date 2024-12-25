<template>
  <div class="role-container">
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

      <!-- 右侧角色列表 -->
      <div class="right-content">
        <div class="role-header">
          <div class="header-left">
            <h1>角色管理</h1>
            <span v-if="currentApp" class="app-info">
              ({{ currentApp.appName }})
            </span>
          </div>
          <button 
            class="btn btn-primary" 
            @click="handleAdd"
            :disabled="!currentApp"
          >新增角色</button>
        </div>
        
        <div class="table-container">
          <div class="table-wrapper" v-loading="loading">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>角色编码</th>
                  <th>角色名称</th>
                  <th>所属应用</th>
                  <th>描述</th>
                  <th width="100">状态</th>
                  <th width="250">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in roleList" :key="row.id">
                  <td>{{ row.roleKey }}</td>
                  <td>{{ row.roleName }}</td>
                  <td>{{ row.appName }}</td>
                  <td class="description-cell" :title="row.remark">{{ row.remark }}</td>
                  <td>
                    <span :class="['status-tag', row.status === 1 ? 'status-success' : 'status-danger']">
                      {{ row.status === 1 ? '启用' : '禁用' }}
                    </span>
                  </td>
                  <td>
                    <div class="operation-column">
                      <button class="btn-text" @click="handleEdit(row)">编辑</button>
                      <button class="btn-text" @click="handlePermission(row)">权限设置</button>
                      <button class="btn-text btn-danger" @click="handleDelete(row)">删除</button>
                    </div>
                  </td>
                </tr>
                <tr v-if="!roleList.length">
                  <td colspan="6" class="empty-cell">暂无数据</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="pagination-container">
          <el-pagination
            v-model:current-page="queryParams.page"
            v-model:page-size="queryParams.size"
            :page-sizes="[10, 20, 30, 50]"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>

    <!-- 权限设置对话框 -->
    <div v-if="permissionDialogVisible" class="modal-overlay" @click="handleCancel">
      <div class="modal-content permission-dialog" @click.stop>
        <div class="modal-header">
          <h3>权限设置 ({{ currentRole?.roleName }})</h3>
          <button class="close-button" @click="handleCancel">×</button>
        </div>
        
        <div class="modal-body" v-loading="permissionLoading">
          <div class="permission-tree" v-if="permissionList.length">
            <tree-node
              v-for="item in permissionList"
              :key="item.id"
              :node="item"
              :checked="isChecked(item.id)"
              :expanded="expandedKeys.has(item.id)"
              :level="0"
              :is-checked="isChecked"
              :is-expanded="(id) => expandedKeys.has(id)"
              :get-resource-type-label="getResourceTypeLabel"
              :get-resource-type-class="getResourceTypeClass"
              @check="handlePermissionCheck"
              @toggle="toggleExpand"
            />
          </div>
          <div v-else class="empty-message">暂无数据</div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-default" @click="handleCancel">取消</button>
          <button 
            class="btn btn-primary" 
            @click="handleSavePermission"
            :disabled="savePermissionLoading"
          >
            {{ savePermissionLoading ? '保存中...' : '确定' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 角色表单组件 -->
    <role-form
      v-model:visible="formVisible"
      :data="currentRow"
      :app-id="currentApp?.id"
      :app-list="appTreeData"
      @success="handleSuccess"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { getRoleList, deleteRole, getRolePermissions, updateRolePermissions } from '@/api/role'
import { getApplicationList } from '@/api/application'
import { getResourceList } from '@/api/resource'
import RoleForm from './components/RoleForm.vue'
import TreeNode from './components/TreeNode.vue'
import { showMessage, showConfirm } from '@/utils/message'

const loading = ref(false)
const roleList = ref([])
const total = ref(0)
const currentApp = ref(null)
const searchKey = ref('')

// 询参数
const queryParams = reactive({
  page: 1,
  size: 10,
  appId: ''
})

// 过滤应用列表
const filteredApps = computed(() => {
  if (!searchKey.value) return appTreeData.value
  const keyword = searchKey.value.toLowerCase()
  return appTreeData.value.filter(app => 
    app.appName.toLowerCase().includes(keyword)
  )
})

// 获取应用列表
const appTreeData = ref([])
const fetchAppList = async () => {
  try {
    const res = await getApplicationList()
    appTreeData.value = res.data
  } catch (error) {
    console.error('获取应用列表失败:', error)
    showMessage('获取应用列表失败', 'error')
  }
}

// 处理应用树节点点击
const handleNodeClick = (app) => {
  currentApp.value = app
  queryParams.appId = app.id
  queryParams.page = 1  // 切换应用时重置页码
  fetchData()
}

// 获取角色列表
const fetchData = async () => {
  if (!currentApp.value) {
    roleList.value = []
    total.value = 0
    return
  }
  
  loading.value = true
  try {
    const res = await getRoleList(queryParams)
    roleList.value = res.data.records
    total.value = res.data.total
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  if (!currentApp.value) {
    showMessage('请先选择应用', 'error')
    return
  }
  currentRow.value = {}
  formVisible.value = true
}

const permissionDialogVisible = ref(false)
const permissionList = ref([])
const currentRole = ref(null)
const permissionLoading = ref(false)
const savePermissionLoading = ref(false)
const checkedPermissions = ref([])
const originalPermissions = ref([])
const expandedKeys = ref(new Set())

// 表单相关
const formVisible = ref(false)
const currentRow = ref({})

// 资源类型配置
const resourceTypes = {
  M: { label: '目录', type: 'primary' },
  C: { label: '菜单', type: 'success' },
  F: { label: '按钮', type: 'warning' },
  A: { label: '接口', type: 'info' }
}

const getResourceTypeLabel = (type) => resourceTypes[type]?.label || type
const getResourceTypeClass = (type) => resourceTypes[type]?.type || 'default'

// 检查权限是否被选中
const isChecked = (id) => {
  return checkedPermissions.value.includes(id)
}

// 处理权限选中状态变化
const handlePermissionCheck = (event, data) => {
  const checked = event.target.checked
  
  if (checked) {
    // 添加当前节点
    if (!checkedPermissions.value.includes(data.id)) {
      checkedPermissions.value.push(data.id)
    }
    // 如果有子节点，添加所有子节点
    if (data.children) {
      const childIds = getAllChildIds(data)
      childIds.forEach(id => {
        if (!checkedPermissions.value.includes(id)) {
          checkedPermissions.value.push(id)
        }
      })
    }
  } else {
    // 移除当前节点
    const index = checkedPermissions.value.indexOf(data.id)
    if (index > -1) {
      checkedPermissions.value.splice(index, 1)
    }
    // 如果有子节点，移除所有子节点
    if (data.children) {
      const childIds = getAllChildIds(data)
      childIds.forEach(id => {
        const childIndex = checkedPermissions.value.indexOf(id)
        if (childIndex > -1) {
          checkedPermissions.value.splice(childIndex, 1)
        }
      })
    }
  }
}

// 获取所有子节点的ID
const getAllChildIds = (node) => {
  const ids = []
  const getIds = (n) => {
    if (n.children) {
      n.children.forEach(child => {
        ids.push(child.id)
        getIds(child)
      })
    }
  }
  getIds(node)
  return ids
}

// 取消按钮处理
const handleCancel = () => {
  // 恢复原始选中状态
  checkedPermissions.value = [...originalPermissions.value]
  permissionDialogVisible.value = false
}

// 保存权限设置
const handleSavePermission = async () => {
  savePermissionLoading.value = true
  try {
    await updateRolePermissions(currentRole.value.id, checkedPermissions.value)
    // 更新原始权限数据
    originalPermissions.value = [...checkedPermissions.value]
    showMessage('保存成功')
    permissionDialogVisible.value = false
  } catch (error) {
    console.error('保存失败:', error)
    showMessage('保存失败，请重试', 'error')
  } finally {
    savePermissionLoading.value = false
  }
}

// 修改权限设置处理函数
const handlePermission = async (row) => {
  currentRole.value = row
  permissionDialogVisible.value = true
  permissionLoading.value = true
  
  try {
    // 重置权限状态和展开状态
    checkedPermissions.value = []
    originalPermissions.value = []
    expandedKeys.value = new Set()
    
    // 获取资源列表和角色权限
    const [resourceRes, permissionRes] = await Promise.all([
      getResourceList({ appId: row.appId }),
      getRolePermissions(row.id)
    ])
    
    permissionList.value = resourceRes.data
    checkedPermissions.value = permissionRes.data.map(item => item.resourceId)
    originalPermissions.value = [...checkedPermissions.value]
    
    // 默认展开第一级节点
    permissionList.value.forEach(item => {
      expandedKeys.value.add(item.id)
    })
  } catch (error) {
    console.error('获取权限数据失败:', error)
    showMessage('获取权限数据失败', 'error')
    permissionDialogVisible.value = false
  } finally {
    permissionLoading.value = false
  }
}

const handleEdit = (row) => {
  currentRow.value = { ...row }
  formVisible.value = true
}

const handleDelete = (row) => {
  showConfirm(
    '确认删除该角色吗？',
    '警告'
  ).then(async () => {
    try {
      await deleteRole(row.id)
      showMessage('删除成功')
      fetchData()
    } catch (error) {
      console.error('删除失败:', error)
      showMessage('删除失败，请重试', 'error')
    }
  }).catch(() => {})
}

const handleSuccess = () => {
  fetchData()
}

// 处理每页显示数量变化
const handleSizeChange = (val) => {
  queryParams.size = val
  fetchData()
}

// 处理页码变化
const handleCurrentChange = (val) => {
  queryParams.page = val
  fetchData()
}

// 切换展开/收起状态
const toggleExpand = (node) => {
  if (expandedKeys.value.has(node.id)) {
    expandedKeys.value.delete(node.id)
  } else {
    expandedKeys.value.add(node.id)
  }
}

onMounted(() => {
  fetchAppList()
})
</script>

<style scoped>
@import '@/styles/variables.css';

.role-container {
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

.role-header {
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
  
  th, td {
    padding: 12px;
    text-align: center;
    border-bottom: 1px solid var(--border-color);
  }

  th {
    background-color: var(--hover-color);
    color: var(--text-color);
    font-weight: 500;
    white-space: nowrap;
  }

  td {
    color: var(--text-color);
  }

  tbody tr:hover {
    background-color: var(--hover-color);
  }
}

.description-cell {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty-cell {
  text-align: center;
  color: var(--text-color-secondary);
  padding: 32px 0;
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

.operation-column {
  display: flex;
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

  &.btn-danger {
    color: #ff4d4f;

    &:hover {
      color: #ff7875;
    }
  }
}

/* Modal styles */
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
  width: 600px;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
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

.modal-body {
  flex: 1;
  overflow: auto;
  padding: 24px;
  min-height: 200px;
  position: relative;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* Tabs styles */
.tabs {
  display: flex;
  border-bottom: 1px solid var(--border-color);
  margin: -24px -24px 16px;
  background-color: var(--bg-color);
  padding: 0 24px;
}

.tab-item {
  padding: 12px 20px;
  cursor: pointer;
  color: var(--text-color-secondary);
  border-bottom: 2px solid transparent;
  transition: all 0.2s;

  &:hover {
    color: var(--primary-color);
  }

  &.active {
    color: var(--primary-color);
    border-bottom-color: var(--primary-color);
  }
}

/* Permission tree styles */
.permission-tree {
  padding: 8px 0;
}

.tree-node {
  margin-bottom: 4px;
}

.node-content {
  padding: 8px 0;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background-color: var(--hover-color);
  }
}

.node-children {
  margin-left: 24px;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;

  input[type="checkbox"] {
    width: 16px;
    height: 16px;
    cursor: pointer;
  }
}

.resource-tag {
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

.node-label {
  color: var(--text-color);
  font-size: 14px;
}

.empty-message {
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

.pagination-container {
  padding: 16px 24px;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
}

.node-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-right: 12px;
}

.expand-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
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
  width: 20px;
  height: 20px;
}

.checkbox-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}
</style> 