import { ElMessageBox } from 'element-plus'

export const showMessage = (message, type = 'success') => {
  const messageDiv = document.createElement('div')
  messageDiv.className = `message message-${type}`
  messageDiv.textContent = message
  document.body.appendChild(messageDiv)
  
  setTimeout(() => {
    messageDiv.classList.add('message-fade-out')
    setTimeout(() => {
      document.body.removeChild(messageDiv)
    }, 300)
  }, 2000)
}

export const showConfirm = (message, title = '提示', type = 'warning') => {
  const isDark = document.documentElement.classList.contains('dark')
  
  return ElMessageBox.confirm(
    message,
    title,
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type,
      customClass: isDark ? 'dark-message-box' : '',
    }
  )
}

// 添加全局样式
const style = document.createElement('style')
style.textContent = `
.dark-message-box {
  background-color: var(--bg-color) !important;
  border-color: var(--border-color) !important;
}

.dark-message-box .el-message-box__title {
  color: var(--text-color) !important;
}

.dark-message-box .el-message-box__content {
  color: var(--text-color) !important;
}

.dark-message-box .el-message-box__container i {
  color: var(--text-color) !important;
}

.dark-message-box .el-button {
  background-color: var(--bg-color) !important;
  border-color: var(--border-color) !important;
  color: var(--text-color) !important;
}

.dark-message-box .el-button:hover {
  background-color: var(--hover-color) !important;
  border-color: var(--primary-color) !important;
}

.dark-message-box .el-button--primary {
  background-color: var(--primary-color) !important;
  border-color: var(--primary-color) !important;
  color: #fff !important;
}

.dark-message-box .el-button--primary:hover {
  opacity: 0.85;
}

.dark-message-box .el-overlay {
  background-color: rgba(0, 0, 0, 0.7) !important;
}

.message {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 20px;
  border-radius: 4px;
  color: #fff;
  font-size: 14px;
  z-index: 2001;
  transition: opacity 0.3s;
}

.message-success {
  background-color: #52c41a;
}

.message-error {
  background-color: #ff4d4f;
}

.message-fade-out {
  opacity: 0;
}
`
document.head.appendChild(style) 