import request  from '@/utils/request'

export function getConfigList(params) {
  return request({
    url: `/uias/configs/page`,
    method: 'get',
    params
  })
}

export function createConfig(data) {
  return request({
    url: `/uias/configs`,
    method: 'post',
    data
  })
}

export function updateConfig(data) {
  return request({
    url: `/uias/configs`,
    method: 'put',
    data
  })
}

export function deleteConfig(id) {
  return request({
    url: `/uias/configs/${id}`,
    method: 'delete'
  })
} 