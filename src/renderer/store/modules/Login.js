
  import {handleLogin,getUserInfo} from '@/api/login.js'
  const state = {
    userInfo: {},
    userIp:{
    }
  }
  const mutations = {
    SET_USER_INFO(state,val){
      state.userInfo = val
    },
    SET_USER_IP(state, data){
      state.userIp = data
  },
  }
  const actions = { 
     // 登录
     handleLogin({ state, commit }, data) {
        return new Promise(async (resolve, reject) => {
          await handleLogin(data)
            .then(result => {
              resolve(result);
            })
            .catch(err => {
              reject(err);
            });
        });
      },
      // 获取用户信息
     getUserInfo({ state, commit },{accessToken,refreshToken}) {
      return new Promise(async (resolve, reject) => {
        await getUserInfo(accessToken,refreshToken)
          .then(result => {
            commit('SET_USER_IP',{ip:result.data.login_ip})
            resolve(result);
          })
          .catch(err => {
            reject(err);
          });
      });
    },
    // 退出登录
    // outLogin({commit}){
    //   localStorage.removeItem('accessToken')
    //   localStorage.removeItem('refreshToken')
    //   commit('SET_USER_INFO','')
    // }
  }
  
  export default {
    state,
    mutations,
    actions
  }
  