import request from '@/utils/request'

// 查询人才库列表
export function listCandidate(query) {
  return request({
    url: '/system/talent/candidate/list',
    method: 'get',
    params: query
  })
}

// 查询人才库详细
export function getCandidate(id) {
  return request({
    url: '/system/talent/candidate/' + id,
    method: 'get'
  })
}

// 新增人才库
export function addCandidate(data) {
  return request({
    url: '/system/talent/candidate',
    method: 'post',
    data: data
  })
}

// 修改人才库
export function updateCandidate(data) {
  return request({
    url: '/system/talent/candidate',
    method: 'put',
    data: data
  })
}

// 删除人才库
export function delCandidate(id) {
  return request({
    url: '/system/talent/candidate/' + id,
    method: 'delete'
  })
}

// 更新人才简历
export function updateResume(data) {
  return request({
    url: '/system/talent/candidate/resume',
    method: 'put',
    data: data
  })
}