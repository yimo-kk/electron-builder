<template>
  <div class="groupChat">
    <a-row style="height: 100%" v-if="$store.state.Socket.chatList.length">
      <a-col :span="5" class="chat_left">
        <div v-if="$store.state.Socket.chatList.length">
          <div
            v-for="item in this.$store.state.Socket.chatList"
            :key="item.id"
            :class="[
              'hover_item',
              item.group_id == activityGroup.activityId ? 'activt_item' : '',
            ]"
          >
            <ListItem :groupData="item" @selectGroup="selectGroup"></ListItem>
          </div>
        </div>
        <!-- <div v-else class="list_loading">
          <a-spin :spinning="list_loading"></a-spin>
        </div> -->
      </a-col>
      <a-col :span="centerNum" style="height: 100%">
        <div class="chat_content">
          <a-page-header
            style="background:#f5f5f5;border-bottom: .5px solid #efefef"
            :title="activityGroup.activityTitle"
          >
            <template slot="extra">
              <p
                key="1"
                class="more"
                @click="clickMore"
                :title="rightNum ? $t('putAway') :  $t('unfold') "
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
            @uploadFile='uploadFile'
            :isAdmin="isAdmin"
            :on_file='activityGroup.on_file'
            :on_voice='activityGroup.on_voice'
            :isMore='isMore'
            :count='count'
            @getLog='getLog'
          ></ChatBox>
        </div>
      </a-col>
      <a-col :span="rightNum">
        <transition name="bounce">
          <div v-show="rightNum">
            <a-tabs type="card" v-model="activtTabs">
              <a-tab-pane key="1" :tab="$t('groupInfo.groupMember')">
                <div v-show="isGroupList" style="textAlign: center">
                  <a-spin tip />
                </div>
                <div class="group_list">
                  <div v-if="groupList.length && !isGroupList" >
                    <div >
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
                          <div style="display: flex; alignItems: center">
                            <div class="group_list_item">
                              <img class="headimg" v-lazy="scope.headimg" alt />
                              <a-badge
                                :status="
                                 activityGroup.is_invite==0 ?'success': scope.online_status || scope.type ? 'success' : 'default'
                                "
                                :offset="[4, 12]"
                                :title="activityGroup.is_invite==0 ?'success':scope.online_status || scope.type ? $t('online') : $t('offline')"
                              >
                              </a-badge>
                            </div>
                            <p
                              class="group_list_item_username "
                              :title="scope.username"
                            >
                              {{
                                `${scope.username}${
                                  scope.isAdmin ? $t('groupInfo.admin') : ""
                                }`
                              }}
                               <customIcon
                              v-if="scope.forbid"
                              :title="scope.forbid ? $t('groupInfo.banned') : ''"
                              type="icon-32jinyan"
                              style="fontsize: 12px"
                            ></customIcon>
                              <customIcon
                              v-if="scope.list_id"
                              :title="scope.list_id ?$t('groupInfo.blocked'): ''"
                              type="icon-lahei"
                              style="fontsize: 12px; "
                            ></customIcon>
                            </p>
                          </div>
                          
                        </div>
                      </a-checkbox-group>
                    </div>
                  </div>
                  <p v-else-if="!isGroupList" style="textAlign: center">
                    {{$t('groupInfo.noGroupMembers')}}
                  </p>
                </div>
                <a-collapse accordion v-if="isAdmin">
                  <a-collapse-panel :header="$t('currentInfo.otherOperations')" :key="1">
                    <div class="other">
                      <div>
                        <a-button @click="disableSendMsg">
                          <customIcon
                            :title="$t('groupInfo.mute')"
                            type="icon-32jinyan"
                            style="fontsize: 13px"
                          ></customIcon
                          >{{$t('groupInfo.mute')}}
                        </a-button>
                      </div>
                      <div>
                        <a-button @click="removeforbid">
                          <customIcon
                            :title="$t('groupInfo.unmute')"
                            type="icon-yichu"
                            style="fontsize: 13px"
                          ></customIcon
                          >{{$t('groupInfo.unmute')}}
                        </a-button>
                      </div>
                      <div>
                        <a-button @click="addBlacks">
                          <customIcon
                            :title="$t('groupInfo.addBlack')"
                            type="icon-lahei"
                            style="fontsize: 13px"
                          ></customIcon
                          >{{$t('groupInfo.addBlack')}}
                        </a-button>
                      </div>
                      <div>
                        <a-button @click="removeblack">
                          <customIcon
                            :title="$t('groupInfo.removeBlack')"
                            type="icon-yichu"
                            style="fontsize: 13px"
                          ></customIcon
                          > {{$t('groupInfo.removeBlack')}}
                        </a-button>
                      </div>
                      <div v-show="activityGroup.is_invite">
                        <a-button @click="operationGroupUser">
                          <a-icon type="minus-circle" style="fontsize: 16px" />
                          {{$t('groupInfo.kickOut')}}
                        </a-button>
                      </div>
                      <div v-show="activityGroup.is_invite">
                        <a-button @click="addGroup">
                          <a-icon type="plus-circle" style="fontsize: 16px" />
                          {{$t('groupInfo.pull')}}
                        </a-button>
                      </div>
                    </div>
                  </a-collapse-panel>
                </a-collapse>
              </a-tab-pane>
            </a-tabs>
          </div>
        </transition>
      </a-col>
    </a-row>
    <!-- 无会话展示 -->
    <div v-else style="paddingTop: 35px">
      <a-empty
        :image-style="{
          height: '100%',
        }"
      >
        <span slot="description">{{$t('noGroup')}}</span>
      </a-empty>
    </div>
    <!-- 拉人进群 -->
    <a-modal
      :title="$t('groupInfo.AddGroupMembers')"
      v-model="isAddGroup"
      width='66%'
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
        @addSearch='getNotGroupUsersList'
      ></addGroupList>
    </a-modal>
    <a-modal
    :title="$t('groupInfo.addBlackRemark')"
      v-model="isAddBlack"
      @ok="handleAddBlack"
      :okText="$t('determine')"
      :cancelText="$t('cancel')"
      >
      <a-textarea
      :placeholder="$t('groupInfo.reason')"
      v-model="blackRemark"
      :auto-size="{ minRows: 2, maxRows: 6 }"
    />
    </a-modal>
  </div>
</template>

<script>
import ListItem from "@/components/chatBox/listItem";
import ChatBox from "@/components/chatBox/chatBox";
import addGroupList from "./component/addGroupList";
import memberList from "./component/memberList";
import common from "@/mixins/common";
import { mapMutations, mapActions } from "vuex";
import {
  conversionFace,
  compressImage,
  isImage,
  conversion,
} from "@/utils/libs.js";
import {
  getGroupChatLog,
  getGroupUsersList,
  prohibitSay,
  kickUsersGroup,
  getNotGroupUsersList,
  pullUsersGroup,
} from "@/api/group.js";
export default {
  name: "GroupChat",
  mixins: [common()],
  components: {
    ListItem,
    ChatBox,
    memberList,
    addGroupList,
  },
  data() {
    return {
      checkedList: [],
      isGroupList: false,
      isMore: false,
      rightNum: 0,
      centerNum: 19,
      chatLogList: [],
      groupList: [],
      selectGroupUserId: "",
      activtTabs: "1",
      handleGroupUser: [],
      isAddGroup: false,
      isNotGroupList: false,
      notGroupList: [],
      selectAddList: [],
      addGroupListUser: [],
      isAdmin: false,
      page:1,
      count:0,
      isAddBlack:false,
      blackRemark:'',
      blackdata:null,
    };
  },
  computed: {
    groupMessage() {
      return this.$store.state.Socket.groupMessage;
    },
    activityGroup() {
      return this.$store.state.Socket.activityGroup;
    },
    groupBlack() {
      return this.$store.state.Socket.groupBlack;
    },
    userBlack() {
      return this.$store.state.Socket.userBlack;
    },
    groupForbid() {
      return this.$store.state.Socket.groupForbid;
    },
    userForbid() {
      return this.$store.state.Socket.userForbid;
    },
    kickGroup() {
      return this.$store.state.Socket.kickGroup;
    },
    userJoin() {
      return this.$store.state.Socket.userJoin;
    },
    pullUsersGroup() {
      return this.$store.state.Socket.pullUsersGroup;
    },
    userLeave() {
      return this.$store.state.Socket.userLeave;
    },
    
    kefuLeave() {
      return this.$store.state.Socket.kefuLeave;
    },
    userInfo(){
      return JSON.parse(localStorage.getItem(this.$route.query.seller_code))[this.$route.query.kefu_code]
    }
  },
  watch: {
    groupMessage: {
      handler(newVal) {
        let data = JSON.parse(JSON.stringify(newVal));
        if (data.group_id == this.activityGroup.activityId) {
           this.$socket.emit("message", {
             cmd:'groupReadMsg',
             group_id: this.activityGroup.activityId,
             kefu_id:this.userInfo.kefu_id
           });
          data.type === 3 && (data.message.play = false);
          data.type === 0 &&
            (data.message = conversionFace(data.content || data.message));
          data.create_time = newVal.createtime
          this.chatLogList.push(data);
        }
      },
      deep: true,
    },
    pullUsersGroup:{
      handler(newVal){
        let arr = JSON.parse(JSON.stringify(newVal))
        arr.forEach((item, index) => {
              item.value = ++this.groupList.length;
            });
        this.groupList.push(...arr)
      },
      deep:true
    },
    // 拉黑
    groupBlack: {
      handler(newVal) {
        let data = JSON.parse(JSON.stringify(newVal));
        data.forbid = "forbid";
        this.chatLogList.push(data);
        this.getGroupMemberList({
          group_id: this.activityGroup.activityId,
          seller_code: this.userInfo.seller_code,
        });
      },
      deep: true,
    },
    userBlack: {
      handler(newVal) {
        let data = JSON.parse(JSON.stringify(newVal));
        data.forbid = "forbid";
        this.chatLogList.push(data);
        this.getGroupMemberList({
          group_id: this.activityGroup.activityId,
          seller_code: this.userInfo.seller_code,
        });
      },
      deep: true,
    },
    userForbid: {
      handler(newVal) {
        let data = JSON.parse(JSON.stringify(newVal));
        data.forbid = "forbid";
        this.chatLogList.push(data);
        this.getGroupMemberList({
          group_id: this.activityGroup.activityId,
          seller_code: this.userInfo.seller_code,
        });
      },
      deep: true,
    },
    // 禁言
    groupForbid: {
      handler(newVal) {
        let data = JSON.parse(JSON.stringify(newVal));
        data.forbid = "forbid";
        this.chatLogList.push(data);
        this.getGroupMemberList({
          group_id: this.activityGroup.activityId,
          seller_code: this.userInfo.seller_code,
        });
      },
      deep: true,
    },
     // 踢出群
    kickGroup: {
      handler(newVal) {
       let data = JSON.parse(JSON.stringify(newVal));
        data.forbid = "forbid";
        this.chatLogList.push(data);
        this.getGroupMemberList({
          group_id: this.activityGroup.activityId,
          seller_code: this.userInfo.seller_code,
        });
      },
      deep: true,
    },
    activityGroup:{
      handler(newVal){
         this.getGroupChatLog({
              page:1,
              group_id:newVal.activityId,
              kefu_id: this.userInfo.kefu_id,
              kefu_code: this.userInfo.kefu_code,
            });
          this.rightNum = 0;
          this.centerNum = 19;
      },
      deep:true
    },
    userJoin:{
      handler(newVal){
      this.getGroupMemberList({
          group_id: this.activityGroup.activityId,
          seller_code: this.userInfo.seller_code,
        });

      },
      deep:true
    },
    userLeave:{
      handler(newVal){
        this.groupList.forEach((item,index)=>{
          if( this.activityGroup.activityId == newVal.group_id && newVal.username == item.username){
            this.groupList.splice(index,1)
          }
        })
      },
      deep:true
    },
    kefuLeave:{
        handler(newVal){
        this.groupList.forEach((item,index)=>{
          if(item.kefu_code && newVal.kefu_code == item.kefu_code){
            this.groupList.splice(index,1)
          }
        })
      },
      deep:true
    }

  },
  methods: {
    ...mapMutations(["SET_CHAT_LIST", "SET_ACTIVITY_GROUP"]),
    ...mapActions(["getGroupList"]),
    sendMessage(content, type) {
      if (!content.length && type === 0) return;
      let my_send = {
        cmd: "user-group",
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
      };
      let sendMessage = JSON.parse(JSON.stringify(my_send));
      type === 0 && (sendMessage.message = conversion(my_send.message));
      this.$socket.emit("message", sendMessage);
    },
    uploadImage(file, type) {
      if (!isImage(file.file.type)) {
        this.$toast(this.$t('selectImg'));
      } else {
        compressImage(
          file.file,
          (imgData) => {
            this.sendMessage(imgData, type);
          },
          (error) => {
            // 压缩出错
            this.$message.error(this.$t('sendErr'));
          }
        );
      }
    },
    clickMore() {
      if (!this.rightNum) {
        this.rightNum = 6; 
        this.centerNum = 13;
        this.getGroupMemberList({
          group_id: this.activityGroup.activityId,
          seller_code: this.userInfo.seller_code,
        });
      } else {
        this.rightNum = 0;
        this.centerNum = 19;
      }
    },
    selectGroup(data) {
      if (this.activityGroup.activityId === data.group_id) return;
       this.isMore = true
      this.SET_ACTIVITY_GROUP({
        activityId: data.group_id,
        activityTitle: data.group_name,
        is_invite: data.is_invite,
        on_file:data.on_file,
        on_voice:data.on_voice
      });
      this.chatLogList = [];
      this.page = 1
      if (this.$store.state.Socket.chatList.length) {
        let chatList = this.arrayExists(
          this.$store.state.Socket.chatList,
          data.group_id,
          false
        );
        this.SET_CHAT_LIST(chatList);
      }
      if (this.activtTabs == "1" && this.rightNum) {
        this.getGroupMemberList({
          group_id: this.activityGroup.activityId,
          seller_code: this.userInfo.seller_code,
        });
      }
    },
    getGroupChatLog(data,callback) {
      getGroupChatLog(data)
        .then((result) => {
          this.count = result.count
          // this.on_file =result.group.on_file?result.group.on_file:0
          // this.on_voice=result.group.on_voice?result.group.on_voice:0
          this.isAdmin = result.isAdmin;
         let array = result.data.map((item) => {
            if (item.type == 0) {
              item.content
                ? (item.content = conversionFace(item.content))
                : (item.message = conversionFace(item.message));
            }else if (item.type == 3) {
              item.play = false;
            }
            return item;
          });
           if(this.page > 1){
             this.chatLogList.unshift(...array)
              callback()
              setTimeout(()=>{
                this.isMore = false
             },200)
           }else {
              this.chatLogList = array
               this.isMore = false
           }
            
        })
        .catch((err) => {
          setTimeout(()=>{
                this.isMore = false
             },200)
        });
    },
    getGroupMemberList(data) {
      this.groupList = [];
      this.isGroupList = true;
      getGroupUsersList(data)
        .then((result) => {
          this.isGroupList = false;
          if (result.code === 0) {
            result.data.forEach((item, index) => {
              item.value = index;
            });
            this.groupList = result.data;
          }
        })
        .catch((err) => {
          this.isGroupList = false;
        });
    },
    operationGroupUser() {
      if (this.handleGroupUser.length <= 0) {
        this.$message.error(this.$t('selectGroupMember'));
        return;
      }
      let arr = this.handleGroupUser.map((item) => {
        let { uid, username } = item;
        return { uid, username };
      });
      this.executionKickOut(arr);
    },
    // 批量禁言
    disableSendMsg() {
      if (this.handleGroupUser.length <= 0) {
        this.$message.error(this.$t('selectGroupMember'));
        return;
      }
      let arr = this.handleGroupUser.map((item) => {
        if (item.type == 1) {
          return {
            kefu_code: item.kefu_code,
            username: item.username,
            type: item.type,
          };
        } else {
          return { username: item.username };
        }
      });
      this.stopSpeak(arr);
    },
    //禁言
    stopSpeak(arr) {
      this.$socket.emit("message", { 
        cmd: "forbid",
        seller_code: this.userInfo.seller_code,
        group_id: this.activityGroup.activityId,
        username: arr,
        from_name: this.userInfo.kefu_name,
      });
      this.handleGroupUser = [];
      this.checkedList = [];
    },
    // 解禁
    removeforbid() {
      if (this.handleGroupUser.length <= 0) {
        this.$message.error(this.$t('selectGroupMember'));
        return;
      }
      let arr = this.handleGroupUser.map((item) => {
        if (item.type == 1) {
          return {
            kefu_code: item.kefu_code,
            username: item.username,
            type: item.type,
          };
        } else {
          return { username: item.username };
        }
      });
      this.sendForbidMessage(arr);
      this.handleGroupUser = [];
      this.checkedList = [];
    },
    sendForbidMessage(arr) {
      this.$socket.emit("message", {
        cmd: "removeforbid",
        seller_code: this.userInfo.seller_code,
        users: arr,
        from_name: this.userInfo.kefu_name,
        group_id: this.activityGroup.activityId,
      });
    },
    // 加入黑名单
    addBlacks() {
      if (this.handleGroupUser.length <= 0) {
        this.$message.error(this.$t('selectGroupMember'));
        return;
      }
      let arr = this.handleGroupUser.map((item) => {
        if (item.type == 1) {
          return {
            ip: item.login_ip,
            kefu_code: item.kefu_code,
            username: item.username,
            type: item.type,
            uid:item.uid
          };
        } else {
          return { ip: item.login_ip, username: item.username,uid:item.uid };
        }
      });
      this.addBlacklist(arr);
    },
    handleAddBlack(){
      let params = {
        cmd: "black",
        remarks:this.blackRemark,
        oper_kefu_id: this.userInfo.kefu_id,
        seller_code: this.userInfo.seller_code,
        group_id: this.activityGroup.activityId,
        users: this.blackdata,
        from_name: this.userInfo.kefu_name,
      };
      this.$socket.emit("message", params);
      this.handleGroupUser = [];
      this.blackRemark=''
        this.blackdata =null
      this.isAddBlack = false
      this.checkedList = [];
    },
    addBlacklist(data) {
      this.isAddBlack= true
      this.blackdata = data
    },
    // 解除黑名单
    removeblack() {
      if (this.handleGroupUser.length <= 0) {
        this.$message.error(this.$t('selectGroupMember'));
        return;
      }
      let arr = this.handleGroupUser.map((item) => {
        if (item.type == 1) {
          return {
            ip: item.login_ip,
            kefu_code: item.kefu_code,
            username: item.username,
            type: item.type,
            uid:item.uid
          };
        } else {
          return { ip: item.login_ip, username: item.username,uid:item.uid };
        }
      });
      this.sendBlackMessage(arr);
      this.handleGroupUser = [];
      this.checkedList = [];
    },
    sendBlackMessage(arr) {
      this.$socket.emit("message", {
        cmd: "removeblack",
        seller_code: this.userInfo.seller_code,
        users: arr,
        from_name: this.userInfo.kefu_name,
        group_id: this.activityGroup.activityId,
      });
    },
    executionKickOut(data) {
      this.$socket.emit('message', {
            group_id: this.activityGroup.activityId,
            kefu_name:this.userInfo.kefu_name,
            users:data,
            seller_code: this.userInfo.seller_code,
            cmd:'kick-group'
        });
        this.handleGroupUser = [];
        this.getGroupMemberList({
          group_id: this.activityGroup.activityId,
          seller_code: this.userInfo.seller_code,
        });


      // kickUsersGroup({
      //   group_id: this.activityGroup.activityId,
      //   users: data,
      // }).then((result) => {
      // });
      this.checkedList=[]
    },
    getNotGroupUsersList(val='') {
      this.isNotGroupList = true;
      getNotGroupUsersList({
        seller_code: this.userInfo.seller_code,
        group_id: this.activityGroup.activityId,
        keywords: val,
      })
        .then((result) => {
          this.isNotGroupList = false;
          if (result.code == 0) {
            let arr = result.data.map((item) => {
              item.value = item.uid;
              return item;
            });
            this.notGroupList = [...arr];
          }
        })
        .catch((err) => {
          this.isNotGroupList = false;
        });
    },
    addGroup() {
      this.isAddGroup = true;
      this.getNotGroupUsersList();
    },
    // 确定拉入群聊
    handleAddGroup(data) {
      if (this.addGroupListUser.length <= 0) {
        this.$message.error(this.$t('addGroupMember'));
        return;
      }
      let arr = this.addGroupListUser.map((item) => {
        let { uid, username, headimg } = item;
        return { uid, username, headimg };
      });
     this.$socket.emit("message", {
        cmd: "pullUsersGroup",
        group_id: this.activityGroup.activityId,
        kefu_id: this.userInfo.kefu_id,
        seller_code: this.userInfo.seller_code,
        users: arr,
      });
      this.isAddGroup = false;
      // pullUsersGroup({
      //   group_id: this.activityGroup.activityId,
      //   kefu_id: this.userInfo.kefu_id,
      //   seller_code: this.userInfo.seller_code,
      //   users: arr,
      // }).then((result) => {
      //   this.isAddGroup = false;
      //   this.$message.success(result.msg);
      //   this.addGroupListUser = [];
      //   this.getGroupMemberList({
      //     group_id: this.activityGroup.activityId,
      //     seller_code: this.userInfo.seller_code,
      //   });
      // });
    },
    onChangeAddGroupUser(vals) {
      this.addGroupListUser = this.notGroupList.filter((item) => {
        return vals.includes(item.uid);
      });
    },
    arrayExists(arr, value, bool) {
      let con_arr = JSON.parse(JSON.stringify(arr));
      let list = con_arr.map((item) => {
        item.group_id == value &&
          (item.noReadNum = bool ? item.noReadNum + 1 : 0);
        return item;
      });
      return list;
    },
    onChangeCheckbox(vals) {
      let arr = [];
      vals.forEach((item) => {
        arr.push(this.groupList[item]);
      });
      this.handleGroupUser = arr;
    },
    onChangeAddList(vals) {
      this.selectList = this.addGroupList.filter((item) => {
        return vals.includes(item.uid);
      }); 
    },
    uploadFile(data, type) {
      this.sendMessage(data, type);
    },
    getLog(e,fn){ 
      this.isMore = true
      this.page ++
      let scrollH = this.$refs.groupChatBox.$refs.chatMain.scrollHeight
      this.getGroupChatLog( {
         page:this.page,
        group_id: this.activityGroup.activityId,
        kefu_id: this.userInfo.kefu_id,
        kefu_code: this.userInfo.kefu_code,
        },()=>{
          setTimeout(()=>{
            e.target.scrollTo(0,  e.target.scrollHeight -  (scrollH + 30 ))
            }) 
          })
    },
    initGroup(){
      this.isMore = true;
      this.getGroupList({
      kefu_id: this.userInfo.kefu_id,
    })
      .then((result) => {
        if (this.$store.state.Socket.chatList.length) {
          if (!this.activityGroup.activityId) {
            this.SET_ACTIVITY_GROUP({
              activityId: this.$store.state.Socket.chatList[0].group_id,
              activityTitle: this.$store.state.Socket.chatList[0].group_name,
              is_invite: this.$store.state.Socket.chatList[0].is_invite,
              on_file: this.$store.state.Socket.chatList[0].on_file,
              on_voice: this.$store.state.Socket.chatList[0].on_voice,
            });
            let arr = JSON.parse(
              JSON.stringify(this.$store.state.Socket.chatList)
            );
            arr[0].noReadNum = 0;
            this.SET_CHAT_LIST(arr);
            this.chatLogList = [];
            this.getGroupChatLog({
              page:1,
              group_id: this.$store.state.Socket.chatList[0].group_id,
              kefu_id: this.userInfo.kefu_id,
              kefu_code: this.userInfo.kefu_code,
            });
          } else {
            let arr = JSON.parse(
              JSON.stringify(this.$store.state.Socket.chatList)
            );
            let list = arr.map((item) => {
              if(item.group_id === this.activityGroup.activityId){
                item.noReadNum = 0
               if(
                 item.group_name !==this.activityGroup.activityTitle||
                 item.is_invite !==this.activityGroup.is_invite||
                 item.on_file !==this.activityGroup.on_file||
                 item.on_voice !==this.activityGroup.on_voice
                ){
                  this.SET_ACTIVITY_GROUP({
                    activityId: this.activityGroup.activityId,
                    activityTitle:item.group_name,
                    is_invite: item.is_invite,
                    on_file: item.on_file,
                    on_voice: item.on_voice,
                })
               }
              }
              return item;
            });
            this.SET_CHAT_LIST(list);
            this.getGroupChatLog({
              page:1,
              group_id:this.activityGroup.activityId,
              kefu_id: this.userInfo.kefu_id,
              kefu_code: this.userInfo.kefu_code,
            });
            this.chatLogList = [];
          }
        }
      })
    }
  },
  mounted() {
    this.initGroup()
  },
};
</script>

<style lang="less" scoped>
.groupChat {
  background-color: #fff;
  height: 100%;
}

.list_loading {
  text-align: center;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  margin-bottom: 20px;
  padding: 30px 50px;
  margin: 20px 0;
}

.activt_item {
  background-color: #ccc;
}

.hover_item {
  padding: 5px;
  &:hover {
    background-color: #d9d9d9;
  }
}

.chat_content {
  border-left: 1px solid #eee;
  border-right: 1px solid #eee;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat_left {
  // padding: 10px;
  height: 100%;
  background-color: #eee;
  overflow: auto;

  &::-webkit-scrollbar {
    width: 8px;
    /*高宽分别对应横竖滚动条的尺寸*/
    // background-color: #fff;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 4px;
    background: #d8d8d8;
  }
}

.more {
  font-size: 25px;
  margin-right: 10px;
  color: #848484;
  &:hover {
    color: #444444;
  }
}

.member_item {
  background-color: #ccc;
}
/deep/ .ant-checkbox-group-item {
  display: flex;
  align-items: center;
  padding: 5px;
}

.group_list {
  min-height: 40vh;
  max-height: 45vh;
  overflow: auto;
  // padding: 0 10px;
  &::-webkit-scrollbar {
    width: 8px;
    /*高宽分别对应横竖滚动条的尺寸*/
    // background-color: #fff;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 4px;
    background: #d8d8d8;
  }
}
.checkboxLabel {
  display: flex;
  align-items: center;
  .group_list_item {
    display: flex;
    .headimg {
      width: 30px;
      height: 30px;
      border-radius: 4px;
    }
  }
  .group_list_item_username {
    padding-left: 10px;
  }
}
.info {
  .title {
    padding: 0 10px;
    height: 35px;
    background-color: #eee;
    line-height: 35px;
  }

  .subTitle {
    padding: 0 10px;
    height: 35px;
    line-height: 35px;

    span {
      margin-left: 20px;
    }
  }
}

.remark_content {
  border: 1px solid #eee;
  border-radius: 10px;
  margin: 10px;
}
.is_stop_speak {
  margin-left: 20px;
  color: #ccc;
}
.other {
  overflow: auto;
  max-height: 130px;
  &::-webkit-scrollbar {
    width: 8px;
    /*高宽分别对应横竖滚动条的尺寸*/
    // background-color: #fff;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 4px;
    background: #d8d8d8;
  }
}
</style>
