import { getGroupList } from "@/api/group.js";
import { isArr, deleteListValue } from "@/utils/libs.js";
import Toast from '@/components/Toast/toast'
import router from '@/router'
import { getCustomerQueue } from "@/api/await.js";
import { getNowServiceList } from "@/api/current.js";
const state = {
  currentUser: {
    activtyUid: null,
    activtyeUsername: "",
    login_ip: '',
    area: ''
  },
  activityGroup: {
    activityId: null,
    activityTitle: "",
    is_invite: null,
    on_file: 0,
    on_voice: 0
  },
  userMessage: {}, // 客服收到用户消息
  relinkMessage: {}, // 客服收到转接消息
  refuseMessage: {}, // 转接是否被接受
  groupMessage: {}, // 接受群聊消息
  chatList: [],//群列表
  awaitList: [], // 等待接入
  currentChatList: [], // 正在聊天列表
  groupBlack: {},//全局拉黑提示
  userBlack: {}, //个人拉黑提示
  groupForbid: {}, //禁言全局
  userForbid: {}, //禁言个人
  kickGroup: {},
  kefuStatus: {},
  oldUser: {},//上次接待的人
  serviceMsg: {}, //客服自己发送的消息
  userJoin: {}, // 有人加入群聊
  userLeave: {}, // 有人离开
  kefuLeave: {}, // 客服离开
  kefuOnline: {}, // 客服上线
  pullUsersGroup: [], // 拉人进群

}
const getters = {
  currentNum (state) {
    let num = 0
    state.currentChatList.forEach(element => {
      num += element.noReadNum
    });
    return num
  },
  groupChatNum (state) {
    let num = 0
    state.chatList.forEach(element => {
      num += element.noReadNum
    });
    return num
  }
}
const mutations = {
  // connect:查看socket是否渲染成功
  SOCKET_connect: (state) => {
  },
  // disconnect:检测socket断开连接
  SOCKET_disconnect: (data) => {
    // console.log('断开')
  },
  // reconnect:重新连接socket事件
  SOCKET_reconnect: (data) => {
    // console.log('重连')
  },
  // 客服被删除
  SOCKET_delKefu: (state, data) => {
    Toast({
      icon: 'close',
      content: data.message
    })
    router.push({ name: 'Login' })
  },
  // 被挤下线
  SOCKET_forced: (state, data) => {
    Toast({
      icon: 'close',
      content: data.message
    })
    router.push({ name: 'Login' })
  },
  //收到用户消息
  SOCKET_userMsg: (state, data) => {
    state.userMessage = data
  },
  // 
  SOCKET_serviceMsg: (state, data) => {
    state.serviceMsg = data
  },
  SOCKET_relink: (state, data) => {
    state.relinkMessage = data
  },
  SOCKET_refuse: (state, data) => {
    state.refuseMessage = data
  },
  //待接入离开了
  SOCKET_userDel: (state, data) => {
    console.log(data, 3333)
    let arr = deleteListValue(state.awaitList, 'customer_id', data.uid)
    state.awaitList = arr
  },
  SOCKET_prompt: (state, data) => {
    let arr = deleteListValue(state.awaitList, 'customer_id', data.uid)
    state.awaitList = arr

  },
  //客服上线
  SOCKET_kefuOnline: (state, data) => {
    state.kefuOnline = data
  },
  //群消息
  SOCKET_groupMsg: (state, data) => {
    state.groupMessage = data
  },
  // 群更新
  SOCKET_saveGroup: (state, data) => {
    // 有这个群数据改变了
    let arr = JSON.parse(JSON.stringify(state.chatList))
    let list = arr.map(item => {
      if (item.group_id === data.group_id) {
        let { group_avatar, group_name, is_invite, on_file, on_voice } = data
        item.group_avatar = group_avatar
        item.group_name = group_name
        item.is_invite = is_invite
        item.on_file = on_file
        item.on_voice = on_voice
      }
      return item
    })
    if (state.activityGroup.activityId === data.group_id) {
      state.activityGroup.activityTitle = data.group_name
      state.activityGroup.is_invite = data.is_invite
      state.activityGroup.on_file = data.on_file
      state.activityGroup.on_voice = data.on_voice
    }
    state.chatList = list


  },
  // 拉人进群
  // 管理员拉人进群 
  SOCKET_pullUsersGroup (state, data) {
    state.pullUsersGroup = data
  },
  // 新增群
  SOCKET_addGroup (state, data) {
    data.noReadNum = 0
    state.chatList.push(data)
  },
  //新待接
  SOCKET_addQueue: (state, data) => {
    state.awaitList.push(data)
  },
  // 收到拉黑全局提示
  SOCKET_groupBlack: (state, data) => {
    state.groupBlack = data
  },
  // 个人提示已被拉黑
  SOCKET_userBlack: (state, data) => {
    state.userBlack = data
  },
  // 个人提示解除拉黑
  SOCKET_removeblack: (state, data) => {
    state.userBlack = data
  },
  // 禁言全局提示
  SOCKET_groupForbid: (state, data) => {
    state.groupForbid = data
  },
  // 禁言全局个人提示
  SOCKET_userForbid: (state, data) => {
    state.userForbid = data
  },
  // 提示个人解禁
  SOCKET_removeforbid: (state, data) => {
    state.userForbid = data
  },
  // 踢出群
  SOCKET_kickGroup: (state, data) => {
    state.kickGroup = data
  },
  // 删除群
  SOCKET_delGroup: (state, data) => {
    let list = JSON.parse(JSON.stringify(state.chatList))
    let arr = []
    list.forEach((item) => {
      item.group_id !== data.group_id && arr.push(item)
    })
    state.chatList = arr
    if (state.activityGroup.activityId === data.group_id) {
      state.activityGroup = {
        activityId: state.chatList[0].group_id,
        activityTitle: state.chatList[0].group_name,
        is_invite: state.chatList[0].is_invite,
        on_file: state.chatList[0].on_file,
        on_voice: state.chatList[0].on_voice
      }
    }

  },
  // 有人加入群聊
  SOCKET_userJoin: (state, data) => {
    state.userJoin = data
  },
  // 有人离开
  SOCKET_userLeave: (state, data) => {
    state.userLeave = data
  },
  // 客服离开
  SOCKET_kefuLeave: (state, data) => {
    state.kefuLeave = data
  },
  // 当前登录状态
  SOCKET_setStatus: (state, data) => {
    state.kefuStatus = data
  },
  //  上次接待 再次默认接待
  SOCKET_autoLink: (state, data) => {
    data.access_time = data.createtime
    data.noReadNum = 1
    if (!state.currentChatList.length) {
      state.currentUser = {
        activtyUid: data.uid,
        activtyeUsername: data.username,
        login_ip: data.login_ip,
        area: data.area
      }
    }
    state.oldUser = data
    !isArr(state.currentChatList, 'username', data.username) && state.currentChatList.push(data)
  },
  SET_STATUS (state, data) {
    state.status = data
  },
  SET_CHAT_LIST (state, data) {
    state.chatList = data
  },
  SET_CURRENT_USER (state, data) {
    state.currentUser = data
  },
  SET_ACTIVITY_GROUP (state, data) {
    state.activityGroup = data
  },
  SET_AWAIT_LIST (state, data) {
    state.awaitList = data
  },
  SET_CURRENT_CHAT_LIST (state, data) {
    state.currentChatList = data
  },
  SET_CURRENT_CHAT_LIST_PUSH (state, data) {
    state.currentUser = {
      activtyUid: data.uid,
      activtyeUsername: data.username,
      login_ip: data.login_ip,
      area: data.area
    },
      !isArr(state.currentChatList, 'username', data.username) && state.currentChatList.push(data)
  },
  RESETVUEX (state) {
    state.currentUser.activtyUid = null
    state.currentUser.activtyeUsername = ""
    state.currentUser.login_ip = ''
    state.currentUser.area = ''
    state.activityGroup.activityId = null
    state.activityGroup.activityTitle = ""
    state.activityGroup.is_invite = null
    state.userMessage = {} // 客服收到用户消息
    state.relinkMessage = {} // 客服收到转接消息
    state.refuseMessage = {} // 转接是否被接受
    state.groupMessage = {} // 接受群聊消息 
    state.chatList = []//群列表
    state.awaitList = [] // 等待接入
    state.currentChatList = []// 正在聊天列表
    state.userIp = {}
    state.groupBlack = {}//全局拉黑提示
    state.userBlack = {}//个人拉黑提示
    state.groupForbid = {} //禁言全局
    state.kickGroup = {} //踢出群全局
    state.userForbid = {} //禁言个人 
    state.kefuStatus = {}
    state.oldUser = {}//上次接待的人
  },
}
const actions = {
  // 获取群列表
  getGroupList ({ commit }, data) {
    return new Promise(async (resolve, reject) => {
      await getGroupList(data).then((result) => {
        commit('SET_CHAT_LIST', result.data)
        resolve(result.data);
      })
        .catch(err => {
          reject(err);
        });
    })
  },
  // 等待接入的列表
  getAwaitList ({ commit }, data) {
    return new Promise(async (resolve, reject) => {
      await getCustomerQueue(data).then((result) => {
        let awaitList = result.data;
        commit('SET_AWAIT_LIST', awaitList)
        resolve(awaitList);
      })
        .catch(err => {
          reject(err);
        });
    })
  },
  // 正在聊天的列表
  getCurrentListData ({ state, commit }) {
    return new Promise(async (resolve, reject) => {
      await getNowServiceList().then((result) => {
        let list = JSON.parse(JSON.stringify(state.currentChatList))
        let currentChatList = result.data.map(item => {
          list.forEach(val => {
            val.isMultitap && val.username === item.username ? item.isMultitap = true : item.isMultitap = false
          })
          return item
        })
        commit('SET_CURRENT_CHAT_LIST', currentChatList)
        resolve(currentChatList);
      })
        .catch(err => {
          reject(err);
        });
    })
  },
  delKefu ({ commit }) {
    commit(DEL)
  }

}

export default {
  state,
  getters,
  mutations,
  actions
}