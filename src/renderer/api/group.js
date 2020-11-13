import request from '@/utils/axios.js'
/**
 * 群列表
 */
export function getGroupList(params){ 
    return request.post('/service/getGroupList',params)
}
/**
 * 获取群聊记录
 */
export function getGroupChatLog(params){
    return request.post('/service/getGruopChatLog', params)
}

/**
 * 获取群成员
 */
export function getGroupUsersList(params){
    return request.post('/service/getGroupUsersList', params)
}

/**
 * 禁言
 */
export function prohibitSay(params){
    return request.post('/service/prohibitSay', params)
}
/**
 * 踢人
 */
export function kickUsersGroup(params){
    return request.post('/service/kickUsersGroup', params)
}
/**
 * 获取非群成员
 */
export function getNotGroupUsersList(params){
    return request.post('/service/getNotGroupUsersList', params)
}
/**
 * 拉人进群
 */
export function pullUsersGroup(params){
    return request.post('/service/pullUsersGroup', params)
}

