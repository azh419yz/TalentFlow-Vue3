import request from '@/utils/request'

// 查询生成表数据
export function deleteFile(url, type) {
  return request({
    url: '/file/delete?fileUrl=' + url + '&storageType=' + type,
    method: 'delete'
  })
}

export function previewFile(url, type) {
  return request({
    url: '/file/preview?fileUrl=' + url + '&storageType=' + type,
    method: 'get'
  })
}

export function signedUrl(url, type) {
  return request({
    url: '/file/signed-url?fileUrl=' + url + '&storageType=' + type,
    method: 'get'
  })
}