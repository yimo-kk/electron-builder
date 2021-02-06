<template>
  <div class="groupChat">
    <a-row class="full_height" v-if="chatList.length">
      <a-col :span="5" class="chat_left">
        <div v-if="chatList.length">
          <div
            v-for="item in chatList"
            :key="item.id"
            :class="[
              'hover_item',
              item.group_id == activityGroup.activityId ? 'activt_item' : '',
            ]"
          >
            <ListItem
              :isNum="$store.state.Setting.setting.group_receive?true:false"
              :groupData="item"
              @selectGroup="selectGroup"
            ></ListItem>
          </div>
        </div>
      </a-col>
      <a-col :span="centerNum" class="full_height">
        <div class="chat_content">
          <a-page-header
            style="background: #f5f5f5; border-bottom: 0.5px solid #efefef"
            :title="activityGroup.activityTitle"
          >
            <template slot="extra">
              <p
                key="1"
                class="more"
                @click="clickMore"
                :title="rightNum ? $t('putAway') : $t('unfold')"
              >
                <a-icon type="ellipsis" />
              </p>
            </template>
          </a-page-header>
          <ChatBox
            ref="groupChatBox"
            :chatLogList="chatLogList"
            @sendMessage="sendMessage"
            @uploadImage="uploadImage"
            @stopSpeak="stopSpeak"
            @kickOut="executionKickOut"
            @addBlacklist="addBlacklist"
            @removeblack="sendBlackMessage"
            @removeforbid="sendForbidMessage"
            @uploadFile="uploadFile"
            :isAdmin="activityGroup.isAdmin"
            :on_file="activityGroup.on_file"
            :on_voice="activityGroup.on_voice"
            :isMore="isMore"
            :count="count"
            :isTts="false"
            @getLog="getLog"
          ></ChatBox>
        </div>
      </a-col>
      <a-col :span="rightNum" style="    height: 100%;">
        <transition name="bounce">
          <div
            v-show="rightNum"
            style="height: 100%;display: flex;flex-direction: column;justify-content: space-between;"
          >
            <a-tabs type="card" v-model="activtTabs">
              <a-tab-pane key="1" :tab="$t('groupInfo.groupMember')">
                <div v-show="isGroupList" style="textAlign: center">
                  <a-spin tip />
                </div>
                <div
                  :class="[
                    'group_list',
                    activityGroup.isAdmin ? '' : 'list_height',
                    isOther ? 'other-max' : 'other-min',
                  ]"
                >
                  <div v-if="groupList.length && !isGroupList">
                    <div style="marginBottom:20px">
                      <a-checkbox-group
                        v-model="checkedList"
                        :options="groupList"
                        @change="onChangeCheckbox"
                        style="display: block"
                      >
                        <div
                          slot="label"
                          slot-scope="scope"
                          class="checkboxLabel"
                        >
                          <div
                            class="flex_up_down_center"
                            @contextmenu.prevent="updateInfo"
                          >
                            <div class="group_list_item">
                              <img
                                class="headimg"
                                :data-index="scope.value"
                                v-lazy="scope.headimg"
                                alt
                              />
                              <a-badge
                                :status="
                                  activityGroup.is_invite == 0
                                    ? 'success'
                                    : scope.online_status || scope.type
                                    ? 'success'
                                    : 'default'
                                "
                                :offset="[4, 12]"
                                :title="
                                  activityGroup.is_invite == 0
                                    ? 'success'
                                    : scope.online_status || scope.type
                                    ? $t('online')
                                    : $t('offline')
                                "
                              >
                              </a-badge>
                            </div>

                            <p
                              class="group_list_item_username"
                              :data-index="scope.value"
                            >
                              {{
                                scope.type
                                  ? scope.username +
                                    `${
                                      scope.isAdmin ? $t('groupInfo.admin') : ''
                                    }`
                                  : scope.nickname
                              }}
                              <customIcon
                                v-show="scope.forbid_id"
                                :title="
                                  scope.forbid_id ? $t('groupInfo.banned') : ''
                                "
                                type="icon-32jinyan"
                                style="fontsize: 12px"
                              ></customIcon>
                              <customIcon
                                v-show="scope.list_id"
                                :title="
                                  scope.list_id ? $t('groupInfo.blocked') : ''
                                "
                                type="icon-lahei"
                                style="fontsize: 12px"
                              ></customIcon>
                            </p>
                          </div>
                        </div>
                      </a-checkbox-group>
                    </div>
                  </div>
                  <p v-else-if="!isGroupList" style="textalign: center">
                    {{ $t('groupInfo.noGroupMembers') }}
                  </p>
                </div>
              </a-tab-pane>
            </a-tabs>
            <a-collapse
              accordion
              v-show="activityGroup.isAdmin"
              @change="
                () => {
                  isOther = !isOther
                }
              "
            >
              <a-collapse-panel
                :header="$t('currentInfo.otherOperations')"
                :key="1"
              >
                <div class="other">
                  <div>
                    <a-button @click="disableSendMsg">
                      <customIcon
                        :title="$t('groupInfo.mute')"
                        type="icon-32jinyan"
                        style="fontsize: 13px"
                      ></customIcon
                      >{{ $t('groupInfo.mute') }}
                    </a-button>
                  </div>
                  <div>
                    <a-button @click="removeforbid">
                      <customIcon
                        :title="$t('groupInfo.unmute')"
                        type="icon-yichu"
                        style="fontsize: 13px"
                      ></customIcon
                      >{{ $t('groupInfo.unmute') }}
                    </a-button>
                  </div>
                  <div>
                    <a-button @click="addBlacks">
                      <customIcon
                        :title="$t('groupInfo.addBlack')"
                        type="icon-lahei"
                        style="fontsize: 13px"
                      ></customIcon
                      >{{ $t('groupInfo.addBlack') }}
                    </a-button>
                  </div>
                  <div>
                    <a-button @click="removeblack">
                      <customIcon
                        :title="$t('groupInfo.removeBlack')"
                        type="icon-yichu"
                        style="fontsize: 13px"
                      ></customIcon>
                      {{ $t('groupInfo.removeBlack') }}
                    </a-button>
                  </div>
                  <div v-show="activityGroup.is_invite">
                    <a-button @click="operationGroupUser">
                      <a-icon type="minus-circle" style="fontsize: 16px" />
                      {{ $t('groupInfo.kickOut') }}
                    </a-button>
                  </div>
                  <div v-show="activityGroup.is_invite">
                    <a-button @click="addGroup">
                      <a-icon type="plus-circle" style="fontsize: 16px" />
                      {{ $t('groupInfo.pull') }}
                    </a-button>
                  </div>
                </div>
              </a-collapse-panel>
            </a-collapse>
          </div>
        </transition>
      </a-col>
    </a-row>
    <!-- 无会话展示 -->
    <div v-else style="paddingtop: 35px">
      <a-empty
        :image-style="{
          height: '100%',
        }"
      >
        <span slot="description">{{ $t('noGroup') }}</span>
      </a-empty>
    </div>
    <!-- 拉人进群 -->
    <a-modal
      :title="$t('groupInfo.AddGroupMembers')"
      v-model="isAddGroup"
      width="66%"
      @ok="handleAddGroup"
      :okText="$t('determine')"
      :cancelText="$t('cancel')"
    >
      <addGroupList
        :addGroupList="notGroupList"
        :selectAddlist="[]"
        :isAddGroup="isAddGroup"
        :isNotGroupList="isNotGroupList"
        @onChangeCheckbox="onChangeAddGroupUser"
        @addSearch="getNotGroupUsersList"
      ></addGroupList>
    </a-modal>
    <a-modal
      :title="isStopSpeak ? '禁言备注' : $t('groupInfo.addBlackRemark')"
      v-model="isAddBlack"
      width="550px"
      @ok="handleAddBlack"
      @cancel="handleCancel"
      :okText="$t('determine')"
      :cancelText="$t('cancel')"
    >
      <div class="flex_up_down_center time_style">
        <p class="remark_and_time">
          {{ isStopSpeak ? '禁言时间：' : $t('addBlackTime') }}
        </p>
        <addBalckTime
          :day="day"
          :hour="hour"
          :minute="minute"
          :permanentTime="permanent"
          :ispermanent="!isStopSpeak"
          @onChangeDay="
            (value) => {
              day = value
            }
          "
          @onChangeHour="
            (value) => {
              hour = value
            }
          "
          @onChangeMinute="
            (value) => {
              minute = value
            }
          "
          @permanent="
            (value) => {
              permanent = value
            }
          "
        ></addBalckTime>
      </div>
      <div class="flex_up_down_center">
        <p class="remark_and_time">
          {{
            isStopSpeak ? '禁言备注：' : `${$t('groupInfo.addBlackRemark')}:`
          }}
        </p>
        <a-textarea
          :placeholder="isStopSpeak ? '请输入禁言原因' : $t('groupInfo.reason')"
          v-model="blackRemark"
          :auto-size="{ minRows: 2, maxRows: 5 }"
          style="width: 70%;"
        />
      </div>
    </a-modal>
    <!-- 修改成员信息 -->
    <div
      v-show="isHeadPortrait"
      class="click_head_portrait"
      :style="{ left: left + 'px', top: top + 'px' }"
    >
      <p
        @click="
          () => {
            isEditNickName = true
          }
        "
      >
        {{ $t('updateNickName') }}
      </p>
    </div>
    <a-modal
      ref="updateNickName"
      v-dialogDrag
      :title="$t('updateNickName')"
      v-model="isEditNickName"
      @ok="ensure"
      :okText="$t('determine')"
      :cancelText="$t('cancel')"
    >
      <editMemberInfo
        v-if="isEditNickName"
        :updateUser="updateUser"
        @newNickName="
          (val) => {
            newName = val
          }
        "
      ></editMemberInfo>
    </a-modal>
  </div>
</template>

<script>
import moment from 'moment'
const { remote } = require('electron')
import ListItem from '@/components/chatBox/listItem'
import ChatBox from '@/components/chatBox/chatBox'
import addGroupList from './component/addGroupList'
import memberList from './component/memberList'
import editMemberInfo from './component/editMemberInfo'
import addBalckTime from './component/addBalckTime'
import common from '@/mixins/common'
import { mapMutations, mapActions, mapState } from 'vuex'
import { elementScrollTop } from '@/utils/libs'
import { compressImage, isImage } from '@/utils/libs.js'
import {
  getGroupChatLog,
  getGroupUsersList,
  prohibitSay,
  kickUsersGroup,
  getNotGroupUsersList,
  pullUsersGroup,
} from '@/api/group.js'
import chat from '@/mixins/chat'
export default {
  name: 'GroupChat',
  mixins: [common(), chat()],
  components: {
    ListItem,
    ChatBox,
    memberList,
    addGroupList,
    editMemberInfo,
    addBalckTime,
  },
  data() {
    return {
      addBalckTime: [],
      checkedList: [],
      isGroupList: false,
      isMore: false,
      rightNum: 0,
      centerNum: 19,
      chatLogList: [],
      groupList: [],
      selectGroupUserId: '',
      activtTabs: '1',
      handleGroupUser: [],
      isAddGroup: false,
      isNotGroupList: false,
      notGroupList: [],
      selectAddList: [],
      addGroupListUser: [],
      page: 1,
      count: 0,
      isAddBlack: false,
      blackRemark: '',
      blackdata: null,
      isHeadPortrait: false,
      left: null, //鼠标右键点击得位置
      top: null,
      isEditNickName: false, // 修改昵称弹框
      updateUser: {},
      newName: '',
      isStopSpeak: false,
      stopSpeakData: null,
      day: 0,
      hour: 0,
      minute: 0,
      permanent: false,
      isOther: false,
    }
  },
  computed: {
    chatList() {
      return this.$store.state.Socket.chatList
    },
    activityGroup() {
      return this.$store.state.Socket.activityGroup
    },
    pullUsersGroup() {
      return this.$store.state.Socket.pullUsersGroup
    },
    saveNickname() {
      return this.$store.state.Socket.saveNickname
    },
    userInfo() {
      return JSON.parse(localStorage.getItem(this.$route.query.seller_code))[
        this.$route.query.kefu_code
      ]
    },
  },
  watch: {
    '$store.state.Socket.groupMessage': {
      handler(newVal) {
        let data = JSON.parse(JSON.stringify(newVal))
        if (data.group_id == this.activityGroup.activityId) {
          this.$socket.emit('message', {
            cmd: 'groupReadMsg',
            group_id: this.activityGroup.activityId,
            kefu_id: this.userInfo.kefu_id,
          })
          data.type === 0 &&
            (data.message = this.conversionFace(data.content || data.message))
          data.type === 2 && (data.progress_num = 0)
          data.type === 3 && (data.message.play = false)
          data.create_time = newVal.createtime
          this.chatLogList.push(data)
        }
        let firstData = {}
        let newGroupChatList = []
        JSON.parse(JSON.stringify(this.chatList)).forEach((item) => {
          if (item.group_id == data.group_id) {
            item.lastMsg = {
              content: data.message,
              create_time: data.createtime,
              type: data.type,
            }
            firstData = item
          } else {
            newGroupChatList.push(item)
          }
        })
        newGroupChatList.unshift(firstData)
        this.SET_CHAT_LIST(newGroupChatList)
        let currentChatelement = document.getElementsByClassName('chat_left')[0]
        elementScrollTop(currentChatelement)
      },
      deep: true,
    },
    pullUsersGroup: {
      handler(newVal) {
        let arr = JSON.parse(JSON.stringify(newVal))
        arr.forEach((item, index) => {
          item.value = item.username
          item.nickname = item.username
        })
        this.groupList.push(...arr)
      },
      deep: true,
    },
    // 拉黑
    '$store.state.Socket.groupBlack': {
      handler(newVal) {
        let data = JSON.parse(JSON.stringify(newVal))
        this.operateGroup(data, 'list_id', true)
      },
      deep: true,
    },
    '$store.state.Socket.removeblack': {
      handler(newVal) {
        let data = JSON.parse(JSON.stringify(newVal))
        this.operateGroup(data, 'list_id', false)
      },
      deep: true,
    },
    '$store.state.Socket.userBlack': {
      handler(newVal) {
        let data = JSON.parse(JSON.stringify(newVal))
        data.forbid = 'forbid'
        this.chatLogList.push(data)
        // this.getGroupMemberList({
        //   group_id: this.activityGroup.activityId,
        //   seller_code: this.userInfo.seller_code,
        // })
      },
      deep: true,
    },
    // 禁言
    '$store.state.Socket.groupForbid': {
      handler(newVal) {
        let data = JSON.parse(JSON.stringify(newVal))
        this.operateGroup(data, 'forbid_id', true)
      },
      deep: true,
    },
    //解禁
    '$store.state.Socket.removeforbid': {
      handler(newVal) {
        let data = JSON.parse(JSON.stringify(newVal))
        this.operateGroup(data, 'forbid_id', false)
      },
      deep: true,
    },
    '$store.state.Socket.userForbid': {
      handler(newVal) {
        let data = JSON.parse(JSON.stringify(newVal))
        data.forbid = 'forbid'
        this.chatLogList.push(data)
        // this.getGroupMemberList({
        //   group_id: this.activityGroup.activityId,
        //   seller_code: this.userInfo.seller_code,
        // })
      },
      deep: true,
    },
    // 踢出群
    '$store.state.Socket.kickGroup': {
      handler(newVal) {
        let data = JSON.parse(JSON.stringify(newVal))
        data.forbid = 'forbid'
        this.chatLogList.push(data)
        if (this.activityGroup.activityId == newVal.group_id && this.rightNum) {
          this.groupList = this.groupList.filter((item, index) => {
            return item.username != newVal.username && item.uid != newVal.uid
          })
        }
      },
      deep: true,
    },
    activityGroup: {
      handler(newVal) {
        newVal.activityId &&
          this.getGroupChatLog({
            page: 1,
            group_id: newVal.activityId,
            kefu_id: this.userInfo.kefu_id,
            kefu_code: this.userInfo.kefu_code,
          })
        this.rightNum = 0
        this.centerNum = 19
      },
      deep: true,
    },
    '$store.state.Socket.userJoin': {
      handler(newVal) {
        if (this.activityGroup.activityId == newVal.group_id && this.rightNum) {
          let isExist = this.groupList.some((item) => {
            return item.username != newVal.username && item.uid != newVal.uid
          })
          if (isExist) {
            let data = JSON.parse(JSON.stringify(newVal))
            data.value = data.username + data.uid
            this.groupList.push(data)
          }
        }
      },
      deep: true,
    },
    //客服上线
    '$store.state.Socket.kefuOnline': {
      handler(newVal) {
        let data = JSON.parse(JSON.stringify(newVal))
        let isExist = this.groupList.some((item) => {
          return data.username == item.username && item.uid == newVal.kefu_id
        })
        if (this.activityGroup.activityId && !isExist) {
          data.groupKefu.forEach((item) => {
            if (this.activityGroup.activityId == item.group_id) {
              data.group_id = item.group_id
              data.isAdmin = item.isAdmin
            }
          })
          data.type = 1
          data.value = data.username
          data.uid = data.kefu_id
          this.groupList.unshift(data)
        }
      },
      deep: true,
    },
    '$store.state.Socket.userLeave': {
      handler(newVal) {
        this.groupList.forEach((item, index) => {
          if (
            this.activityGroup.activityId == newVal.group_id &&
            newVal.username == item.username
          ) {
            this.groupList.splice(index, 1)
          }
        })
      },
      deep: true,
    },
    '$store.state.Socket.kefuLeave': {
      handler(newVal) {
        this.groupList.forEach((item, index) => {
          if (item.kefu_code && newVal.kefu_code == item.kefu_code) {
            this.groupList.splice(index, 1)
          }
        })
      },
      deep: true,
    },
    saveNickname: {
      handler(newVal) {
        this.chatLogList.push({
          forbid: newVal.state == 2 ? 'forbid' : '',
          message: newVal.message,
        })
        this.groupList = this.groupList.map((item) => {
          if (
            this.activityGroup.activityId == newVal.group_id &&
            item.uid === newVal.uid
          ) {
            item.nickname = newVal.nickname
          }
          return item
        })
      },
      deep: true,
    },
    '$store.state.Socket.saveGroup': {
      handler(newVal) {
        let data = JSON.parse(JSON.stringify(newVal))
        if (this.activityGroup.activityId == data.group_id && this.rightNum) {
          this.groupList = this.groupList.map((item) => {
            if (item.type) {
              item.isAdmin = data.kefu_ids.includes(item.uid.toString())
            }
            return item
          })
        }
      },
      deep: true,
    },
  },
  methods: {
    ...mapMutations(['SET_CHAT_LIST', 'SET_ACTIVITY_GROUP']),
    ...mapActions(['getGroupList']),
    moment,
    sendMessage(content, type) {
      if (!content.length && type === 0) return
      let my_send = {
        cmd: 'user-group',
        message: content,
        from_id: this.userInfo.kefu_id,
        from_name: this.userInfo.kefu_name,
        from_avatar: this.userInfo.kefu_avatar,
        group_id: this.activityGroup.activityId,
        seller_code: this.userInfo.seller_code,
        kefu_code: this.userInfo.kefu_code,
        state: 1,
        type: type,
        from_ip: this.$store.state.Login.userIp.ip,
      }
      let sendMessage = JSON.parse(JSON.stringify(my_send))
      // type === 0 && (sendMessage.message = conversion(my_send.message))
      this.$socket.emit('message', sendMessage)
    },
    uploadImage(file, type) {
      if (!isImage(file.type)) {
        this.$toast(this.$t('selectImg'))
      } else {
        compressImage(
          file,
          (imgData) => {
            this.sendMessage(imgData, type)
          },
          (error) => {
            // 压缩出错
            this.$message.error(this.$t('sendErr'))
          }
        )
      }
    },
    clickMore() {
      if (!this.rightNum) {
        this.rightNum = 6
        this.centerNum = 13
        this.getGroupMemberList({
          group_id: this.activityGroup.activityId,
          seller_code: this.userInfo.seller_code,
        })
      } else {
        this.rightNum = 0
        this.centerNum = 19
      }
    },
    selectGroup(data) {
      if (this.activityGroup.activityId === data.group_id) return
      this.isMore = true
      this.SET_ACTIVITY_GROUP({
        activityId: data.group_id,
        activityTitle: data.group_name,
        is_invite: data.is_invite,
        on_file: data.on_file,
        on_voice: data.on_voice,
        img: data.group_avatar,
        isAdmin: data.isAdmin,
      })
      this.chatLogList = []
      this.checkedList = []
      this.page = 1
      if (this.chatList.length) {
        let chatListArr = this.arrayExists(this.chatList, data.group_id, false)
        this.SET_CHAT_LIST(chatListArr)
      }
      if (this.activtTabs == '1' && this.rightNum) {
        this.getGroupMemberList({
          group_id: this.activityGroup.activityId,
          seller_code: this.userInfo.seller_code,
        })
      }
    },
    getGroupChatLog(data, callback) {
      getGroupChatLog(data)
        .then((result) => {
          this.count = result.count
          let array = result.data.map((item) => {
            if (item.type == 0) {
              item.content
                ? (item.content = this.conversionFace(item.content))
                : (item.message = this.conversionFace(item.message))
            } else if (item.type == 2) {
              item.progress_num = 0
            } else if (item.type == 3) {
              item.play = false
            }
            return item
          })
          if (this.page > 1) {
            this.chatLogList.unshift(...array)
            callback()
            setTimeout(() => {
              this.isMore = false
            }, 200)
          } else {
            this.chatLogList = array
            this.isMore = false
          }
        })
        .catch((err) => {
          setTimeout(() => {
            this.isMore = false
          }, 200)
        })
    },
    getGroupMemberList(data) {
      this.groupList = []
      this.isGroupList = true
      getGroupUsersList(data)
        .then((result) => {
          this.isGroupList = false
          if (result.code === 0) {
            this.groupList = result.data.map((item) => {
              item.value = item.username + item.uid
              return item
            })
          }
        })
        .catch((err) => {
          this.isGroupList = false
        })
    },
    operationGroupUser() {
      if (this.handleGroupUser.length <= 0) {
        this.$message.error(this.$t('selectGroupMember'))
        return
      }
      let that = this
      this.$confirm({
        title: that.$t('prompt'),
        content: that.$t('kickTip'),
        okText: that.$t('determine'),
        ancelText: that.$t('cancel'),
        onOk() {
          let arr = that.handleGroupUser.map((item) => {
            let { uid, username } = item
            return { uid, username }
          })
          that.executionKickOut(arr)
        },
        onCancel() {},
      })
    },
    // 批量禁言
    disableSendMsg() {
      if (this.handleGroupUser.length <= 0) {
        this.$message.error(this.$t('selectGroupMember'))
        return
      }
      let that = this
      this.$confirm({
        title: that.$t('prompt'),
        content: that.$t('disableSendMsg'),
        okText: that.$t('determine'),
        ancelText: that.$t('cancel'),
        onOk() {
          let list = that.handleGroupUser.filter((item) => {
            if (item.type == 1) {
              return (
                !item.forbid_id && {
                  kefu_code: item.kefu_code,
                  username: item.username,
                  type: item.type,
                  uid: item.uid,
                }
              )
            } else {
              return (
                !item.forbid_id && { username: item.username, uid: item.uid }
              )
            }
          })

          that.stopSpeak(list)
        },
        onCancel() {},
      })
    },
    stopSpeak(data) {
      this.isStopSpeak = true
      this.isAddBlack = true
      this.stopSpeakData = data
    },
    // 批量解禁
    removeforbid() {
      if (this.handleGroupUser.length <= 0) {
        this.$message.error(this.$t('selectGroupMember'))
        return
      }
      let that = this
      this.$confirm({
        title: that.$t('prompt'),
        content: that.$t('dismiss'),
        okText: that.$t('determine'),
        cancelText: that.$t('cancel'),
        onOk() {
          let list = that.handleGroupUser.filter((item) => {
            if (item.type == 1) {
              return (
                item.forbid_id && {
                  kefu_code: item.kefu_code,
                  username: item.username,
                  type: item.type,
                  uid: item.uid,
                }
              )
            } else {
              return (
                item.forbid_id && { username: item.username, uid: item.uid }
              )
            }
          })
          that.sendForbidMessage(list)
          that.handleGroupUser = []
          that.checkedList = []
        },
      })
    },
    sendForbidMessage(arr) {
      this.$socket.emit('message', {
        cmd: 'removeforbid',
        seller_code: this.userInfo.seller_code,
        users: arr,
        from_name: this.userInfo.kefu_name,
        group_id: this.activityGroup.activityId,
      })
    },
    // 加入黑名单
    addBlacks() {
      if (this.handleGroupUser.length <= 0) {
        this.$message.error(this.$t('selectGroupMember'))
        return
      }
      let that = this
      this.$confirm({
        title: that.$t('prompt'),
        content: that.$t('addBlack'),
        okText: that.$t('determine'),
        cancelText: that.$t('cancel'),
        onOk() {
          let arr = that.handleGroupUser.map((item) => {
            if (item.type == 1) {
              return {
                ip: item.login_ip,
                kefu_code: item.kefu_code,
                username: item.username,
                type: item.type,
                uid: item.uid,
              }
            } else {
              return {
                ip: item.login_ip,
                username: item.username,
                type: item.type ? item.type : 0,
                uid: item.uid,
              }
            }
          })
          that.addBlacklist(arr)
        },
      })
    },
    handleAddBlack() {
      if (!this.day && !this.hour && !this.minute && !this.permanent) {
        this.$message.error(
          `${this.$t('pleaseSelect')} ${
            this.isStopSpeak
              ? this.$t('groupInfo.mute')
              : this.$t('groupInfo.blocked')
          } ${this.$t('time')} `
        )
        return
      }
      if (!this.blackRemark) {
        this.$message.error(
          `${this.$t('pleaseInput')} ${
            this.isStopSpeak
              ? this.$t('groupInfo.mute')
              : this.$t('groupInfo.blocked')
          } ${this.$t('theReason')}`
        )
        return
      }
      if (this.isStopSpeak) {
        let params = {
          cmd: 'forbid',
          day: this.day ? this.day : 0,
          hour: this.hour ? this.hour : 0,
          minute: this.minute ? this.minute : 0,
          remarks: this.blackRemark,
          oper_kefu_id: this.userInfo.kefu_id,
          seller_code: this.userInfo.seller_code,
          group_id: this.activityGroup.activityId,
          username: this.stopSpeakData,
          from_name: this.userInfo.kefu_name,
        }
        this.$socket.emit('message', params)
        this.handleGroupUser = []
        this.checkedList = []
        this.stopSpeakData = null
        this.isStopSpeak = false
        this.isAddBlack = false
      } else {
        let params = {
          cmd: 'black',
          type: this.permanent ? 1 : 0,
          day: this.day ? this.day : 0,
          hour: this.hour ? this.hour : 0,
          minute: this.minute ? this.minute : 0,
          remarks: this.blackRemark,
          oper_kefu_id: this.userInfo.kefu_id,
          seller_code: this.userInfo.seller_code,
          group_id: this.activityGroup.activityId,
          users: this.blackdata,
          from_name: this.userInfo.kefu_name,
        }
        this.$socket.emit('message', params)
        this.handleGroupUser = []
        this.blackdata = null
        this.isAddBlack = false
        this.checkedList = []
      }
      this.day = 0
      this.hour = 0
      this.minute = 0
      this.permanent = false
      this.blackRemark = ''
    },
    handleCancel() {
      this.day = 0
      this.hour = 0
      this.minute = 0
      this.permanent = false
      this.blackRemark = ''
    },
    addBlacklist(data) {
      this.isAddBlack = true
      this.blackdata = data
    },
    // 解除黑名单
    removeblack() {
      if (this.handleGroupUser.length <= 0) {
        this.$message.error(this.$t('selectGroupMember'))
        return
      }
      let that = this
      this.$confirm({
        title: that.$t('prompt'),
        content: that.$t('removeBlack'),
        okText: that.$t('determine'),
        cancelText: that.$t('cancel'),
        onOk() {
          let arr = that.handleGroupUser.map((item) => {
            if (item.type == 1) {
              return {
                ip: item.login_ip,
                kefu_code: item.kefu_code,
                username: item.username,
                type: item.type,
                uid: item.uid,
              }
            } else {
              return {
                ip: item.login_ip,
                username: item.username,
                uid: item.uid,
              }
            }
          })
          that.sendBlackMessage(arr)
          that.handleGroupUser = []
          that.checkedList = []
        },
      })
    },
    sendBlackMessage(arr) {
      this.$socket.emit('message', {
        cmd: 'removeblack',
        seller_code: this.userInfo.seller_code,
        users: arr,
        from_name: this.userInfo.kefu_name,
        group_id: this.activityGroup.activityId,
      })
    },
    executionKickOut(data) {
      this.$socket.emit('message', {
        group_id: this.activityGroup.activityId,
        kefu_name: this.userInfo.kefu_name,
        users: data,
        seller_code: this.userInfo.seller_code,
        cmd: 'kick-group',
      })
      this.handleGroupUser = []
      this.checkedList = []
    },
    getNotGroupUsersList(val = '') {
      this.isNotGroupList = true
      getNotGroupUsersList({
        seller_code: this.userInfo.seller_code,
        group_id: this.activityGroup.activityId,
        keywords: val,
      })
        .then((result) => {
          this.isNotGroupList = false
          if (result.code == 0) {
            let arr = result.data.map((item) => {
              item.value = item.uid
              return item
            })
            this.notGroupList = [...arr]
          }
        })
        .catch((err) => {
          this.isNotGroupList = false
        })
    },
    addGroup() {
      this.isAddGroup = true
      this.getNotGroupUsersList()
    },
    // 确定拉入群聊
    handleAddGroup(data) {
      if (this.addGroupListUser.length <= 0) {
        this.$message.error(this.$t('addGroupMember'))
        return
      }
      let arr = this.addGroupListUser.map((item) => {
        let { uid, username, headimg } = item
        return { uid, username, headimg }
      })
      this.$socket.emit('message', {
        cmd: 'pullUsersGroup',
        group_id: this.activityGroup.activityId,
        kefu_id: this.userInfo.kefu_id,
        seller_code: this.userInfo.seller_code,
        users: arr,
      })
      this.isAddGroup = false
    },
    onChangeAddGroupUser(vals) {
      this.addGroupListUser = this.notGroupList.filter((item) => {
        return vals.includes(item.uid)
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
    onChangeCheckbox(vals) {
      this.handleGroupUser = this.groupList.filter((item) => {
        return vals.includes(`${item.username}${item.uid}`)
      })
    },
    onChangeAddList(vals) {
      this.selectList = this.addGroupList.filter((item) => {
        return vals.includes(item.uid)
      })
    },
    uploadFile(data, type) {
      this.sendMessage(data, type)
    },
    getLog(e, fn) {
      this.isMore = true
      this.page++
      let scrollH = this.$refs.groupChatBox.$refs.chatMain.scrollHeight
      this.getGroupChatLog(
        {
          page: this.page,
          group_id: this.activityGroup.activityId,
          kefu_id: this.userInfo.kefu_id,
          kefu_code: this.userInfo.kefu_code,
        },
        () => {
          setTimeout(() => {
            e.target.scrollTo(0, e.target.scrollHeight - (scrollH + 30))
          })
        }
      )
    },
    initGroup() {
      this.isMore = true
      this.getGroupList({
        kefu_id: this.userInfo.kefu_id,
      }).then((result) => {
        if (this.$store.state.Socket.chatList.length) {
          if (!this.activityGroup.activityId) {
            this.SET_ACTIVITY_GROUP({
              activityId: this.chatList[0].group_id,
              activityTitle: this.chatList[0].group_name,
              is_invite: this.chatList[0].is_invite,
              on_file: this.chatList[0].on_file,
              on_voice: this.chatList[0].on_voice,
              img: this.chatList[0].group_avatar,
              isAdmin: this.chatList[0].isAdmin,
            })
            let arr = JSON.parse(JSON.stringify(this.chatList))
            arr[0].noReadNum = 0
            this.SET_CHAT_LIST(arr)
            this.chatLogList = []
            this.getGroupChatLog({
              page: 1,
              group_id: this.chatList[0].group_id,
              kefu_id: this.userInfo.kefu_id,
              kefu_code: this.userInfo.kefu_code,
            })
          } else {
            let arr = JSON.parse(JSON.stringify(this.chatList))
            let list = arr.map((item) => {
              if (item.group_id === this.activityGroup.activityId) {
                item.noReadNum = 0
                if (
                  item.group_name !== this.activityGroup.activityTitle ||
                  item.is_invite !== this.activityGroup.is_invite ||
                  item.on_file !== this.activityGroup.on_file ||
                  item.on_voice !== this.activityGroup.on_voice ||
                  item.img !== this.activityGroup.group_avatar
                ) {
                  this.SET_ACTIVITY_GROUP({
                    activityId: this.activityGroup.activityId,
                    activityTitle: item.group_name,
                    is_invite: item.is_invite,
                    on_file: item.on_file,
                    on_voice: item.on_voice,
                    img: item.group_avatar,
                    isAdmin: item.isAdmin,
                  })
                }
              }
              return item
            })
            this.SET_CHAT_LIST(list)
            this.getGroupChatLog({
              page: 1,
              group_id: this.activityGroup.activityId,
              kefu_id: this.userInfo.kefu_id,
              kefu_code: this.userInfo.kefu_code,
            })
            this.chatLogList = []
          }
        }
      })
    },
    updateInfo(e) {
      if (!e.target.dataset.index) return
      let obj = {}
      this.groupList.forEach((item) => {
        item.username == e.target.dataset.index && (obj = item)
      })
      if (!obj.kefu_code || !obj.type) {
        this.isHeadPortrait = true
        this.left = e.pageX
        this.top = e.pageY
        this.updateUser = obj
      }
    },
    ensure() {
      if (!this.newName) {
        this.$message.error(this.$t('inputName'))
        return
      }
      this.$socket.emit('message', {
        cmd: 'saveNickname',
        uid: this.updateUser.uid,
        nickname: this.newName,
        oldNickname: this.updateUser.nickname[this.userInfo.seller_code],
        kefu_name: this.userInfo.kefu_name,
        username: this.updateUser.username,
        seller_code: this.userInfo.seller_code,
        group_id: this.activityGroup.activityId,
      })
      this.isEditNickName = false
    },
    contextmenuE() {
      var m = remote.Menu.buildFromTemplate(rigthTemplate)
      window.addEventListener('contextmenu', function(e) {
        //阻止当前窗口默认事件
        e.preventDefault()
        //把菜单模板添加到右键菜单
        m.popup({ window: remote.getCurrentWindow() })
      })
    },
    operateGroup(data, opt, bool) {
      data.forbid = 'forbid'
      this.chatLogList.push(data)
      if (this.activityGroup.activityId == data.group_id && this.rightNum) {
        this.groupList = this.groupList.map((item) => {
          if (item.uid == data.uid && item.username == data.username) {
            item[opt] = bool
          }
          return item
        })
      }
    },
  },
  mounted() {
    this.menuNotClick()
    this.initGroup()
  },
}
</script>

<style lang="less" scoped>
@import '@/style/index.less';
@import '@/style/groupChat.less';
</style>
