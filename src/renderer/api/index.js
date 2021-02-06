
import request from '@/utils/axios.js'
/**
 * 获取配置文件
 * kefu_id
 */
export function getKefuSystem (params) {
  return request.post('service/getKefuSystem', params)
}
/**
 * 设置配置文件
 * @param {*} params 
 */
export function updateKefuSystem (params) {
  return request.post('service/updateKefuSystem', params)
}