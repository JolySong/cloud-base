<template>
  <div class="user-container">
    <div class="user-header">
      <h1>用户管理</h1>
      <button class="btn btn-primary" @click="handleAdd">新增用户</button>
    </div>
    
    <div class="table-container">
      <div class="table-wrapper" v-loading="loading">
        <table class="custom-table">
          <thead>
            <tr>
              <th>用户名</th>
              <th>昵称</th>
              <th>邮箱</th>
              <th>手机号</th>
              <th width="100">状态</th>
              <th width="300">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in userList" :key="row.id">
              <td>{{ row.username }}</td>
              <td>{{ row.nickname }}</td>
              <td class="description-cell" :title="row.email">{{ row.email }}</td>
              <td>{{ row.phone }}</td>
              <td>
                <span :class="['status-tag', row.status === 1 ? 'status-success' : 'status-danger']">
                  {{ row.status === 1 ? '启用' : '禁用' }}
                </span>
              </td>
              <td>
                <div class="operation-column">
                  <button 
                    class="btn-text" 
                    @click="handleEdit(row)"
                    :disabled="row.username === 'superAdmin'"
                    :title="row.username === 'superAdmin' ? '超级管理员用户不能修改' : ''"
                  >编辑</button>
                  <button 
                    class="btn-text" 
                    @click="handleRoleSetting(row)"
                    :disabled="row.username === 'superAdmin'"
                    :title="row.username === 'superAdmin' ? '超级管理员用户不能设置角色' : ''"
                  >角色设置</button>
                  <button 
                    class="btn-text" 
                    @click="handlePermissionSetting(row)"
                    :disabled="row.username === 'superAdmin'"
                    :title="row.username === 'superAdmin' ? '超级管理员用户不能设置权限' : ''"
                  >权限设置</button>
                  <button 
                    class="btn-text btn-danger" 
                    @click="handleDelete(row)"
                    :disabled="row.username === 'superAdmin'"
                    :title="row.username === 'superAdmin' ? '超级管理员用户不能删除' : ''"
                  >删除</button>
                </div>
              </td>
            </tr>
            <tr v-if="!userList.length">
              <td colspan="7" class="empty-cell">暂无数据</td>
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

    <!-- 用户表单组件 -->
    <user-form
      v-model:visible="formVisible"
      :data="currentRow"
      @success="handleSuccess"
    />

    <!-- 修改角色设置对话框 -->
    <div v-if="roleDialogVisible" class="modal-overlay" @click="handleRoleCancel">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>角色设置 ({{ currentUser?.username }})</h3>
          <button class="close-button" @click="handleRoleCancel"></button>
        </div>
        
        <div class="modal-body" v-loading="roleLoading">
          <RoleSettingTree
            v-if="roleList.length"
            :role-list="roleList"
            v-model:checked-roles="checkedRoles"
          />
          <div v-else class="empty-message">暂无数据</div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-default" @click="handleRoleCancel">取消</button>
          <button 
            class="btn btn-primary" 
            @click="handleSaveRole"
            :disabled="saveRoleLoading"
          >
            {{ saveRoleLoading ? '保存中...' : '确定' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 修改权限设置对话框 -->
    <div v-if="permissionDialogVisible" class="modal-overlay" @click="handlePermissionCancel">
      <div class="modal-content permission-dialog" @click.stop>
        <div class="modal-header">
          <h3>权限设置 ({{ currentUser?.username }})</h3>
          <button class="close-button" @click="handlePermissionCancel">×</button>
        </div>
        
        <div class="modal-body" v-loading="permissionLoading">
            <div class="filter-section">
              <div class="filter-item">
                <label>选择系统：<span class="required">*</span></label>
                <select v-model="selectedAppId" class="select-input" required>
                  <option value="" disabled>请选择系统</option>
                  <option v-for="system in systemList" 
                    :key="system.appId" 
                    :value="system.appId"
                  >
                    {{ system.appName }}
                  </option>
                </select>
              </div>
              <div class="filter-item">
                <label>选择角色：<span class="required">*</span></label>
                <select v-model="selectedRoleId" class="select-input" required>
                  <option value="" disabled>请选择角色</option>
                  <option v-for="role in filteredRoles" 
                    :key="role.roleId" 
                    :value="role.roleId"
                  >
                    {{ role.roleName }}
                  </option>
                </select>
              </div>
              <div class="filter-item">
                <label>搜索：</label>
                <input 
                  type="text" 
                  v-model="searchKey" 
                  class="search-input" 
                  placeholder="输入资源名称或地址搜索"
                >
              </div>
            </div>
            <div v-if="permissionList.length">
                <PermissionSettingTree
                  :permission-list="permissionList"
                  v-model:checked-permissions="checkedPermissions"
                  v-model:expanded-keys="expandedKeys"
                />
              </div>
              <div v-else class="empty-message">暂无数据</div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-default" @click="handlePermissionCancel">取消</button>
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, defineComponent, watch } from 'vue'
import { getUserList, deleteUser, resetUserPassword, 
  getSelectedRoles, getRoleGroupBySystem, updateUserRoles, 
  getUserPermissions, updateUserPermissions, getUserRoleList } from '@/api/user'
import { showMessage, showConfirm } from '@/utils/message'
import UserForm from './components/UserForm.vue'
import TreeNode from '../role/components/TreeNode.vue'
import RoleSettingTree from './components/RoleSettingTree.vue'
import PermissionSettingTree from './components/PermissionSettingTree.vue'

// 注册组件
const components = {
  TreeNode,
  UserForm,
  RoleSettingTree,
  PermissionSettingTree
}

const loading = ref(false)
const userList = ref([])
const total = ref(0)

// 查询参数
const queryParams = reactive({
  page: 1,
  size: 10
})

// 表单相关
const formVisible = ref(false)
const currentRow = ref({})

// 角色设置相关
const roleDialogVisible = ref(false)
const roleLoading = ref(false)
const saveRoleLoading = ref(false)
const roleList = ref([])
const checkedRoles = ref([])
const originalRoles = ref([])
const currentUser = ref(null)

// 权限设置相关
const permissionDialogVisible = ref(false)
const permissionLoading = ref(false)
const savePermissionLoading = ref(false)
const systemList = ref([])  // 系统列表
const permissionList = ref([])  // 权限树数据
const checkedPermissions = ref([])
const originalPermissions = ref([])
const expandedKeys = ref(new Set())
const selectedAppId = ref('')
const selectedRoleId = ref('')
const searchKey = ref('')

// 资源类型配置
const resourceTypes = {
  M: { label: '目录', type: 'primary' },
  C: { label: '菜单', type: 'success' },
  F: { label: '按钮', type: 'warning' },
  A: { label: '接口', type: 'info' }
}

const getResourceTypeLabel = (type) => resourceTypes[type]?.label || type
const getResourceTypeClass = (type) => resourceTypes[type]?.type || 'default'

// 获取用户列表
const fetchData = async () => {
  loading.value = true
  try {
    const res = await getUserList(queryParams)
    userList.value = res.data.records
    total.value = res.data.total
  } finally {
    loading.value = false
  }
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

const handleAdd = () => {
  currentRow.value = {}
  formVisible.value = true
}

const handleEdit = (row) => {
  currentRow.value = { ...row }
  formVisible.value = true
}

const handleDelete = (row) => {
  showConfirm(
    '确认删除该用户吗？',
    '警告'
  ).then(async () => {
    try {
      await deleteUser(row.id)
      showMessage('删除成功')
      fetchData()
    } catch (error) {
      console.error('删除失败:', error)
      showMessage('删除失败，请重试', 'error')
    }
  }).catch(() => {})
}

const handleResetPassword = async (row) => {
  try {
    await showConfirm(
      '确认重置该用户的密码吗？',
      '警告'
    )
    
    const res = await resetUserPassword(row.id)
    showMessage(`密码重置成功，新密码：${res.data}`)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('密码重置失败:', error)
      showMessage('密码重置失败，请重试', 'error')
    }
  }
}

const handleSuccess = () => {
  fetchData()
}

// 角色设置处理函数
const handleRoleSetting = async (row) => {
  currentUser.value = row
  roleDialogVisible.value = true
  roleLoading.value = true
  
  try {
    // 获取角色列表和用户角色
    const [roleRes, userRoleRes] = await Promise.all([
      getRoleGroupBySystem(),
      getSelectedRoles(row.id)
    ])
    
    roleList.value = roleRes.data || []
    // 确保 checkedRoles 是一个数组，包含用户已选择的角色 ID
    console.log('userRoleRes.data', userRoleRes.data)
    checkedRoles.value = userRoleRes.data || []
    originalRoles.value = [...checkedRoles.value]
  } catch (error) {
    console.error('获取角色数据失败:', error)
    showMessage('获取角色数据失败', 'error')
    roleDialogVisible.value = false
  } finally {
    roleLoading.value = false
  }
}

const isRoleChecked = (id) => {
  return checkedRoles.value.includes(id)
}

const handleRoleCheck = (event, role) => {
  const checked = event.target.checked
  if (checked) {
    if (!checkedRoles.value.includes(role.id)) {
      checkedRoles.value.push(role.id)
    }
  } else {
    const index = checkedRoles.value.indexOf(role.id)
    if (index > -1) {
      checkedRoles.value.splice(index, 1)
    }
  }
}

const handleRoleCancel = () => {
  checkedRoles.value = [...(originalRoles.value || [])]
  roleDialogVisible.value = false
}

const handleSaveRole = async () => {
  saveRoleLoading.value = true
  try {
    await updateUserRoles(currentUser.value.id, checkedRoles.value)
    originalRoles.value = [...checkedRoles.value]
    showMessage('保存成功')
    roleDialogVisible.value = false
  } catch (error) {
    console.error('保存失败:', error)
    showMessage('保存失败，请重试', 'error')
  } finally {
    saveRoleLoading.value = false
  }
}

// 获取系统列表
const fetchSystemList = async () => {
  try {
    const res = await getUserRoleList(currentUser.value.id)
    systemList.value = res.data || []
  } catch (error) {
    console.error('获取系统列表失败:', error)
    showMessage('获取系统列表失败', 'error')
  }
}

// 过滤出选中系统的角色列表
const filteredRoles = computed(() => {
  if (!selectedAppId.value) return []
  const selectedSystem = systemList.value.find(system => system.appId === selectedAppId.value)
  return selectedSystem?.roles || []
})

// 权限设置处理函数
const handlePermissionSetting = async (row) => {
  currentUser.value = row
  permissionDialogVisible.value = true
  permissionLoading.value = true
  
  try {
    // 重置状态
    checkedPermissions.value = []
    originalPermissions.value = []
    expandedKeys.value = new Set()
    permissionList.value = []
    selectedAppId.value = ''
    selectedRoleId.value = ''
    
    // 获取系统和角色列表
    await fetchSystemList()


  } catch (error) {
    console.error('获取权限数据失败:', error)
    showMessage('获取权限数据失败', 'error')
    permissionDialogVisible.value = false
  } finally {
    permissionLoading.value = false
  }
}

// 获取用户权限数据
const fetchUserPermissions = async () => {
  if (!selectedAppId.value || !selectedRoleId.value) return
  
  permissionLoading.value = true
  try {
    // 获取用户在该角色下的权限数据
    const permissionRes = await getUserPermissions(currentUser.value.id, selectedRoleId.value)
    if (permissionRes.data) {
      // 构造权限树数据结构
      permissionList.value = permissionRes.data.permissions || []
      checkedPermissions.value = permissionRes.data.selectedPermissions || []
      originalPermissions.value = [...checkedPermissions.value]
    }
  } catch (error) {
    console.error('获取用户权限数据失败:', error)
    showMessage('获取用户权限数据失败', 'error')
  } finally {
    permissionLoading.value = false
  }
}

// 获取资源树
const fetchResourceTree = async () => {
  if (!selectedAppId.value || !selectedRoleId.value) return
  
  permissionLoading.value = true
  try {
    // 获取用户在该角色下的权限数据
    await fetchUserPermissions()
  } catch (error) {
    console.error('获取资源树失败:', error)
    showMessage('获取资源树失败', 'error')
  } finally {
    permissionLoading.value = false
  }
}

// 监听系统和角色选择变化
watch(selectedAppId, () => {
  selectedRoleId.value = ''
  permissionList.value = []
  checkedPermissions.value = []
  originalPermissions.value = []
})

watch(selectedRoleId, () => {
  if (selectedRoleId.value) {
    fetchResourceTree()
  } else {
    permissionList.value = []
    checkedPermissions.value = []
    originalPermissions.value = []
  }
})

const isPermissionChecked = (id) => {
  return checkedPermissions.value.includes(id)
}

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

const handlePermissionCancel = () => {
  checkedPermissions.value = [...originalPermissions.value]
  permissionDialogVisible.value = false
}

const handleSavePermission = async () => {
  savePermissionLoading.value = true
  try {
    await updateUserPermissions(currentUser.value.id, selectedRoleId.value, selectedAppId.value, checkedPermissions.value)
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


// 在组件挂载时获取用户列表数据
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
@import '@/styles/variables.css';

.user-container {
  background-color: var(--bg-color);
  border-radius: 8px;
  height: 100%;
  display: flex;
  flex-direction: column;
  margin: 20px;
  box-shadow: 0 1px 2px 0 var(--shadow-color);
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 3px 6px var(--shadow-color);
  }
}

.user-header {
  padding: 16px 24px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;

  h1 {
    margin: 0;
    font-size: 16px;
    font-weight: 500;
    color: var(--text-color);
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

  &:hover:not(:disabled) {
    background-color: var(--hover-color);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
    color: var(--text-color-secondary) !important;
  }

  &.btn-danger {
    color: #ff4d4f;

    &:hover:not(:disabled) {
      color: #ff7875;
    }
  }
}

.pagination-container {
  padding: 16px 24px;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
}

.role-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: center;
}

.role-tag {
  display: inline-block;
  padding: 2px 8px;
  background-color: rgba(24, 144, 255, 0.1);
  color: var(--primary-color);
  border-radius: 4px;
  font-size: 12px;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

.role-list {
  padding: 8px 0;
}

.role-item {
  padding: 8px 16px;
  transition: all 0.2s;
  border-radius: 4px;

  &:hover {
    background-color: var(--hover-color);
  }
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

.role-name {
  color: var(--text-color);
  font-size: 14px;
}

.role-app {
  color: var(--text-color-secondary);
  font-size: 13px;
}

.permission-dialog {
  width: 600px;
}

.role-settings {
  padding: 16px;
}

.role-group {
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }
}

.app-name {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-color);
  margin-bottom: 12px;
  padding-left: 8px;
  border-left: 3px solid var(--primary-color);
}

.role-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  padding: 0 8px;
}

.role-item {
  padding: 8px 12px;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background-color: var(--hover-color);
  }
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
  color: var(--text-color);

  input[type="checkbox"] {
    width: 16px;
    height: 16px;
    cursor: pointer;
  }
}

.role-name {
  font-size: 14px;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.role-remark {
  font-size: 13px;
  color: var(--text-color-secondary);
}

.app-header {
  margin-bottom: 12px;
  padding: 0 8px;
}

.app-name {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-color);
}

.role-settings {
  padding: 16px;
}

.role-group {
  margin-bottom: 24px;
  background-color: var(--bg-color);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  padding: 16px;

  &:last-child {
    margin-bottom: 0;
  }
}

.role-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  padding: 0 8px;
}

.role-item {
  padding: 8px 12px;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background-color: var(--hover-color);
  }
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
  color: var(--text-color);

  input[type="checkbox"] {
    width: 16px;
    height: 16px;
    cursor: pointer;
  }
}

.role-name {
  font-size: 14px;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.role-remark {
  font-size: 13px;
  color: var(--text-color-secondary);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: var(--bg-color);
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 16px 24px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 500;
    color: var(--text-color);
  }
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  position: relative;
  min-height: 200px;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.close-button {
  background: none;
  border: none;
  font-size: 20px;
  color: var(--text-color-secondary);
  cursor: pointer;
  padding: 4px;
  line-height: 1;
  transition: all 0.2s;

  &:hover {
    color: var(--text-color);
  }
}

.btn-default {
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  color: var(--text-color);

  &:hover:not(:disabled) {
    border-color: var(--primary-color);
    color: var(--primary-color);
  }
}

.empty-message {
  text-align: center;
  color: var(--text-color-secondary);
  padding: 32px 0;
}

.filter-section {
  display: flex;
  gap: 10px;
  padding: 5px;
  background-color: var(--hover-color);
  border-radius: 8px;
}

.filter-item {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
  label {
    font-size: 14px;
    color: var(--text-color);
    font-weight: 500;
    width: 90px;
    text-align: right;
  }
}

.select-input {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--bg-color);
  color: var(--text-color);
  font-size: 14px;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  padding-right: 40px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: var(--primary-color);
  }

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
  }

  option {
    padding: 8px;
    background-color: var(--bg-color);
    color: var(--text-color);

    &:hover {
      background-color: var(--hover-color);
    }
  }
}

.required {
  color: #ff4d4f;
  margin-left: 4px;
}

.search-input {
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
</style> 