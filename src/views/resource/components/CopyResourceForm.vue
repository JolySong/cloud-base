<template>
  <el-dialog
    title="复制资源"
    v-model="dialogVisible"
    width="500px"
    :close-on-click-modal="false"
    @closed="handleClosed"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
      label-position="right"
    >
      <el-form-item label="目标系统" prop="targetAppId">
        <el-select 
          v-model="formData.targetAppId" 
          placeholder="请选择目标系统"
          filterable
        >
          <el-option
            v-for="app in applicationList"
            :key="app.id"
            :label="app.appName"
            :value="app.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="上级资源" prop="targetParentId">
        <el-tree-select
          v-model="formData.targetParentId"
          :data="resourceTreeData"
          :props="{
            label: 'resourceName',
            children: 'children',
            value: 'id'
          }"
          placeholder="请选择上级资源"
          clearable
          check-strictly
          :render-after-expand="false"
          value-key="id"
          :default-expanded-keys="expandedKeys"
        >
          <template #default="{ node, data }">
            <span>
              <el-tag size="small" :type="getResourceTypeTag(data.resourceType)" class="mr-1">
                {{ getResourceTypeLabel(data.resourceType) }}
              </el-tag>
              {{ node.label }}
            </span>
          </template>
        </el-tree-select>
      </el-form-item>

      <el-form-item label="包含子级" prop="includeChildren">
        <el-switch v-model="formData.includeChildren" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getResourceList, copyResource } from '@/api/resource'
import { getApplicationList } from '@/api/application'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  sourceData: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:visible', 'success'])

const dialogVisible = ref(props.visible)
const loading = ref(false)
const formRef = ref(null)
const applicationList = ref([])
const resourceTreeData = ref([])
const expandedKeys = ref([])

// 表单数据
const formData = reactive({
  sourceId: '',
  targetAppId: '',
  targetParentId: null,
  includeChildren: true
})

// 表单校验规则
const rules = {
  targetAppId: [
    { required: true, message: '请选择目标系统', trigger: 'change' }
  ]
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
  return resourceTypes[type]?.type || ''
}

// 获取应用列表
const fetchApplicationList = async () => {
  try {
    const res = await getApplicationList()
    // 过滤掉当前应用
    applicationList.value = res.data.filter(app => app.id !== props.sourceData.appId)
  } catch (error) {
    console.error('获取应用列表失败:', error)
  }
}

// 获取目标应用的资源树
const fetchResourceTree = async (appId) => {
  if (!appId) {
    resourceTreeData.value = []
    return
  }
  
  try {
    const res = await getResourceList({ appId })
    resourceTreeData.value = res.data
    expandedKeys.value = getExpandedKeys(res.data)
  } catch (error) {
    console.error('获取资源树失败:', error)
  }
}

// 获取需要展开的节点key
const getExpandedKeys = (data) => {
  const keys = []
  const traverse = (nodes) => {
    nodes.forEach(node => {
      if (node.children && node.children.length > 0) {
        keys.push(node.id)
        traverse(node.children)
      }
    })
  }
  traverse(data)
  return keys
}

// 监听目标系统变化
watch(
  () => formData.targetAppId,
  (val) => {
    formData.targetParentId = null
    if (val) {
      fetchResourceTree(val)
    } else {
      resourceTreeData.value = []
      expandedKeys.value = []
    }
  }
)

// 监听visible变化
watch(
  () => props.visible,
  (val) => {
    dialogVisible.value = val
    if (val) {
      formData.sourceId = props.sourceData.id
      fetchApplicationList()
    }
  }
)

// 监听dialogVisible变化
watch(
  () => dialogVisible.value,
  (val) => {
    emit('update:visible', val)
  }
)

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate()
  
  loading.value = true
  try {
    await copyResource({
      sourceId: formData.sourceId,
      targetAppId: formData.targetAppId,
      targetParentId: formData.targetParentId,
      includeChildren: formData.includeChildren
    })
    ElMessage.success('复制成功')
    dialogVisible.value = false
    emit('success')
  } catch (error) {
    console.error('复制失败:', error)
    ElMessage.error('复制失败，请重试')
  } finally {
    loading.value = false
  }
}

// 关闭时重置表单
const handleClosed = () => {
  formRef.value?.resetFields()
  Object.assign(formData, {
    sourceId: '',
    targetAppId: '',
    targetParentId: null,
    includeChildren: true
  })
  resourceTreeData.value = []
  expandedKeys.value = []
}
</script>

<style scoped>
.dialog-footer {
  padding-top: 20px;
  text-align: right;
}

.mr-1 {
  margin-right: 4px;
}
</style> 