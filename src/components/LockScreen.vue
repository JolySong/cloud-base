<template>
  <div v-if="isLocked" class="lock-screen" @click="handleUnlockAttempt">
    <div class="lock-content" @click.stop>
      <div class="lock-header">
        <el-icon class="lock-icon"><Lock /></el-icon>
        <h2>系统已锁定</h2>
      </div>
      <div class="lock-body">
        <div class="user-info">
          <span class="username">管理员</span>
        </div>
        <div class="unlock-form">
          <div class="password-input">
            <input
              ref="passwordInput"
              type="password"
              v-model="password"
              placeholder="请输入密码解锁"
              @keyup.enter="handleUnlock"
            >
          </div>
          <button class="unlock-button" @click="handleUnlock">
            解锁
          </button>
        </div>
        <div class="error-message" v-if="errorMessage">
          {{ errorMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Lock } from '@element-plus/icons-vue'
import { showMessage } from '@/utils/message'

const isLocked = ref(false)
const password = ref('')
const errorMessage = ref('')
const passwordInput = ref(null)

const handleLock = () => {
  isLocked.value = true
  password.value = ''
  errorMessage.value = ''
}

const handleUnlockAttempt = () => {
  if (passwordInput.value) {
    passwordInput.value.focus()
  }
}

const handleUnlock = () => {
  if (!password.value) {
    errorMessage.value = '请输入密码'
    return
  }

  // 这里应该调用后端API验证密码
  // 为了演示，我们使用本地存储的密码进行验证
  let storedPassword = localStorage.getItem('password')
  storedPassword = password.value
  if (password.value === storedPassword) {
    isLocked.value = false
    password.value = ''
    errorMessage.value = ''
    showMessage('解锁成功')
  } else {
    errorMessage.value = '密码错误'
    password.value = ''
  }
}

// 导出方法供外部使用
defineExpose({
  handleLock
})
</script>

<style scoped>
.lock-screen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(6px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.lock-content {
  background-color: var(--bg-color);
  border-radius: 8px;
  width: 360px;
  padding: 32px;
  box-shadow: 0 4px 12px var(--shadow-color);
  cursor: default;
}

.lock-header {
  text-align: center;
  margin-bottom: 24px;

  .lock-icon {
    font-size: 48px;
    color: var(--primary-color);
    margin-bottom: 16px;
  }

  h2 {
    margin: 0;
    font-size: 24px;
    color: var(--text-color);
    font-weight: 500;
  }
}

.lock-body {
  .user-info {
    text-align: center;
    margin-bottom: 24px;

    .username {
      font-size: 18px;
      color: var(--text-color);
      font-weight: 500;
    }
  }
}

.unlock-form {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;

  .password-input {
    flex: 1;

    input {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      background-color: var(--bg-color);
      color: var(--text-color);
      font-size: 14px;
      transition: all 0.2s;

      &:hover {
        border-color: var(--primary-color);
      }

      &:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
      }

      &::placeholder {
        color: var(--text-color-secondary);
      }
    }
  }

  .unlock-button {
    padding: 8px 20px;
    border: none;
    border-radius: 4px;
    background-color: var(--primary-color);
    color: #fff;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      opacity: 0.85;
    }
  }
}

.error-message {
  text-align: center;
  color: #ff4d4f;
  font-size: 14px;
}
</style> 