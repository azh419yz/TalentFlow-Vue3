import request from '@/utils/request'

// 查询岗位基础信息列表
export function listInfo(query) {
  return request({
    url: '/position/info/list',
    method: 'get',
    params: query
  })
}

// 查询岗位基础信息详细
export function getInfo(id) {
  return request({
    url: '/position/info/' + id,
    method: 'get'
  })
}

// 新增岗位基础信息
export function addInfo(data) {
  return request({
    url: '/position/info',
    method: 'post',
    data: data
  })
}

// 修改岗位基础信息
export function updateInfo(data) {
  return request({
    url: '/position/info',
    method: 'put',
    data: data
  })
}

// 删除岗位基础信息
export function delInfo(id) {
  return request({
    url: '/position/info/' + id,
    method: 'delete'
  })
}
