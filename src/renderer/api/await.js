import request from '@/utils/axios.js'
/**
 * 群列表
 */
export function getCustomerQueue(params){
    return request.post('/service/getCustomerQueue',params)
}
/**
 * 接待
 */
export function reception(params){
    return request.post('/service/receive',params)
}