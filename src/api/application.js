import request  from '@/utils/request'


export function getApplicationList(params) {
  return request({
    url: `/uias/applications`,
    method: 'get',
    params
  })
}

export function createApplication(data) {
  return request({
    url: `/uias/applications`,
    method: 'post',
    data
  })
}

export function updateApplication(data) {
  return request({
    url: `/uias/applications`,
    method: 'put',
    data
  })
}

export function deleteApplication(id) {
  return request({
    url: `/uias/applications/${id}`,
    method: 'delete'
  })
} 