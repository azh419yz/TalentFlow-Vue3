import request from '@/utils/request'

// 查询岗位要求详情列表
export function listRequirement(query) {
  return request({
    url: '/position/requirement/list',
    method: 'get',
    params: query
  })
}

// 查询岗位要求详情详细
export function getRequirement(id) {
  return request({
    url: '/position/requirement/' + id,
    method: 'get'
  })
}

// 新增岗位要求详情
export function addRequirement(data) {
  return request({
    url: '/position/requirement',
    method: 'post',
    data: data
  })
}

// 修改岗位要求详情
export function updateRequirement(data) {
  return request({
    url: '/position/requirement',
    method: 'put',
    data: data
  })
}

// 删除岗位要求详情
export function delRequirement(id) {
  return request({
    url: '/position/requirement/' + id,
    method: 'delete'
  })
}
