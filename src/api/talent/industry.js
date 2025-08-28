import request from '@/utils/request'

// 查询人才职位分类
export function getAllIndustries() {
  return request({
    url: '/talent/industry/all',
    method: 'get'
  })
}

