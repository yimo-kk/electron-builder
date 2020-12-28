<template>
  <div class="current_chat">
    <div
      v-if="loading"
      style=" position: absolute;top: 50%;left: 50%;z-index: 11;"
    >
      <a-spin></a-spin>
    </div>
    <div v-if="currentChatList.length && !loading" class="full_height">
      <a-row class="full_height">
        <a-col :span="5" class="chat_left">
          <div
            v-for="(item, index) in currentChatList"
            :key="item.uid"
            :class="[
              item.uid == currentUser.activtyUid ? 'activt_item' : '',
              'current_list',
            ]"
            style="padding:5px 10px 5px 10px"
            @contextmenu.prevent="currentChatListItem"
          >
            <div>
              <ListItem
                :data-index="index"
                :index="index"
                :groupData="item"
                :isHeadImg="false"
                @selectGroup="selectGroup"
                @handleRight="handleRight"
              ></ListItem>
            </div>
          </div>
        </a-col>
        <a-col :span="centerNum" class="full_height">
          <div class="chat_content">
            <a-page-header
              style="background:#f5f5f5;border-bottom: .5px solid #efefef"
              :title="currentUser.activtyeUsername"
            >
              <template slot="tags">
                <level :num="parseInt(currentUser.level)"></level>
              </template>
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
              ref="chatBox"
              :isName="false"
              :chatLogList="currentChatLogList"
              @sendMessage="sendMessage"
              @uploadImage="uploadImage"
              @uploadFile="uploadFile"
              :isMore="isMore"
              :count="count"
              @getLog="getLog"
              v-model="text"
              @textToSpeech="textToSpeech"
            ></ChatBox>
          </div>
        </a-col>
        <a-col :span="rightNum">
          <transition name="bounce">
            <div v-show="rightNum">
              <a-tabs type="card" @change="changeTabs" v-model="activityId">
                <a-tab-pane key="1" :tab="$t('currentInfo.userInfo')">
                  <CurrentOperation
                    @multitapConversation="multitapConversation"
                    @closeChat="closeConversation"
                  ></CurrentOperation>
                </a-tab-pane>
                <a-tab-pane key="2" :tab="$t('currentInfo.quickReply')">
                  <div class="search" style="position:relative;">
                    <a-input-search
                      v-model="searchKeyword"
                      :placeholder="$t('currentInfo.pleaseEnterKeyword')"
                      :loading="isSearch"
                      enter-button
                      @search="onSearch"
                    />
                    <a-icon
                      type="close"
                      v-if="isSearchList"
                      style="position: absolute;bottom: -22px;right: 10px;"
                      @click="isSearchList = false"
                    />
                  </div>
                  <div v-if="isSearchList" class="question_list">
                    <div v-if="searchList.length" style="padding:10px">
                      <div
                        v-for="val in searchList"
                        :key="val.word_id"
                        style="padding:0 10px"
                      >
                        <a-tooltip placement="bottom" :mouseEnterDelay="1">
                          <template slot="title">
                            {{ val.word }}
                          </template>
                          <p
                            class="question dwote"
                            @click.stop="speedySennd(val.word)"
                          >
                            {{ val.title }}
                          </p>
                        </a-tooltip>
                      </div>
                    </div>
                    <div v-else class="not_available">
                      {{ $t('currentInfo.noRelatedQuestions') }}
                    </div>
                  </div>
                  <div v-else class="question_list">
                    <a-collapse accordion>
                      <a-collapse-panel
                        v-for="item in replyList"
                        :header="item.cate_name"
                        :key="item.cate_id.toString()"
                      >
                        <div>
                          <div v-for="val in item.word" :key="val.word_id">
                            <a-tooltip placement="bottom" :mouseEnterDelay="1">
                              <template slot="title">
                                {{ val.word }}
                              </template>
                              <p
                                class="question dwote"
                                @click="speedySennd(val.word)"
                              >
                                {{ val.title }}
                              </p>
                            </a-tooltip>
                          </div>
                        </div>
                      </a-collapse-panel>
                    </a-collapse>
                  </div>
                </a-tab-pane>
              </a-tabs>
            </div>
          </transition>
        </a-col>
      </a-row>
    </div>
    <!-- 无会话展示 -->
    <div v-else-if="!loading" style="paddingTop:35px">
      <a-empty
        :image-style="{
          height: '100%',
        }"
      >
        <span slot="description">{{ $t('noCurrent') }}</span>

        <a-button type="primary" @click="goAwaitChat">{{
          $t('receive')
        }}</a-button>
      </a-empty>
    </div>
    <div
      id="close"
      v-show="close"
      class="menu_close"
      :style="{ left: left + 'px', top: top + 'px' }"
    >
      <p @click.stop="closeConversation('')">
        <a-icon type="close-circle" style="color:#ccc" />
        {{ $t('currentInfo.closeSession') }}
      </p>
      <p @click.stop="multitapConversation">
        <customIcon
          type="icon-zhuanjie"
          style="fontSize:12px;color:#ccc"
        ></customIcon>
        {{ $t('currentInfo.transferSession') }}
      </p>
    </div>
    <!-- 转接 -->
    <a-modal v-model="isMultitap" :footer="null" width="50%">
      <Multitap
        :technologyList="technologyList"
        :multitapLoading="multitapLoading"
        :groupTitle="groupTitle"
        @confirm="confirm"
      ></Multitap>
    </a-modal>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import ListItem from '@/components/chatBox/listItem'
import ChatBox from '@/components/chatBox/chatBox'
import CurrentOperation from './component/currentOperation'
import Multitap from './component/multitap'
import common from '@/mixins/common'
import {
  getUserChatLog,
  closeChat,
  getSellerWordList,
  reLink,
  searchSellerWord,
} from '@/api/current.js'
import { mapMutations, mapActions } from 'vuex'
import {
  conversionFace,
  compressImage,
  isImage,
  conversion,
} from '@/utils/libs.js'
export default {
  name: 'CurrentChat',
  mixins: [common()],
  components: {
    ListItem,
    ChatBox,
    CurrentOperation,
    Multitap,
  },
  data() {
    return {
      isSearch: false,
      loading: false,
      centerNum: 13,
      rightNum: 6,
      currentChatLogList: [],
      replyList: [],
      close: false,
      left: 0,
      top: 0,
      currentId: null,
      isMultitap: false,
      multitapLoading: false,
      technologyList: [],
      activityId: '1',
      login_ip: '',
      area: '',
      searchList: [],
      isSearchList: false,
      searchKeyword: '',
      groupTitle: '',
      page: 1,
      count: 0,
      isMore: false,
      isTextToSpeech: false,
      text: '',
    }
  },
  computed: {
    closeUsers() {
      return this.$store.state.Socket.closeUsers
    },
    userMessage() {
      return this.$store.state.Socket.userMessage
    },
    refuseMessage() {
      return this.$store.state.Socket.refuseMessage
    },
    currentUser() {
      return this.$store.state.Socket.currentUser
    },
    currentChatList() {
      return this.$store.state.Socket.currentChatList
    },
    serviceMsg() {
      return this.$store.state.Socket.serviceMsg
    },
    userInfo() {
      return JSON.parse(localStorage.getItem(this.$route.query.seller_code))[
        this.$route.query.kefu_code
      ]
    },
  },
  watch: {
    // 收到用户发来消息
    userMessage: {
      handler(newVal) {
        // if(newVal.from_name === ){}
        let data = JSON.parse(JSON.stringify(newVal))
        if (data.from_name == this.currentUser.activtyeUsername) {
          this.$socket.emit('message', {
            cmd: 'serviceReadMsg',
            from_name: data.from_name,
            kefu_code: this.userInfo.kefu_code,
          })
          data.type === 3 && (data.message.play = false)
          if (data.type === 2) {
            data.progress_num = 0
          }
          data.type === 0 &&
            (data.message = conversionFace(data.content || data.message))
          data.create_time = data.createtime
          this.currentChatLogList.push(data)
        }
      },
      deep: true,
    },
    serviceMsg: {
      handler(newVal) {
        let my_send = JSON.parse(JSON.stringify(newVal))
        if (newVal.from_name == this.userInfo.kefu_name) {
          newVal.type === 3 && (my_send.message.play = false)
          newVal.type === 0 &&
            (my_send.message = conversionFace(newVal.message))
          if (newVal.type === 2) {
            my_send.progress_num = 0
          }
          my_send.create_time = newVal.createtime
          this.currentChatLogList.push(my_send)
        }
      },
      deep: true,
    },
    //转接接受或拒绝
    refuseMessage: {
      handler(newVal) {
        if (newVal.type) {
          if (newVal.kefu_code === this.userInfo.kefu_code) {
            let list = []
            JSON.parse(JSON.stringify(this.currentChatList)).forEach((item) => {
              if (item.username != newVal.username) {
                list.push(item)
              }
            })
            this.SET_CURRENT_CHAT_LIST(list)
            let params = {}
            if (this.currentChatList.length) {
              params = {
                activtyUid: this.currentChatList[0].uid,
                activtyeUsername: this.currentChatList[0].username,
                login_ip: this.currentChatList[0].login_ip,
                area: this.currentChatList[0].area,
                level: this.currentChatList[0].level,
                is_relink: this.currentChatList[0].is_relink,
              }
            } else {
              params = {
                activtyUid: null,
                activtyeUsername: '',
                login_ip: '',
                area: '',
                level: 0,
                is_relink: null,
              }
            }
            this.SET_CURRENT_USER(params)
            this.$message.success(newVal.message)
          }
        } else {
          this.$message.error(newVal.message)
        }
        let arr = JSON.parse(JSON.stringify(this.currentChatList)).map(
          (item) => {
            if (item.username == newVal.username) {
              item.isMultitap = false
            }
            return item
          }
        )
        this.SET_CURRENT_CHAT_LIST(arr)
      },
      deep: true,
    },
    // 当选中聊天人就拉相应的聊天记录
    currentUser: {
      handler(newVal) {
        if (newVal.activtyUid && newVal.activtyeUsername) {
          this.page = 1
          this.getUserChatLog({
            page: 1,
            username: newVal.activtyeUsername,
            kefu_code: this.userInfo.kefu_code,
            kefu_id: this.userInfo.kefu_id,
            is_relink: newVal.is_relink,
            seller_code: this.userInfo.seller_code,
          })
        }
      },
      deep: true,
    },
    closeUsers: {
      handler(newVal) {
        if (newVal.message.length) {
          let arr = []
          newVal.message.forEach((item) => {
            this.autoCloseChat(item.uid, item.username)
            JSON.parse(JSON.stringify(this.currentChatList)).forEach((ele) => {
              if (item.uid != ele.uid) {
                arr.push(ele)
              }
            })
          })
          this.SET_CURRENT_CHAT_LIST(arr)
        }
      },
      deep: true,
    },
  },
  methods: {
    ...mapActions(['getCurrentListData']),
    ...mapMutations(['SET_CURRENT_USER', 'SET_CURRENT_CHAT_LIST']),
    goAwaitChat() {
      this.$emit('goAwaitChat', { key: 'AwaitChat' })
    },
    changeTabs(val) {
      if (val == '2') {
        this.getSellerWordList()
      }
    },
    clickMore() {
      if (!this.rightNum) {
        this.rightNum = 6
        this.centerNum = 13
      } else {
        this.rightNum = 0
        this.centerNum = 19
      }
    },
    selectGroup(data) {
      if (this.currentUser.activtyUid == data.uid) return
      this.SET_CURRENT_USER({
        activtyUid: data.uid,
        activtyeUsername: data.username,
        login_ip: data.login_ip,
        area: data.area,
        level: data.level,
        is_relink: data.is_relink,
      })
    },
    getCurrentList() {
      this.loading = true
      this.getCurrentListData().then((result) => {
        this.loading = false
        if (this.currentChatList.length) {
          if (
            this.currentUser.activtyUid &&
            this.currentUser.activtyeUsername
          ) {
            this.currentChatLogList = []
          } else {
            this.SET_CURRENT_USER({
              activtyUid: this.currentChatList[0].uid,
              activtyeUsername: this.currentChatList[0].username,
              login_ip: this.currentChatList[0].login_ip,
              area: this.currentChatList[0].area,
              level: this.currentChatList[0].level,
              is_relink: this.currentChatList[0].is_relink,
            })
          }
          this.getUserChatLog({
            page: 1,
            username: this.currentUser.activtyeUsername,
            kefu_code: this.userInfo.kefu_code,
            kefu_id: this.userInfo.kefu_id,
            is_relink: this.currentUser.is_relink,
            seller_code: this.userInfo.seller_code,
          })
        } else {
          this.loading = false
        }
      })
    },
    getUserChatLog(params, callback) {
      this.isMore = true
      getUserChatLog(params)
        .then((result) => {
          this.count = result.count
          let array = result.data.map((item) => {
            if (item.type == 0) {
              item.content
                ? (item.content = conversionFace(item.content))
                : (item.message = conversionFace(item.message))
            } else if (item.type === 2) {
              item.progress = false
              item.progress_num = 0
            } else if (item.type == 3) {
              item.play = false
            }
            return item
          })
          if (this.page > 1) {
            this.currentChatLogList.unshift(...array)
            callback && callback()
            setTimeout(() => {
              this.isMore = false
            }, 200)
          } else {
            this.currentChatLogList = array
            this.isMore = false
          }
          this.SET_CURRENT_CHAT_LIST(
            this.arrayExists(this.currentChatList, params.username, false)
          )
        })
        .catch((err) => {
          setTimeout(() => {
            this.isMore = false
          }, 200)
        })
    },
    closeConversation(val) {
      let that = this
      let id = null
      let userNmae = ''
      if (val == 'col') {
        id = that.currentUser.activtyUid
        userNmae = that.currentUser.activtyeUsername
      } else {
        id = that.currentChatList[that.currentId].uid
        userNmae = that.currentChatList[that.currentId].username
      }
      this.$confirm({
        title: this.$t('prompt'),
        content: `${this.$t('confirmCancel')}${userNmae} ${this.$t(
          'conversation'
        )}`,
        okText: this.$t('determine'),
        cancelText: this.$t('cancel'),
        onOk() {
          closeChat({
            uid: id,
            kefu_code: that.userInfo.kefu_code,
          }).then((result) => {
            if (result.code == 0) {
              that.currentId = null
              let params = {
                from_avatar: that.userInfo.kefu_avatar,
                from_name: that.userInfo.kefu_name,
                kefu_code: that.userInfo.kefu_code,
                kefu_id: that.userInfo.kefu_id,
                seller_code: that.userInfo.seller_code,
                username: userNmae,
                cmd: 'service-score',
              }
              that.$socket.emit('message', params)
              that.$message.success(that.$t('deleteSuccess'))
              that.close = false
              if (
                id == that.currentUser.activtyUid &&
                userNmae == that.currentUser.activtyeUsername
              ) {
                that.SET_CURRENT_USER({
                  activtyUid: null,
                  activtyeUsername: '',
                  login_ip: '',
                  area: '',
                  level: 0,
                  is_relink: null,
                })
              }
              that.getCurrentList()
            }
          })
        },
      })
    },
    getSellerWordList() {
      getSellerWordList({
        seller_id: this.userInfo.seller_id,
        seller_code: this.userInfo.seller_code,
      }).then((result) => {
        this.replyList = result.data
      })
    },
    sendMessage(content, type) {
      if (type === 0 && !content.length) return
      let my_send = {
        cmd: 'service-msg',
        from_id: this.userInfo.kefu_id,
        from_name: this.userInfo.kefu_name,
        from_avatar: this.userInfo.kefu_avatar,
        kefu_code: this.userInfo.kefu_code,
        seller_code: this.userInfo.seller_code,
        to_name: this.currentUser.activtyeUsername,
        to_id: this.currentUser.activtyUid,
        message: content,
        type: type,
      }
      let sendMessage = JSON.parse(JSON.stringify(my_send))
      if (type === 0) {
        sendMessage.message = conversion(my_send.message)
        sendMessage.is_voice = this.isTextToSpeech ? 1 : 0
      }
      this.$socket.emit('message', sendMessage)
      this.text = ''
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
    uploadFile(data, type) {
      this.sendMessage(data, type)
    },
    confirm(val) {
      let id = null
      let level = 0
      let userNmae = ''
      if (this.currentId) {
        id = this.currentChatList[this.currentId].uid
        userNmae = this.currentChatList[this.currentId].username
        level = this.currentChatList[this.currentId].level
      } else {
        id = this.currentUser.activtyUid
        userNmae = this.currentUser.activtyeUsername
        level = this.currentUser.level
      }
      this.$socket.emit('message', {
        user_id: id,
        user_name: userNmae,
        from_kefu_id: this.userInfo.kefu_id,
        from_kefu_name: this.userInfo.kefu_name,
        from_kefu_code: this.userInfo.kefu_code,
        to_kefu_code: val.kefu_code,
        to_kefu_name: val.kefu_name,
        seller_code: this.userInfo.seller_code,
        cmd: 'service-relink',
        level,
      })
      this.currentId = null
      this.groupTitle = ''
      this.isMultitap = false
      this.$message.success(`等待${val.kefu_name}接受转接!`)
      let arr = JSON.parse(JSON.stringify(this.currentChatList))
      let list = arr.map((item) => {
        item.username == userNmae && (item.isMultitap = true)
        return item
      })
      this.SET_CURRENT_CHAT_LIST(list)
    },
    arrayExists(arr, value, bool) {
      let con_arr = JSON.parse(JSON.stringify(arr))
      let list = con_arr.map((item) => {
        item.username == value &&
          (item.noReadNum = bool ? item.noReadNum + 1 : 0)
        return item
      })
      return list
    },
    currentChatListItem(e) {
      this.currentId = e.target.dataset.index
    },
    handleRight(e) {
      this.close = true
      this.left = e.pageX
      this.top = e.pageY
    },
    multitapConversation() {
      this.close = false
      this.multitapLoading = true
      reLink({
        seller_id: this.userInfo.seller_id,
        kefu_code: this.userInfo.kefu_code,
      })
        .then((result) => {
          this.multitapLoading = false
          if (result.code === 0) {
            this.technologyList = result.data
            if (this.currentId) {
              this.groupTitle = this.currentChatList[this.currentId].username
            } else {
              this.groupTitle = this.currentUser.activtyeUsername
            }
          }
        })
        .catch((err) => {
          this.multitapLoading = false
        })
      this.isMultitap = true
    },
    onSearch(val) {
      this.isSearch = true
      if (!val) {
        this.searchList = []
        this.isSearch = false
        this.isSearchList = true
        return
      }
      searchSellerWord({
        seller_code: this.userInfo.seller_code,
        keywords: val,
      }).then((result) => {
        this.searchList = result.data
        this.isSearchList = true
        this.isSearch = false
      })
    },
    speedySennd(val) {
      this.searchKeyword = ''
      this.isSearchList = false
      // this.sendMessage(val, 0)
      this.text = val
    },
    getLog(e, fn) {
      this.isMore = true
      this.page++
      let scrollH = this.$refs.chatBox.$refs.chatMain.scrollHeight
      this.getUserChatLog(
        {
          is_relink: this.currentUser.is_relink,
          seller_code: this.userInfo.seller_code,
          page: this.page,
          username: this.currentUser.activtyeUsername,
          kefu_code: this.userInfo.kefu_code,
          kefu_id: this.userInfo.kefu_id,
        },
        () => {
          setTimeout(() => {
            e.target.scrollTo(0, e.target.scrollHeight - (scrollH + 30))
          })
        }
      )
    },
    textToSpeech(val) {
      this.isTextToSpeech = val
    },
    autoCloseChat(id, userNmae) {
      closeChat({
        uid: id,
        kefu_code: this.userInfo.kefu_code,
      })
        .then((result) => {
          if (result.code == 0) {
            let params = {
              from_avatar: this.userInfo.kefu_avatar,
              from_name: this.userInfo.kefu_name,
              kefu_code: this.userInfo.kefu_code,
              kefu_id: this.userInfo.kefu_id,
              seller_code: this.userInfo.seller_code,
              username: userNmae,
              cmd: 'service-score',
            }
            this.$socket.emit('message', params)
            if (
              id == this.currentUser.activtyUid &&
              userNmae == this.currentUser.activtyeUsername
            ) {
              this.SET_CURRENT_USER({
                activtyUid: null,
                activtyeUsername: '',
                login_ip: '',
                area: '',
                level: 0,
                is_relink: null,
              })
            }
          }
        })
        .catch((err) => {
          console.log(err)
        })
    },
  },
  mounted() {
    let oldArr = JSON.parse(JSON.stringify(this.currentChatList))
    this.getCurrentList()
    document.addEventListener('click', (e) => {
      // 下面这句代码是获取 点击的区域是否包含你的菜单，如果包含，说明点击的是菜单以外，不包含则为菜单以内
      let flag = e.target.contains(
        document.getElementsByClassName('menu_close')[0]
      )
      if (flag) return
      this.close = false
    })
  },
}
</script>

<style lang="less" scoped>
@import '@/style/currentChat.less';
</style>
