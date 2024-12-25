import request  from '@/utils/request'

export function getUserList(params) {
  return request({
    url: `/uias/users/page`,
    method: 'get',
    params
  })
}

export function createUser(data) {
  return request({
    url: `/uias/users`,
    method: 'post',
    data
  })
}

export function updateUser(data) {
  return request({
    url: `/uias/users`,
    method: 'put',
    data
  })
}

export function deleteUser(id) {
  return request({
    url: `/uias/users/${id}`,
    method: 'delete'
  })
}

export function updateUserStatus(id) {
  return request({
    url: `/uias/users/${id}/status`,
    method: 'put'
  })
}

export function resetUserPassword(id, password) {
  return request({
    url: `/uias/users/${id}/password`,
    method: 'put',
    data: { password }
  })
} 

export function getRoleGroupBySystem() {
  return request({
    url: `/uias/roles/all`,
    method: 'get'
  })
}

export function getSelectedRoles(userId) {
  return request({
    url: `/uias/roles/selectedRoles/${userId}`,
    method: 'get'
  })
}
export function updateUserRoles(userId, roleIds) {
  return request({
    url: `/uias/users/roles`,
    method: 'put',
    data: {
      id: userId,
      roleIds: roleIds
    }
  })
}

export function getUserPermissions(userId, roleId) {
  return request({
    url: `/uias/users/permissions`,
    method: 'get',
    params: { 
      userId,
      roleId 
    }
  })
}

export function updateUserPermissions(userId, roleId, appId, permissions) {
  return request({
    url: `/uias/users/permissions`,
    method: 'put',
    data: {
      userId,
      roleId,
      appId,
      selectedPermissions: permissions
    }
  })
}

export function getUserRoleList(userId) {
  return request({
    url: `/uias/users/${userId}/roles`,
    method: 'get'
  })
}