import request from '@/utils/request'

// 查询面试节点详情列表
export function listDetail(query) {
  return request({
    url: '/interview/detail/list',
    method: 'get',
    params: query
  })
}

// 查询面试节点详情详细
export function getDetail(id) {
  return request({
    url: '/interview/detail/' + id,
    method: 'get'
  })
}

// 新增面试节点详情
export function addDetail(data) {
  return request({
    url: '/interview/detail',
    method: 'post',
    data: data
  })
}

// 修改面试节点详情
export function updateDetail(data) {
  return request({
    url: '/interview/detail',
    method: 'put',
    data: data
  })
}

// 删除面试节点详情
export function delDetail(id) {
  return request({
    url: '/interview/detail/' + id,
    method: 'delete'
  })
}
