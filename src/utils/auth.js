// Token 相关操作
export const getToken = () => {
  return localStorage.getItem('token')
}

export const setToken = (token) => {
  localStorage.setItem('token', token)
}

export const removeToken = () => {
  localStorage.removeItem('token')
}

// 权限检查
export const hasPermission = (permission) => {
  const userPermissions = JSON.parse(localStorage.getItem('permissions') || '[]')
  return userPermissions.includes(permission)
}

// 角色检查
export const hasRole = (role) => {
  const userRoles = JSON.parse(localStorage.getItem('roles') || '[]')
  return userRoles.includes(role)
} 