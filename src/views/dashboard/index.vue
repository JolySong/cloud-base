<template>
  <div class="dashboard-container">
    <div class="card-list">
      <div class="card">
        <div class="card-content">
          <div class="card-title">应用总数</div>
          <div class="card-value">12</div>
        </div>
        <div class="card-icon">
          <el-icon :size="48"><Monitor /></el-icon>
        </div>
      </div>
      <div class="card">
        <div class="card-content">
          <div class="card-title">资源总数</div>
          <div class="card-value">256</div>
        </div>
        <div class="card-icon">
          <el-icon :size="48"><Menu /></el-icon>
        </div>
      </div>
      <div class="card">
        <div class="card-content">
          <div class="card-title">角色总数</div>
          <div class="card-value">8</div>
        </div>
        <div class="card-icon">
          <el-icon :size="48"><UserFilled /></el-icon>
        </div>
      </div>
      <div class="card">
        <div class="card-content">
          <div class="card-title">用户总数</div>
          <div class="card-value">128</div>
        </div>
        <div class="card-icon">
          <el-icon :size="48"><User /></el-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Monitor, Menu, UserFilled, User } from '@element-plus/icons-vue'
</script>

<style scoped>
@import '@/styles/variables.css';

.dashboard-container {
  padding: 20px;
}

.card-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.card {
  background-color: var(--bg-color);
  border-radius: 8px;
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 2px 0 var(--shadow-color);
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 3px 6px var(--shadow-color);
    transform: translateY(-2px);
  }
}

.card-content {
  flex: 1;
}

.card-title {
  font-size: 14px;
  color: var(--text-color-secondary);
  margin-bottom: 8px;
}

.card-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-color);
}

.card-icon {
  margin-left: 24px;
  color: var(--primary-color);
  opacity: 0.8;
}
</style> 