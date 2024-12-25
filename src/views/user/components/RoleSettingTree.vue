<template>
  <div class="role-settings">
    <div class="role-group" v-for="app in roleList" :key="app.appId">
      <div class="app-header">
        <label class="checkbox-wrapper">
          <input 
            type="checkbox" 
            :checked="isAppAllChecked(app)"
            :indeterminate="isAppIndeterminate(app)"
            @change="handleAppCheck($event, app)"
          >
          <span class="app-name">{{ app.appName }}</span>
        </label>
      </div>
      <div class="role-items">
        <div v-for="role in app.children" :key="role.id" class="role-item">
          <label class="checkbox-wrapper">
            <input 
              type="checkbox" 
              :checked="isRoleChecked(role.id)"
              @change="handleRoleCheck($event, role)"
            >
            <span class="role-name">{{ role.roleName }}</span>
            <span class="role-remark" v-if="role.remark">({{ role.remark }})</span>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  roleList: {
    type: Array,
    required: true
  },
  checkedRoles: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['update:checkedRoles'])

const isRoleChecked = (id) => {
  return props.checkedRoles.includes(id)
}

const isAppAllChecked = (app) => {
  if (!app.children?.length) return false
  return app.children.every(role => isRoleChecked(role.id))
}

const isAppIndeterminate = (app) => {
  if (!app.children?.length) return false
  const checkedCount = app.children.filter(role => isRoleChecked(role.id)).length
  return checkedCount > 0 && checkedCount < app.children.length
}

const handleRoleCheck = (event, role) => {
  const checked = event.target.checked
  const newCheckedRoles = [...props.checkedRoles]
  
  if (checked) {
    if (!newCheckedRoles.includes(role.id)) {
      newCheckedRoles.push(role.id)
    }
  } else {
    const index = newCheckedRoles.indexOf(role.id)
    if (index > -1) {
      newCheckedRoles.splice(index, 1)
    }
  }
  
  emit('update:checkedRoles', newCheckedRoles)
}

const handleAppCheck = (event, app) => {
  const checked = event.target.checked
  const newCheckedRoles = [...props.checkedRoles]
  
  if (app.children) {
    app.children.forEach(role => {
      const roleIndex = newCheckedRoles.indexOf(role.id)
      if (checked) {
        if (roleIndex === -1) {
          newCheckedRoles.push(role.id)
        }
      } else {
        if (roleIndex > -1) {
          newCheckedRoles.splice(roleIndex, 1)
        }
      }
    })
  }
  
  emit('update:checkedRoles', newCheckedRoles)
}
</script>

<style scoped>
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

.app-header {
  margin-bottom: 12px;
  padding: 0 8px;
}

.app-name {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-color);
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
  max-width: 200px;

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
  /* flex: 1; */
  /* overflow: hidden; */
  text-overflow: ellipsis;
  /* white-space: nowrap; */
}

.role-remark {
  font-size: 12px;
  color: var(--text-color-secondary);
}
</style> 