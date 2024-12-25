<template>
  <div class="permission-settings">
    <!-- 权限树 -->
    <div class="permission-tree">
        <TreeNode
        v-for="resource in permissionList"
        :key="resource.resourceId"
        :node="mapResourceToNode(resource)"
        :checked="isChecked(resource.resourceId)"
        :expanded="isExpanded(resource.resourceId)"
        :level="0"
        :is-checked="isChecked"
        :is-expanded="isExpanded"
        :get-resource-type-label="getResourceTypeLabel"
        :get-resource-type-class="getResourceTypeClass"
        @check="handlePermissionCheck($event, resource)"
        @toggle="toggleExpand"
      />
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import TreeNode from './TreeNode.vue'

const props = defineProps({
  permissionList: {
    type: Array,
    required: true
  },
  checkedPermissions: {
    type: Array,
    required: true
  },
  expandedKeys: {
    type: Set,
    required: true
  }
})

const emit = defineEmits(['update:checkedPermissions', 'update:expandedKeys'])

// 资源类型配置
const resourceTypes = {
  M: { label: '目录', type: 'primary' },
  C: { label: '菜单', type: 'success' },
  F: { label: '按钮', type: 'warning' },
  A: { label: '接口', type: 'info' }
}

const getResourceTypeLabel = (type) => resourceTypes[type]?.label || type
const getResourceTypeClass = (type) => resourceTypes[type]?.type || 'default'

// 将资源对象映射为TreeNode需要格式
const mapResourceToNode = (resource) => ({
  id: resource.resourceId,
  name: resource.resourceName,
  type: resource.resourceType,
  path: resource.resourcePath,
  resourceId: resource.resourceId,
  children: resource.children ? resource.children.map(child => mapResourceToNode(child)) : null
})

// 检查权限是否被选中
const isChecked = (id) => {
  return props.checkedPermissions.includes(id)
}

// 检查是否展开
const isExpanded = (id) => {
  return props.expandedKeys.has(id)
}

// 切换展开状态
const toggleExpand = (node) => {
  const newExpandedKeys = new Set(props.expandedKeys)
  if (newExpandedKeys.has(node.id)) {
    newExpandedKeys.delete(node.id)
  } else {
    newExpandedKeys.add(node.id)
  }
  emit('update:expandedKeys', newExpandedKeys)
}

// 获取所有子节点的ID
const getAllChildIds = (node) => {
  const ids = [Number(node.resourceId)]
  if (node.children) {
    node.children.forEach(child => {
      ids.push(...getAllChildIds(child))
    })
  }
  return ids
}

const handlePermissionCheck = (event, resource) => {
  const checked = event.target.checked
  const newCheckedPermissions = [...props.checkedPermissions]
  
  const ids = getAllChildIds(mapResourceToNode(resource))
  ids.forEach(id => {
    const index = newCheckedPermissions.indexOf(id)
    if (checked && index === -1) {
      newCheckedPermissions.push(id)
    } else if (!checked && index > -1) {
      newCheckedPermissions.splice(index, 1)
    }
  })
  
  emit('update:checkedPermissions', newCheckedPermissions)
}
</script>

<style scoped>
.permission-settings {
  padding: 10px;
}



.permission-tree {
  padding-left: 10px;
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
</style> 