import { getKefuSystem, updateKefuSystem } from "@/api/index.js";
const state = {
  loginState: null,
  shopUrl: null,
  setting: {
    group_menu: false,
    group_receive: false,
    group_sound: false,
    group_task: false,
    group_tray: false,
    menu_prompt: false,
    stay_num: false,
    transfer_sound: false,
    transfer_task: false,
    transfer_tray: false,
    user_join: false,
    user_receive: false,
    user_sound: false,
    user_task: false,
    user_tray: false,
    menu_total: false,
  }
}
const mutations = {
  SET_MULTITAPPROMPT (state, val) {
    state.multitapPromptValue = val
  },
  SET_USERPROMPT (state, val) {
    state.userPromptValue = val
  },
  SET_GROUPPROMPT (state, val) {
    state.groupPromptValue = val
  },
  SET_AWAITPROMPT (state, val) {
    state.awaitPromptValue = val
  },
  SET_MESSAGEPROMPT (state, val) {
    state.messagePromptValue = val
  },
  SET_SHOPURL (state, val) {
    state.shopUrl = val
  },
  SET_LOGINSTATE (state, val) {
    state.loginState = val
  },
  SET_SETTING (state, data) {
    state.setting = data
  }
}
const actions = {
  // 获取设置得配置参数
  getKefuSystemData ({ commit }, data) {
    return new Promise(async (resolve, reject) => {
      await getKefuSystem(data).then((result) => {
        let settingObj = {}
        for (const key in result.data) {
          result.data[key] ? settingObj[key] = true : settingObj[key] = false
        }
        delete settingObj.id
        delete settingObj['kefu_id']
        commit('SET_SETTING', settingObj)
        resolve(settingObj);
      })
        .catch(err => {
          reject(err);
        });
    })
  },
  // 设置配置参数 
  updateKefuSystemData ({ state, commit }, { kefu_id, data }) {
    return new Promise(async (resolve, reject) => {
      let setData = {}
      for (const key in data) {
        data[key] ? (setData[key] = 1) : (setData[key] = 0)
      }

      await updateKefuSystem({
        kefu_id,
        ...setData
      }).then((result) => {
        commit('SET_SETTING', setData)
        resolve();
      })
        .catch(err => {
          reject(err);
        });
    })
  },
}

export default {
  state,
  mutations,
  actions
}
