import request from '@/utils/request'

// 查询人才职位分类
export function getAllPosts() {
  return request({
    url: '/system/talent/post/all',
    method: 'get'
  })
}

