<template>
  <el-dialog
    title="移动资源"
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
import { getResourceList, moveResources } from '@/api/resource'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  sourceData: {
    type: Array,
    required: true
  },
  currentAppId: {
    type: [String, Number],
    required: true
  }
})

const emit = defineEmits(['update:visible', 'success'])

const dialogVisible = ref(props.visible)
const loading = ref(false)
const formRef = ref(null)
const resourceTreeData = ref([])
const expandedKeys = ref([])

// 表单数据
const formData = reactive({
  resourceIds: [],
  targetParentId: null
})

// 表单校验规则
const rules = {
  targetParentId: [
    { required: false, message: '请选择上级资源', trigger: 'change' }
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

// 获取当前应用的资源树
const fetchResourceTree = async () => {
  try {
    const res = await getResourceList({ appId: props.currentAppId })
    // 过滤掉要移动的资源及其子节点
    resourceTreeData.value = filterSourceNodes(res.data, formData.resourceIds)
    expandedKeys.value = getExpandedKeys(resourceTreeData.value)
  } catch (error) {
    console.error('获取资源树失败:', error)
  }
}

// 过滤掉源节点及其子节点
const filterSourceNodes = (data, sourceIds) => {
  return data.filter(node => {
    if (sourceIds.includes(node.id)) {
      return false
    }
    if (node.children && node.children.length > 0) {
      node.children = filterSourceNodes(node.children, sourceIds)
    }
    return true
  })
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

// 监听visible变化
watch(
  () => props.visible,
  (val) => {
    dialogVisible.value = val
    if (val) {
      formData.resourceIds = props.sourceData.map(item => item.id)
      fetchResourceTree()
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
    await moveResources({
      resourceIds: formData.resourceIds,
      targetAppId: props.currentAppId,
      targetParentId: formData.targetParentId
    })
    ElMessage.success('移动成功')
    dialogVisible.value = false
    emit('success')
  } catch (error) {
    console.error('移动失败:', error)
    ElMessage.error('移动失败，请重试')
  } finally {
    loading.value = false
  }
}

// 关闭时重置表单
const handleClosed = () => {
  formRef.value?.resetFields()
  Object.assign(formData, {
    resourceIds: [],
    targetParentId: null
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