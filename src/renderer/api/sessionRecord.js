
import request from '@/utils/axios.js'
/**
 * 获取留言列表
 */
export function getSessionRecordLog (params) {
  return request.post('service/getServiceLog', params)
}
