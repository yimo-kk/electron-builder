
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
/**
 * 获取Telegram 是否连接
 * @param {*} params 
 */
export function isBindTelegram (params) {
  return request.post('service/isBindTelegram', params)
}

/**
 * 设置Telegram 连接状态
 * @param {*} params 
 */
export function saveBindTelegram (params) {
  return request.post('service/saveBindTelegram', params)
}

/**
 * 获取 自定义表情
 * @param {*} params 
 */
export function getPhizList (params) {
  return request.post('service/getPhizList', params)
}