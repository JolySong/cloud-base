<template>
  <el-breadcrumb class="app-breadcrumb">
    <el-breadcrumb-item :to="{ path: '/uias/dashboard' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="index" :to="item.path">
      {{ item.meta?.title || item.name }}
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const breadcrumbs = ref([])

const getBreadcrumbs = () => {
  const matched = route.matched.filter(item => item.meta && item.meta.title)
  breadcrumbs.value = matched
}

watch(() => route.path, getBreadcrumbs, { immediate: true })
</script>

<style scoped>
.app-breadcrumb {
  display: inline-block;
  font-size: 14px;
  line-height: 50px;
  margin-left: 8px;
}

:deep(.el-breadcrumb__inner) {
  color: #666;
  
  &.is-link {
    color: #333;
    font-weight: normal;
    
    &:hover {
      color: #1890ff;
    }
  }
}

:deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
  color: #999;
}

:deep(.el-breadcrumb__separator) {
  margin: 0 8px;
  color: #666;
}
</style> 