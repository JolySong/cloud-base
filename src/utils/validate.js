// 手机号验证
export const isValidPhone = (phone) => {
  const reg = /^1[3-9]\d{9}$/
  return reg.test(phone)
}

// 邮箱验证
export const isValidEmail = (email) => {
  const reg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return reg.test(email)
}

// 密码强度验证（至少8位，包含大小写字母和数字）
export const isValidPassword = (password) => {
  const reg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/
  return reg.test(password)
}

// URL验证
export const isValidURL = (url) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
} 