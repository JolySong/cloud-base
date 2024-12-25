<script setup>
</script>

<template>
  <router-view />
</template>

<style>
@import '@/styles/variables.css';

html, body {
  margin: 0;
  padding: 0;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  background-color: var(--bg-color);
  color: var(--text-color);
}

#app {
  height: 100vh;
  width: 100%;
  overflow: auto;
  background-color: var(--bg-color);
  color: var(--text-color);
}

/* 重置一些基础样式 */
* {
  margin: 0;
  padding: 0;
}

/* 滚动条样式优化 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-thumb {
  background: var(--text-color-secondary);
  border-radius: 3px;
}

::-webkit-scrollbar-track {
  background: var(--hover-color);
}

/* Element Plus 暗色模式适配 */
html.dark {
  --el-bg-color: var(--bg-color);
  --el-bg-color-overlay: var(--bg-color);
  --el-text-color-primary: var(--text-color);
  --el-text-color-regular: var(--text-color);
  --el-border-color: var(--border-color);
  --el-border-color-light: var(--border-color);
  --el-fill-color-blank: var(--bg-color);
  --el-fill-color: var(--hover-color);
  --el-mask-color: rgba(0, 0, 0, 0.5);
}
</style>
