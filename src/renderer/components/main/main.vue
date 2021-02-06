<template>
  <div style="height:100%;">
    <a-layout style="height:100%;">
      <a-layout-header class="header">
        <div class="header">
          <a-menu
            theme="dark"
            mode="horizontal"
            :default-selected-keys="['AwaitChat']"
            :style="{ lineHeight: '55px' }"
            :selectedKeys="[selectedKey]"
            @select="selectMenu"
          >
            <a-menu-item key="CurrentChat">
              <div class="flex_center">
                <customIcon
                  type="icon-liaotian"
                  class="icon_style"
                ></customIcon>
                <p>{{ $t('topTitle.currentChat') }}</p>
                <a-badge
                  v-show="$store.state.Setting.setting.menu_total"
                  :count="$store.getters.currentNum"
                  :overflow-count="99"
                  :offset="[0, -18]"
                >
                </a-badge>
              </div>
            </a-menu-item>
            <a-menu-item key="SessionRecord">
              <div class="flex_center">
                <a-icon type="audit" class="icon_style" />
                <p>{{ $t('topTitle.chatLog') }}</p>
                <a-badge :count="0" :overflow-count="99" :offset="[0, -10]">
                </a-badge>
              </div>
            </a-menu-item>
            <a-menu-item key="AwaitChat">
              <div class="flex_center">
                <customIcon type="icon-dengdai" class="icon_style"></customIcon>
                <p>
                  {{ $t('topTitle.awaitChat') }}
                </p>

                <a-badge
                  v-show="$store.state.Setting.setting.menu_prompt"
                  :count="awaitList.length"
                  :overflow-count="99"
                  :offset="[0, -18]"
                >
                </a-badge>
              </div>
            </a-menu-item>
            <a-menu-item key="GroupChat">
              <div class="flex_center">
                <customIcon
                  type="icon--qunliaoshezhi"
                  class="icon_style"
                ></customIcon>
                <p>{{ $t('topTitle.groupChat') }}</p>
                <a-badge
                  v-show="$store.state.Setting.setting.group_menu"
                  :count="$store.getters.groupChatNum"
                  :overflow-count="99"
                  :offset="[0, -10]"
                >
                </a-badge>
              </div>
            </a-menu-item>

            <a-menu-item key="Message">
              <div class="flex_center">
                <a-icon type="audit" class="icon_style" />
                <p>{{ $t('topTitle.leaveMessage') }}</p>
                <a-badge
                  v-show="$store.state.Setting.setting.stay_num"
                  :count="$store.state.message.untreatedNum"
                  :overflow-count="99"
                  :offset="[0, -10]"
                >
                </a-badge>
              </div>
            </a-menu-item>
          </a-menu>
        </div>
        <service-header @setStatus="setStatus"></service-header>
      </a-layout-header>
      <a-layout class="body_content">
        <div v-if="selectedKey === 'AwaitChat'" style="height:100%;">
          <AwaitChat @selectMenu="selectMenu"></AwaitChat>
        </div>
        <div v-if="selectedKey === 'CurrentChat'" style="height:100%">
          <CurrentChat
            ref="CurrentChat"
            @goAwaitChat="selectMenu"
          ></CurrentChat>
        </div>
        <div v-if="selectedKey === 'GroupChat'" style="height:100%">
          <GroupChat ref="GroupChat"></GroupChat>
        </div>
        <div v-if="selectedKey === 'SessionRecord'" style="height:100%">
          <SessionRecord></SessionRecord>
        </div>
        <div v-if="selectedKey === 'Message'" style="height:100%">
          <Message></Message>
        </div>
      </a-layout>
    </a-layout>
  </div>
</template>

<script>
import serviceHeader from '@/components/serviceHeader/serviceHeader.vue'
import AwaitChat from '@/view/awaitChat/index'
import CurrentChat from '@/view/currentChat/index'
import GroupChat from '@/view/groupChat/index'
import Message from '@/view/message/index'
import SessionRecord from '@/view/sessionRecord/index'
import { updateKefuStatus } from '@/api/login'
import common from '@/mixins/common'
import { handleRelink } from '@/api/current.js'
import { mapMutations, mapActions } from 'vuex'
import { DebounceBy } from '@/utils/libs'
export default {
  name: 'Main',
  inject: ['reload'],
  mixins: [common()],
  components: {
    serviceHeader,
    AwaitChat,
    CurrentChat,
    GroupChat,
    Message,
    SessionRecord,
  },
  data() {
    return {
      selectedKey: 'CurrentChat',
    }
  },
  computed: {
    awaitList() {
      return this.$store.state.Socket.awaitList
    },
    currentChatList() {
      return this.$store.state.Socket.currentChatList
    },
    chatList() {
      return this.$store.state.Socket.chatList
    },
    userInfo() {
      return (
        this.$route.query.seller_code &&
        JSON.parse(localStorage.getItem(this.$route.query.seller_code))[
          this.$route.query.kefu_code
        ]
      )
    },
    currentUser() {
      return this.$store.state.Socket.currentUser
    },
    kefuStatus() {
      return this.$store.state.Socket.kefuStatus.online_status
    },
  },
  sockets: {
    // connect:查看socket是否渲染成功
    connect() {
      if (this.$store.state.Setting.loginState === -7) {
        this.$socket.emit('message', {
          cmd: 'forced',
          seller_code: this.$route.query.seller_code,
          kefu_name: this.$route.query.kefu_name,
        })
        this.SET_LOGINSTATE(null)
      }
      this.reconnect()
      this.updateKefuStatus()
    },
    // disconnect:检测socket断开连接
    disconnect(data) {},
    reconnect(data) {
      console.log('重连')
      this.reconnect()
    },
    error() {
      this.$socket.close()
    },
    // 是否显示每条信息时间
    chatTime(data) {
      if (data.seller_code === this.userInfo.seller_code) {
        let obj = {}
        obj = this.userInfo
        obj.chat_time = data.chat_time
        let objAll = JSON.parse(
          localStorage.getItem(this.$route.query.seller_code)
        )
        objAll[this.$route.query.kefu_code] = obj
        localStorage.setItem(
          this.$route.query.seller_code,
          JSON.stringify(objAll)
        )
        this.SET_CHAT_TIME(data.chat_time)
      }
    },
  },
  watch: {
    chatList: {
      handler(newVal) {
        newVal.length === 0 &&
          this.SET_ACTIVITY_GROUP({
            activityId: null,
            activityTitle: '',
            is_invite: null,
            on_file: 0,
            on_voice: 0,
            img: '',
            isAdmin: false,
          })
      },
      deep: true,
    },
    '$store.state.Socket.oldUser': {
      handler(newVal) {
        // this.$store.state.Setting.userPromptValue.includes(3) && this.play()
        // this.$store.state.Setting.userPromptValue.includes(4) &&
        //   this.$electron.ipcRenderer.send('message_prompt')
        this.$store.state.Setting.setting.user_join && this.play()
        this.$store.state.Setting.setting.user_receive &&
          this.$electron.ipcRenderer.send('message_prompt')
        // 进入添加进入显示
        this.$socket.emit('message', {
          from_name: newVal.username,
          from_id: newVal.uid,
          to_id: this.userInfo.kefu_id,
          to_name: this.userInfo.kefu_name,
          seller_code: this.userInfo.seller_code,
          kefu_code: this.userInfo.kefu_code,
          message: `"${newVal.username}" 前来咨询`,
          cmd: 'addPrompt',
        })
      },
      deep: true,
    },
    // 监听聊天列表变化，选中用户是否再列表中
    currentChatList: {
      handler(newVal) {
        let bool = newVal.some((item) => {
          return item.uid == this.currentUser.activtyUid
        })
        if (!this.currentChatList.length) {
          this.SET_CURRENT_USER({
            activtyUid: null,
            activtyeUsername: '',
            login_ip: '',
            area: '',
            level: 0,
            is_relink: null,
          })
        } else if (!bool) {
          this.SET_CURRENT_USER({
            activtyUid: this.currentChatList[0].uid,
            activtyeUsername: this.currentChatList[0].username,
            login_ip: this.currentChatList[0].login_ip,
            area: this.currentChatList[0].area,
            level: this.currentChatList[0].level,
            is_relink: this.currentChatList[0].is_relink,
          })
        }
      },
    },
    // 收到转接
    '$store.state.Socket.relinkMessage': {
      handler(newVal) {
        let val = JSON.parse(JSON.stringify(newVal))
        if (val.kefu_code == this.userInfo.kefu_code) {
          // this.$store.state.Setting.multitapPromptValue.includes(3) &&
          //   this.play()
          // this.$store.state.Setting.multitapPromptValue.includes(1) &&
          //   this.$electron.ipcRenderer.send('message_prompt')
          // this.$store.state.Setting.multitapPromptValue.includes(2) &&
          //   this.$electron.ipcRenderer.send('message_tray')
          this.$store.state.Setting.setting.transfer_sound && this.play()
          this.$store.state.Setting.setting.transfer_task &&
            this.$electron.ipcRenderer.send('message_prompt')
          this.$store.state.Setting.setting.transfer_tray &&
            this.$electron.ipcRenderer.send('message_tray')
          // 暂时隐藏系统通知 transfer_task
          // this.$electron.ipcRenderer.send('isVisible_box', {
          //   msg: val.message,
          //   tab: 'CurrentChat',
          // })
          let that = this
          this.$confirm({
            title: this.$t('notification'),
            content: val.message,
            okText: this.$t('determine'),
            cancelText: this.$t('refuse'),
            onOk: DebounceBy(() => {
              that.$socket.emit('message', {
                username: val.user_name,
                seller_code: that.userInfo.seller_code,
                from_kefu_code: val.from_kefu_code,
                kefu_name: val.kefu_name,
                kefu_code: val.kefu_code,
                cmd: 'relink-accept',
              })
              that.$socket.emit('message', {
                username: val.user_name,
                kefu_code: that.userInfo.kefu_code,
                kefu_name: that.userInfo.kefu_name,
                uid: val.user_id,
                seller_code: that.userInfo.seller_code,
                cmd: 'service-prompt',
              })
              that.handleRelink({
                seller_code: that.userInfo.seller_code,
                uid: val.user_id,
                kefu_code: that.userInfo.kefu_code,
                from_kefu_code: val.from_kefu_code,
                level: val.level,
              })
              console.log(newVal)
              // 转接后 添加进入显示
              this.$socket.emit('message', {
                from_name: val.user_name,
                from_id: val.user_id,
                to_id: this.userInfo.kefu_id,
                to_name: this.userInfo.kefu_name,
                seller_code: this.userInfo.seller_code,
                kefu_code: this.userInfo.kefu_code,
                message: val.message,
                cmd: 'addPrompt',
              })
              that.selectedKey = 'CurrentChat'
            }, 800),
            onCancel() {
              that.$socket.emit('message', {
                username: val.user_name,
                from_kefu_code: val.from_kefu_code,
                kefu_name: that.userInfo.kefu_name,
                kefu_code: that.userInfo.kefu_code,
                seller_code: that.userInfo.seller_code,
                cmd: 'relink-refuse',
              })
            },
          })
        }
      },
      deep: true,
    },
    // 收到用户发来消息
    '$store.state.Socket.userMessage': {
      handler(newVal) {
        let data = JSON.parse(JSON.stringify(newVal))
        // 消息声音提示和任务栏闪烁
        if (data.from_name !== this.userInfo.kefu_name) {
          // this.$store.state.Setting.userPromptValue.includes(3) && this.play()
          // this.$store.state.Setting.userPromptValue.includes(1) &&
          //   this.$electron.ipcRenderer.send('message_prompt')
          // this.$store.state.Setting.userPromptValue.includes(2) &&
          //   this.$electron.ipcRenderer.send('message_tray')
          this.$store.state.Setting.setting.user_sound && this.play()
          this.$store.state.Setting.setting.user_task &&
            this.$electron.ipcRenderer.send('message_prompt')
          this.$store.state.Setting.setting.user_tray &&
            this.$electron.ipcRenderer.send('message_tray')
          // 暂时隐藏系统通知
          // this.$electron.ipcRenderer.send('isVisible_box', {
          //   msg: `${data.from_name}${this.$t('sendNewMessage')}`,
          //   tab: 'CurrentChat',
          // })
          if (
            this.selectedKey != 'CurrentChat' ||
            this.$store.state.Socket.currentUser.activtyeUsername !=
              newVal.from_name
          ) {
            let arr = JSON.parse(JSON.stringify(this.currentChatList))
            let list = arr.map((item) => {
              item.username == data.from_name && (item.noReadNum += 1)
              return item
            })
            this.SET_CURRENT_CHAT_LIST(list)
          }
        }
      },
      deep: true,
    },
    '$store.state.Socket.groupMessage': {
      handler(newVal) {
        let data = JSON.parse(JSON.stringify(newVal))
        if (data.from_name !== this.userInfo.kefu_name) {
          this.$store.state.Setting.setting.group_sound && this.play()
          this.$store.state.Setting.setting.group_task &&
            this.$electron.ipcRenderer.send('message_prompt')
          this.$store.state.Setting.setting.group_tray &&
            this.$electron.ipcRenderer.send('message_tray')

          // 暂时隐藏系统通知
          // this.$electron.ipcRenderer.send('isVisible_box', {
          //   msg: this.$t('rogerThat'),
          //   tab: 'GroupChat',
          // })
        }
        if (
          this.$store.state.Socket.chatList.length &&
          (this.selectedKey != 'GroupChat' ||
            this.$store.state.Socket.activityGroup.activityId !=
              newVal.group_id)
        ) {
          let chatList = this.arrayExists(
            this.$store.state.Socket.chatList,
            data.group_id,
            true
          )
          this.SET_CHAT_LIST(chatList)
        }
      },
      deep: true,
    },
  },
  methods: {
    ...mapActions([
      'getGroupList',
      'getAwaitList',
      'getMessageList',
      'getKefuSystemData',
    ]),
    ...mapMutations([
      'SET_CHAT_LIST',
      'SET_CURRENT_USER',
      'SET_CURRENT_CHAT_LIST',
      'SET_CURRENT_CHAT_LIST_PUSH',
      'SET_STATUS',
      'SET_ACTIVITY_GROUP',
      'SET_CHAT_TIME',
      'SET_LOGINSTATE',
    ]),
    selectMenu(val) {
      this.selectedKey = val.key
      if (val.key == 'Message') {
        this.getMessageList({
          seller_code: this.userInfo.seller_code,
        })
      }
    },
    handleRelink(data) {
      handleRelink(data).then((result) => {
        if (result.code === -1) {
          this.$message.error(result.msg)
        } else {
          this.SET_CURRENT_CHAT_LIST_PUSH(result.data)
          this.$message.success(result.msg)
        }
      })
    },
    updateKefuStatus() {
      updateKefuStatus(this.userInfo.kefu_code).then((result) => {
        this.SET_STATUS({ online_status: 1 })
        this.setStatus(1)
      })
    },
    arrayExists(arr, value, bool) {
      let con_arr = JSON.parse(JSON.stringify(arr))
      let list = con_arr.map((item) => {
        item.group_id == value &&
          (item.noReadNum = bool ? item.noReadNum + 1 : 0)
        return item
      })
      return list
    },
    setStatus(index) {
      this.$socket.emit('message', {
        cmd: 'service-status',
        kefu_code: this.userInfo.kefu_code,
        kefu_id: this.userInfo.kefu_id,
        login_ip: this.userInfo.login_ip,
        seller_code: this.userInfo.seller_code,
        username: this.userInfo.kefu_name,
        headimg: this.userInfo.kefu_avatar,
        online_status: index,
      })
    },
    reconnect() {
      this.$socket.emit('init', {
        seller_code: this.userInfo.seller_code,
        kefu_code: this.userInfo.kefu_code,
      })
    },
    polling() {
      let timeOut = null
      timeOut = setInterval(() => {
        if (this.$route.query.seller_code) {
          this.$socket.emit('message', {
            cmd: 'closetime-processing',
            kefu_code: this.userInfo.kefu_code,
            seller_code: this.userInfo.seller_code,
          })
          //会导致离开状态被修改
          this.setStatus(this.kefuStatus)
        } else {
          clearInterval(timeOut)
        }
      }, 20000)
    },
  },

  mounted() {
    this.getMessageList({
      seller_code: this.userInfo.seller_code,
    })
    this.getGroupList({ kefu_id: this.userInfo.kefu_id })
    // 等待接入
    this.getAwaitList({
      seller_code: this.userInfo.seller_code,
      username: '',
    })
    this.$electron.ipcRenderer.on('show_tab', (data, val) => {
      this.selectedKey = val
    })
    this.$route.query.seller_code && this.polling()
    // 获取设置配置
    this.getKefuSystemData({ kefu_id: this.userInfo.kefu_id })
  },
}
</script>

<style lang="less" scoped>
.icon_style {
  color: #fff;
  font-size: 18px;
}
.header {
  display: flex;
  justify-content: space-between;
}

.body_content {
  padding: 20px 10px 0 10px;
  height: 100%;
}
/deep/.ant-badge-count {
  min-width: 12px;
  height: 12px;
  padding: 0 4px;
  font-size: 9px;
  line-height: 12px;
}
/deep/ .ant-badge-dot {
  width: 10px;
  height: 10px;
}
</style>
