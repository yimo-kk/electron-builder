import request from '@/utils/axios.js'
/**
 * 当前正在接待的list
 */
export function getNowServiceList(){
    return request.post('/service/getNowServiceList')
}
/**
 * 聊天记录
 */
export function getUserChatLog(params){
    return request.post('/service/getUserChatLog',params)
}
/**
 * 关闭
 */
export function closeChat(params){
    return request.post('/service/closeChat',params)
}

/**
 * 快捷回复内容
 */
export function getSellerWordList(params){
    return request.post('/service/getSellerWordList',params)
}

/**
 * 转接
 */
export function reLink(params){
    return request.post('/service/reLink',params)
}

/**
 * 聊天时上传文件
 * @param {*} params
 */
export function serviceSendChatFile(params) {
    return request({
      url: "/chat/serviceSendChatFile",
      headers: {
        "Content-Type": "multipart/form-data"
      },
      method: "post",
      data: params
    });
  }
  
  /**
   * 聊天时上传语音
   * @param {*} params
   */
  export function uploadVoice({ params, seller_code }) {
    return request({
      url: `/chat/uploadVoice?u=${seller_code}`,
      headers: {
        "Content-Type": "multipart/form-data"
      },
      method: "post",
      data: params
    });
  }
  /**
   * 接受转接
   * @param {*} params
   */
  export function handleRelink( params) {
    return request({
      url: `/service/handleRelink`,
      method: "post",
      data: params
    });
  }

  /**
   * 快捷回复搜索
   * @param {*} params
   */
  export function searchSellerWord( params) {
    return request({
      url: `/service/searchSellerWord`,
      method: "post",
      data: params
    });
  }