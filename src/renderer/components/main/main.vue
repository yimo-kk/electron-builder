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
                  :count="$store.getters.currentNum"
                  :overflow-count="99"
                  :offset="[0, -18]"
                >
                </a-badge>
              </div>
            </a-menu-item>
            <a-menu-item key="AwaitChat">
              <div class="flex_center">
                <customIcon type="icon-dengdai" class="icon_style"></customIcon>
                <p>{{ $t('topTitle.awaitChat') }}</p>
                <a-badge
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
  },
  data() {
    return {
      selectedKey: 'CurrentChat',
    }
  },
  computed: {
    relinkMessage() {
      return this.$store.state.Socket.relinkMessage
    },
    userMessage() {
      return this.$store.state.Socket.userMessage
    },
    refuseMessage() {
      return this.$store.state.Socket.refuseMessage
    },
    groupMessage() {
      return this.$store.state.Socket.groupMessage
    },
    awaitList() {
      return this.$store.state.Socket.awaitList
    },
    currentChatList() {
      return this.$store.state.Socket.currentChatList
    },
    groupChatNum() {
      return this.$store.state.Socket.groupChatNum
    },
    oldUser() {
      return this.$store.state.Socket.oldUser
    },
    chatList() {
      return this.$store.state.Socket.chatList
    },
    userInfo() {
      return JSON.parse(localStorage.getItem(this.$route.query.seller_code))[
        this.$route.query.kefu_code
      ]
    },
    currentUser() {
      return this.$store.state.Socket.currentUser
    },
  },
  sockets: {
    // connect:查看socket是否渲染成功
    connect() {
      this.$socket.emit('init', {
        seller_code: this.userInfo.seller_code,
        kefu_code: this.userInfo.kefu_code,
      })
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
          })
      },
      deep: true,
    },
    oldUser: {
      handler(newVal) {
        this.play()
        this.$electron.ipcRenderer.send('message_prompt')
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
            // level:0
          })
        } else if (!bool) {
          this.SET_CURRENT_USER({
            activtyUid: this.currentChatList[0].uid,
            activtyeUsername: this.currentChatList[0].username,
            login_ip: this.currentChatList[0].login_ip,
            area: this.currentChatList[0].area,
            // level: this.currentChatList[0].level,
          })
        }
      },
    },
    // 收到转接
    relinkMessage: {
      handler(newVal) {
        let val = JSON.parse(JSON.stringify(newVal))
        if (val.kefu_code == this.userInfo.kefu_code) {
          this.play()
          this.$electron.ipcRenderer.send('message_prompt')
          // 暂时隐藏系统通知
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
    userMessage: {
      handler(newVal) {
        let data = JSON.parse(JSON.stringify(newVal))
        // 消息声音提示和任务栏闪烁
        if (data.from_name !== this.userInfo.kefu_name) {
          this.play()
          this.$electron.ipcRenderer.send('message_prompt')
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
    groupMessage: {
      handler(newVal) {
        let data = JSON.parse(JSON.stringify(newVal))
        if (data.from_name !== this.userInfo.kefu_name) {
          this.play()
          this.$electron.ipcRenderer.send('message_prompt')
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
    ...mapActions(['getGroupList', 'getAwaitList', 'getMessageList']),
    ...mapMutations([
      'SET_CHAT_LIST',
      'SET_CURRENT_USER',
      'SET_CURRENT_CHAT_LIST',
      'SET_CURRENT_CHAT_LIST_PUSH',
      'SET_GROUP_CHAT_NUM',
      'SET_STATUS',
      'SET_ACTIVITY_GROUP',
      'SET_CHAT_TIME',
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
      this.setStatus(1)
    },
  },
  mounted() {
    this.getMessageList({
      seller_code: this.userInfo.seller_code,
    })
    this.updateKefuStatus()
    this.getGroupList({ kefu_id: this.userInfo.kefu_id })
    // 等待接入
    this.getAwaitList({
      seller_code: this.userInfo.seller_code,
      username: '',
    })
    this.$electron.ipcRenderer.on('show_tab', (data, val) => {
      this.selectedKey = val
    })
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
