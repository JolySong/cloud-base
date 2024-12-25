import request  from '@/utils/request'

export function getResourceList(params) {
  return request({
    url: `/uias/resources`,
    method: 'get',
    params
  })
}

export function createResource(data) {
  return request({
    url: `/uias/resources`,
    method: 'post',
    data
  })
}

export function updateResource(data) {
  return request({
    url: `/uias/resources`,
    method: 'put',
    data
  })
}

export function copyResource(data) {
  return request({
    url: `/uias/resources/copy`,
    method: 'post',
    data
  })
}

export function deleteResource(id) {
  return request({
    url: `/uias/resources/${id}`,
    method: 'delete'
  })
}

export function batchDeleteResources(ids) {
  return request({
    url: `/uias/resources/batch`,
    method: 'delete',
    data: { resourceIds: ids }
  })
}

export function moveResources(data) {
  return request({
    url: `/uias/resources/move`,
    method: 'post',
    data
  })
} 