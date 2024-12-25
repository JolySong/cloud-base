<template>
  <div class="application-container">
    <div class="application-header">
      <h1>应用管理</h1>
      <el-button type="primary" @click="handleAdd">新增应用</el-button>
    </div>
    
    <div class="table-container">
      <div class="table-wrapper" v-loading="loading">
        <table class="custom-table">
          <thead>
            <tr>
              <th width="80">ID</th>
              <th>编码</th>
              <th>应用名称</th>
              <th>前端地址</th>
              <th>后端地址</th>
              <th>描述</th>
              <th width="100">状态</th>
              <th width="150">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in applicationList" :key="row.id">
              <td>{{ row.id }}</td>
              <td>{{ row.appCode }}</td>
              <td>{{ row.appName }}</td>
              <td>{{ row.frontendUrl }}</td>
              <td>{{ row.backendUrl }}</td>
              <td>{{ row.remark }}</td>
              <td>
                <el-tag :type="row.status ? 'success' : 'danger'" class="status-tag">
                  {{ row.status ? '启用' : '禁用' }}
                </el-tag>
              </td>
              <td>
                <div class="operation-column">
                  <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
                  <el-button type="danger" link @click="handleDelete(row)" class="delete-btn">删除</el-button>
                </div>
              </td>
            </tr>
            <tr v-if="!applicationList.length">
              <td colspan="6" class="empty-cell">暂无数据</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <application-form
      v-model:visible="formVisible"
      :data="currentRow"
      @success="handleSuccess"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getApplicationList, deleteApplication } from '@/api/application'
import ApplicationForm from './components/ApplicationForm.vue'
import { showMessage, showConfirm } from '@/utils/message'

const loading = ref(false)
const applicationList = ref([])
const formVisible = ref(false)
const currentRow = ref({})

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getApplicationList()
    applicationList.value = res.data
  } finally {
    loading.value = false
  }
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
    '确认删除该应用吗？',
    '警告'
  ).then(async () => {
    try {
      await deleteApplication(row.id)
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

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
@import '@/styles/variables.css';

.application-container {
  background-color: var(--bg-color);
  border-radius: 8px;
  height: 100%;
  display: flex;
  flex-direction: column;
  margin: 10px 20px 20px 20px;
  box-shadow: 0 1px 2px 0 var(--shadow-color);
  transition: all 0.3s;
  margin-top: 20px;
  &:hover {
    box-shadow: 0 3px 6px var(--shadow-color);
  }
}

.application-header {
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
  padding: 24px;
  overflow: auto;
}

.table-wrapper {
  width: 100%;
  overflow: auto;
}

.custom-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  
  th, td {
    padding: 12px;
    text-align: center;
    border-bottom: 1px solid var(--border-color);
    color: var(--text-color);
    transition: background-color 0.3s;
  }

  th {
    background-color: var(--hover-color);
    font-weight: 500;
    white-space: nowrap;
  }

  td {
    font-size: 14px;
  }

  tbody tr {
    &:hover {
      background-color: var(--hover-color);
    }
  }
}

.description-cell {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
}

.empty-cell {
  padding: 32px !important;
  color: var(--text-color-secondary) !important;
}

.operation-column {
  display: flex;
  justify-content: center;
  gap: 8px;

  .el-button {
    padding: 4px;
    min-height: auto;
  }
}

.delete-btn {
  color: #ff4d4f;

  &:hover {
    color: #ff7875;
  }
}

.status-tag {
  min-width: 48px;
}
</style> 