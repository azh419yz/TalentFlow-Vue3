import request from '@/utils/request'

// 查询人才职位分类
export function getAllPosts() {
  return request({
    url: '/talent/post/all',
    method: 'get'
  })
}

