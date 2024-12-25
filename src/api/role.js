import request  from '@/utils/request'

export function getRoleList(params) {
  return request({
    url: `/uias/roles`,
    method: 'get',
    params
  })
}

export function createRole(data) {
  return request({
    url: `/uias/roles`,
    method: 'post',
    data
  })
}

export function updateRole(data) {
  return request({
    url: `/uias/roles`,
    method: 'put',
    data
  })
}

export function deleteRole(id) {
  return request({
    url: `/uias/roles/${id}`,
    method: 'delete'
  })
}

export function getRolePermissions(roleId) {
  return request({
    url: `/uias/roles/${roleId}/permissions`,
    method: 'get'
  })
}

export function updateRolePermissions(roleId, permissions) {
  return request({
    url: `/uias/roles/${roleId}/permissions`,
    method: 'put',
    data: { permissions }
  })
} 