
import request from '@/utils/axios.js'
/**
 * 获取留言列表
 */
export function getLeaveMsg (params) {
  return request.post('/service/getLeaveMsg', params)
}
