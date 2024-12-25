<template>
  <div class="not-found">
    <div class="content">
      <h1>404</h1>
      <h2>抱歉，页面不存在</h2>
      <el-button type="primary" @click="goHome">返回首页</el-button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
.not-found {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f2f5;
}

.content {
  text-align: center;
}

h1 {
  font-size: 120px;
  color: #1890ff;
  margin: 0;
}

h2 {
  font-size: 24px;
  color: #666;
  margin: 20px 0;
}
</style> 