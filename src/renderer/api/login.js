import request from '@/utils/axios.js'
/**
 * 登录
 */
export function handleLogin(params){
    return request.post('/service/doLogin', params)
}
/** 
 * 获取用户信息
 */
export function getUserInfo(accessToken,refreshToken){
    return request(
        {
           url: '/service/getKefuInfo',
           headers: {
            "refresh-token":  accessToken,
            "access-token":  refreshToken,
            }, 
          method: "get",
        }
    )
}
/** 
 * 登录状态
 */
export function updateKefuStatus(code){
    return request.get(`/service/updateKefuStatus?kefu_code=${code}`)
}
