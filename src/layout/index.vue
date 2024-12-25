<template>
  <div class="app-wrapper">
    <!-- 侧边栏 -->
    <div class="sidebar-container" :class="{ 'is-collapse': isCollapse }">
      <div class="logo-container">
        <!-- <img src="path/to/logo.png" alt="Logo" class="logo" /> -->
        <span v-if="!isCollapse" class="title">统一身份认证</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        background-color="#fff"
        text-color="#333"
        active-text-color="#1890ff"
        :collapse="isCollapse"
        mode="vertical"
        :unique-opened="true"
        router
      >
        <sidebar-item v-for="route in routes" :key="route.path" :item="route" :base-path="route.path" :is-first-level="true"/>
      </el-menu>
    </div>
    <!-- 顶部导航栏 -->
    <div class="navbar" :class="{ 'is-collapse': isCollapse }">
      <div class="left-menu">
        <div class="hamburger" @click="toggleSideBar">
            <el-icon :size="20">
              <component :is="isCollapse ? 'Expand' : 'Fold'" />
            </el-icon>
          </div>
          <Breadcrumb />
        </div>
        <div class="right-menu">
          <el-space>
            <el-button link @click="toggleTheme">
              <el-icon><component :is="isDark ? 'Sunny' : 'Moon'" /></el-icon>
            </el-button>
            <el-button link @click="handleLock">
              <el-icon><Lock /></el-icon>
              锁屏
            </el-button>
            <el-dropdown trigger="click">
              <span class="el-dropdown-link">
                <span class="username">管理员</span>
                <el-icon class="el-icon--right">
                  <arrow-down />
                </el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </el-space>
        </div>
    </div>
    <!-- 主要内容区 -->
    <div class="main-container" :class="{ 'is-collapse': isCollapse }">
      <!-- 内容区 -->
      <div class="app-main">
        <router-view v-slot="{ Component }">
          <transition name="fade-transform" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </div>
  </div>
  <!-- 底部 -->
  <div class="footer">
    <span>© 2023 统一身份认证. 版权所有.</span>
  </div>
  <!-- 锁屏组件 -->
  <LockScreen ref="lockScreenRef" />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import SidebarItem from './components/SidebarItem.vue'
import Breadcrumb from './components/Breadcrumb.vue'
import LockScreen from '@/components/LockScreen.vue'
import { Lock, Search, Bell, Setting, ArrowDown, Moon, Sunny } from '@element-plus/icons-vue'
import { removeToken } from '@/utils/storage'
const router = useRouter()
const route = useRoute()
const lockScreenRef = ref(null)

const isCollapse = ref(false)
const isDark = ref(document.documentElement.classList.contains('dark'))
const routes = computed(() => router.options.routes)
const activeMenu = computed(() => route.path)

const toggleSideBar = () => {
  isCollapse.value = !isCollapse.value
}

const toggleTheme = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark')
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

const handleLock = () => {
  if (lockScreenRef.value) {
    lockScreenRef.value.handleLock()
  }
}

const handleLogout = () => {
  removeToken()
  router.push('/login')
}

// Initialize theme from localStorage
onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark' && !isDark.value) {
    toggleTheme()
  }
})
</script>

<style scoped>
@import '@/styles/variables.css';

.app-wrapper {
  display: flex;
  width: 100%;
  position: relative;
}

.navbar {
  position: fixed;
  top: 0;
  right: 0;
  left: 210px;
  height: 50px;
  background: var(--bg-color);
  box-shadow: 0 1px 4px var(--shadow-color);
  display: flex;
  justify-content: space-between;
  padding: 0 20px;
  align-items: center;
  z-index: 1000;
  transition: left 0.28s;

  &.is-collapse {
    left: 64px;
  }
}

.sidebar-container {
  background-color: var(--bg-color);
  transition: width 0.28s;
  width: 210px;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 1001;
  overflow: hidden;
  box-shadow: 0 1px 4px var(--shadow-color);

  .logo-container {
    height: 50px;
    padding: 10px 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--bg-color);
    border-bottom: 1px solid var(--border-color);

    .logo {
      width: 32px;
      height: 32px;
      margin-right: 12px;
    }

    .title {
      color: var(--text-color);
      font-size: 16px;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
    }
  }

  .el-menu {
    height: calc(100% - 50px);
    border-right: none;
  }
}

.main-container {
  margin-top: 25px;
  margin-left: 180px;
  width: calc(100% - 210px);
  height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
  background-color: var(--bg-color-secondary);
  transition: margin-left 0.28s, width 0.28s;
  padding-top: 10px;

  .app-main {
    flex: 1;
    background-color: var(--bg-color-secondary);
    padding: 15px 0px 15px 0px;
    margin-bottom: 20px;
  }

  &.is-collapse {
    margin-left: 64px;
    width: calc(100% - 64px);
  }
}

.footer {
  height: 40px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-color);
  color: var(--text-color-secondary);
  font-size: 14px;
  border-top: 1px solid var(--border-color);
  margin-top: auto;
}

:deep(.el-menu) {
  background-color: var(--bg-color) !important;
}

:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
  height: 50px;
  line-height: 50px;
  color: var(--text-color);
  
  &:hover {
    background-color: var(--hover-color);
  }
}

:deep(.el-menu-item.is-active) {
  background-color: var(--active-bg);
  color: var(--primary-color);
  border-right: 3px solid var(--primary-color);
}

:deep(.el-menu--collapse) {
  width: 64px;
}

.sidebar-container.is-collapse {
  width: 64px;
}

.left-menu {
  display: flex;
  align-items: center;

  .hamburger {
    cursor: pointer;
    font-size: 20px;
    color: var(--text-color);
    padding: 0 8px;
  }
}

.right-menu {
  display: flex;
  align-items: center;
}

.el-dropdown-link {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.username {
  margin: 0 8px;
  color: var(--text-color);
}

.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.5s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style> 