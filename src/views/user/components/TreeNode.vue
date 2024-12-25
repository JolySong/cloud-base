<template>
  <div class="tree-node">
    <div class="node-content">
      <div class="node-row" :style="{ paddingLeft: level * 24 + 'px' }">
        <span 
          v-if="hasChildren"
          class="expand-icon"
          @click="$emit('toggle', node)"
        >
          {{ expanded ? '▼' : '▶' }}
        </span>
        <span v-else class="expand-placeholder"></span>
        <label class="checkbox-wrapper">
          <input 
            type="checkbox" 
            :checked="checked"
            @change="$emit('check', $event, node)"
          >
          <span :class="['resource-tag', 'tag-' + getResourceTypeClass(node.type)]">
            {{ getResourceTypeLabel(node.type) }}
          </span>
          <span class="node-label">{{ node.name }}</span>
        </label>
      </div>
    </div>
    
    <div v-if="hasChildren && expanded" class="node-children">
      <TreeNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :checked="isChecked(child.id)"
        :expanded="isExpanded(child.id)"
        :level="level + 1"
        :is-checked="isChecked"
        :is-expanded="isExpanded"
        :get-resource-type-label="getResourceTypeLabel"
        :get-resource-type-class="getResourceTypeClass"
        @check="$emit('check', $event, child)"
        @toggle="$emit('toggle', child)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  node: {
    type: Object,
    required: true
  },
  checked: {
    type: Boolean,
    default: false
  },
  expanded: {
    type: Boolean,
    default: false
  },
  level: {
    type: Number,
    default: 0
  },
  isChecked: {
    type: Function,
    required: true
  },
  isExpanded: {
    type: Function,
    required: true
  },
  getResourceTypeLabel: {
    type: Function,
    required: true
  },
  getResourceTypeClass: {
    type: Function,
    required: true
  }
})

defineEmits(['check', 'toggle'])

const hasChildren = computed(() => props.node.children && props.node.children.length > 0)
</script>

<style scoped>
.tree-node {
  margin-bottom: 4px;
}

.node-content {
  padding: 8px 0;
  border-radius: 4px;
  transition: all 0.2s;
}

.node-content:hover {
  background-color: var(--hover-color);
}

.node-children {
  margin-left: 24px;
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
}

.expand-icon:hover {
  color: var(--text-color);
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

.resource-path {
  color: var(--text-color-secondary);
  font-size: 13px;
  margin-left: 8px;
}
</style> 