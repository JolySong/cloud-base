<template>
  <div class="config-container">
    <div class="config-header">
      <h1>系统配置</h1>
      <button class="btn btn-primary" @click="handleAdd">新增配置</button>
    </div>
    
    <div class="table-container">
      <div class="table-wrapper" v-loading="loading">
        <table class="custom-table">
          <thead>
            <tr>
              <th>配置名称</th>
              <th>配置键名</th>
              <th>配置值</th>
              <th width="100">系统内置</th>
              <th>备注</th>
              <th width="150">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in configList" :key="row.id">
              <td>{{ row.configName }}</td>
              <td>
                <span class="config-value">{{ row.configKey }}</span>
              </td>
              <td>
                <span class="config-value">{{ row.configValue }}</span>
              </td>
              <td>
                <span :class="['status-tag', row.isSystem ? 'status-danger' : 'status-info']">
                  {{ row.isSystem ? '是' : '否' }}
                </span>
              </td>
              <td class="description-cell" :title="row.remark">{{ row.remark }}</td>
              <td>
                <div class="operation-column">
                  <button class="btn-text" @click="handleEdit(row)">编辑</button>
                  <button 
                    class="btn-text btn-danger" 
                    @click="handleDelete(row)"
                    :disabled="row.isSystem"
                  >
                    删除
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!configList.length">
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

    <!-- 配置表单组件 -->
    <config-form
      v-model:visible="formVisible"
      :data="currentRow"
      @success="handleSuccess"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getConfigList, deleteConfig } from '@/api/config'
import { showMessage, showConfirm } from '@/utils/message'
import ConfigForm from './components/ConfigForm.vue'

const loading = ref(false)
const configList = ref([])
const total = ref(0)

// 查询参数
const queryParams = reactive({
  page: 1,
  size: 10
})

// 表单相关
const formVisible = ref(false)
const currentRow = ref({})

// 获取配置列表
const fetchData = async () => {
  loading.value = true
  try {
    const res = await getConfigList(queryParams)
    configList.value = res.data.records
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
    '确认删除该配置吗？',
    '警告'
  ).then(async () => {
    try {
      await deleteConfig(row.id)
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

.config-container {
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

.config-header {
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

.status-danger {
  background-color: rgba(255, 77, 79, 0.1);
  color: #ff4d4f;
}

.status-info {
  background-color: rgba(144, 147, 153, 0.1);
  color: #909399;
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
}

.pagination-container {
  padding: 16px 24px;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
}

.config-value {
  font-family: Consolas, Monaco, monospace;
  color: var(--text-color-secondary);
  padding: 2px 6px;
  background-color: var(--hover-color);
  border-radius: 4px;
  max-width: 300px;
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
</style> 