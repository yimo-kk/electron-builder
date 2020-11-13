import axios from 'axios'
import store from './../store'
import router from '../router'
import Message from 'ant-design-vue/es/message'
import Toast from './../components/Toast/toast'
const baseURL = process.env.NODE_ENV === 'development'
  ? 'https://server.nikidigital.net'
  : 'https://server.nikidigital.net'
  // : 'http://140.143.128.100:3000'

const instance = axios.create({
  baseURL,
  timeout: 50000,
  withCredentials: true
})

instance.interceptors.request.use(config => {
  let accessToken
  let refreshToken 
  if(Object.keys(router.history.current.query).length){
    let {  kefu_code ,seller_code} =router.history.current.query
    if(localStorage.getItem(seller_code) && JSON.parse(localStorage.getItem(seller_code))[kefu_code]){
      accessToken = JSON.parse(localStorage.getItem(seller_code))[kefu_code]['accessToken']
      refreshToken = JSON.parse(localStorage.getItem(seller_code))[kefu_code]['refreshToken']
    }
  }
  
  // let accessToken = localStorage.getItem('accessToken')
  // let refreshToken = localStorage.getItem('refreshToken')
  // if(config.url !=="/service/doLogin" && (accessToken && refreshToken)){
  //   config.headers['refresh-token'] = refreshToken
  //   config.headers['access-token'] = accessToken 
  // }else if(config.url !=="/service/doLogin") {
  //   router.push({name:"Login"})
  //   return
  // }
  if((config.url !=="/service/doLogin" && config.url !=='/service/getKefuInfo' ) && (accessToken && refreshToken)){
      config.headers['refresh-token'] = refreshToken
      config.headers['access-token'] = accessToken 
    }else if(config.url !=="/service/doLogin" && config.url !=='/service/getKefuInfo') {
      router.push({name:"Login"})
      return
    }
  return config
}, error => {
  Message.error(error)
  Promise.reject(error) 
})
instance.interceptors.response.use(
  response => {
      return response.data
  },
  error => {
    if (error.response) {
      let res = error.response
      switch (res.status) {
        case 401:
          Message.warn(res.data.msg || '请先登录')
          break
        case 403:
          Message.error(res.data.msg || '权限不足')
          break
        case 404:
          Message.error(res.data.msg || '请求资源不存在')
          break
        case 500:
          Message.error(res.data.msg || '服务器开小差啦')
          break
        case 504:
          Message.error(res.data.msg || '网络请求失败')
          break
        default:
          Message.error(res.data.msg || res.statusText)
      }
    } else {
      Toast({
        icon: 'close',
        content: '请检查网络连接状态!'
      })
    }
    return Promise.reject(error.response)
  })

export default instance
