import request from '@/utils/request'

// 查询面试记录主列表
export function listRecord(query) {
  return request({
    url: '/interview/record/list',
    method: 'get',
    params: query
  })
}

// 查询面试记录主详细
export function getRecord(id) {
  return request({
    url: '/interview/record/' + id,
    method: 'get'
  })
}

// 新增面试记录主
export function addRecord(data) {
  return request({
    url: '/interview/record',
    method: 'post',
    data: data
  })
}

// 修改面试记录主
export function updateRecord(data) {
  return request({
    url: '/interview/record',
    method: 'put',
    data: data
  })
}

// 删除面试记录主
export function delRecord(id) {
  return request({
    url: '/interview/record/' + id,
    method: 'delete'
  })
}
