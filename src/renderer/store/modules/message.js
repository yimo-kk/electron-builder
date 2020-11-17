import {getLeaveMsg} from '@/api/message.js'
const state = {
    messageList:[],
    untreatedNum:0
  }
  
  const mutations = {
   SET_MESSAGE_LIST(state,val){
     state.messageList = val
   },
   SET_UNTREATED_NUM(state,val){
    state.untreatedNum = val
  },
  }
  
  const actions = {
     // 留言列表
     getMessageList({ commit },data){
        return new Promise((resolve,reject)=>{
            getLeaveMsg(data)
              .then((result) => {
                if(result.code === 0){
                  commit('SET_MESSAGE_LIST', result.data)
                  commit('SET_UNTREATED_NUM',result.num )
                  resolve(result.data);
                }
              }).catch((err) => {
                reject(err);    
              });
        }) 
      }
  }
  
  export default {
    state,
    mutations,
    actions
  }
  