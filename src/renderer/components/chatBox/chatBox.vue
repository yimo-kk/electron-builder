<template>
  <div class="chat">
    <div class="loading" v-show="loading">
      <a-spin></a-spin>
    </div>
    <div class="chat_body">
      <div class="chat_all" ref="chatMain">
        <div class="more_chat_log ">
          <a-spin v-if="isMore"   :tip="$t('loading')"/>
           
        </div>
        <p v-if='(count>50 &&chatLogListData.length >= count) && !isMore ' class="more_log">{{$t('noMore')}}</p>
        <div v-for="(item, index) in chatLogListData" :key="index">
          <div class="flex_center" style="color:#ccc; fontSize:12px">
            <p>{{ isViewDate(index) ?item.create_time:''}}</p>
          </div>
          <div v-if="item.forbid" class="forbid">{{item.message}}</div>
          <div v-else>
            <div
            class="message_left"
            v-if="item.from_name !==userInfo.kefu_name"
          >
            <img 
              :data-index="index"
              class="chat_head_portrait"
              v-lazy ="item.from_avatar"
              alt
              @contextmenu.prevent="handleRightImg"
            />
            <div class="name_content_left">
              <span v-if="isName" style="marginBottom: 2px; fontSize: 12px">{{
                item.from_name
              }}</span>
              <div class="chat_content chat_content_left">
                <p  style="white-space: pre-line;word-break: break-word;" v-if="item.type === 0">{{ item.content || item.message }}</p>
                <div v-else-if="item.type === 1" class="pictrue">
                  <img
                    @click="viewImg(item.content || item.message)"
                    @load='loadImg'
                    :src="item.content || item.message"
                    alt
                  />
                </div>
                <div
                  :title="$t('download')"
                  v-else-if="item.type === 2"
                  style="padding-left: 10px; cursor: pointer"
                  @click="
                    downloadFileE(item.content || item.message, item.file_alias,index,item.progress)
                  "
                >
                  <div class="flex_up_down_center">
                    <div class="file_name" style="alignItems: flex-start">
                    <span style="color: #000">{{
                      (item.message && item.message.filename) || item.file_alias
                    }}</span>
                    <span style="color: #333; margin: 6px; fontSize: 10px">{{
                      (item.message && item.message.filesize) || item.file_size
                    }}</span>
                  </div>
                  <p style="paddingLeft: 10px">
                    <customIcon
                      type="icon-wenjianjia"
                      style="color: #b18904; fontSize: 50px"
                    ></customIcon>
                  </p>
                  </div>
                  <a-progress v-if="item.progress" :percent="item.progress_num" size="small" />
                </div>
                <div v-else-if="item.type === 3">
                  <Audio
                    @play="
                      (isPlay) => {
                        playRecord(
                          item.content ? item.content : item.message.src,
                          index,
                          isPlay
                        );
                      }
                    "
                    :isPlay="item.message ? item.message.play : item.play"
                    :data="item"
                  ></Audio>
                </div>
              </div>
            </div>
          </div>
          <div
            class="message_right"
            v-else-if="item.from_name === userInfo.kefu_name"
          >
            <div class="name_content_right">
              <span v-if="isName" style="marginBottom: 2px; fontSize: 12px">{{
                userInfo.kefu_name
              }}</span>
              <div class="chat_content chat_content_right">
                <p style="white-space: pre-line;word-break: break-word;" v-if="item.type === 0">{{ item.content || item.message }}</p>
                <div v-else-if="item.type === 1" class="pictrue">
                   
                  <img
                  @load='loadImg' 
                    @click="viewImg(item.content || item.message)"
                    :src="item.content || item.message"
                    alt
                  />
                </div>
                 <!-- downloadFile(item.content || item.message, item.file_alias) -->
                <div
                  :title="$t('download')"
                  v-else-if="item.type === 2"
                  class="flex_up_down_center"
                  style="paddingRight: 10px; cursor: pointer"
                  @click="downloadFileE(item.content || item.message, item.file_alias,index,item.progress)"
                >
                  <p style="paddingRight: 10px">
                    <customIcon
                      type="icon-wenjianjia"
                      style="color: #b18904; fontSize: 50px"
                    ></customIcon>
                  </p>
                  <div class="file_name" style="alignItems: flex-end">
                    <span style="color: #000">{{
                      (item.message && item.message.filename) || item.file_alias
                    }}</span>
                    <span style="color: #333; margin: 6px; fontSize: 10px">{{
                      (item.message && item.message.filesize) || item.file_size
                    }}</span>
                  </div>
                </div>
                <div v-else-if="item.type === 3">
                  <Audio
                    @play="
                      (isPlay) => {
                        playRecord(
                          item.content ? item.content : item.message.src,
                          index,
                          isPlay
                        );
                      }
                    "
                    :isPlay="item.message ? item.message.play : item.play"
                    :data="item"
                  ></Audio>
                </div>
              </div>
            </div>
            <img class="chat_head_portrait" v-lazy="item.from_avatar" alt />
          </div>
          </div>
        </div> 
    </div>
    <div class="input_box">
      <div class="other flex_up_down_center">
        <customIcon
          :title="$t('currentInfo.expression')"
          type="icon-biaoqing1"
          style="fontSize: 20px; padding: 8px 0 0 8px"
          @click="faceContent"
        ></customIcon>
        <a-upload
          name="file"
           :title="$t('currentInfo.image')"
          :showUploadList="false"
          :customRequest="uploadImage"
          accept="image/png, image/gif, image/jpg, image/webp, image/jpeg"
        >
          <customIcon
           :title="$t('currentInfo.image')"
            type="icon-tupian"
            style="fontSize: 20px; padding: 8px 0 0 8px"
          ></customIcon>
        </a-upload> 
        <a-upload
          v-show="on_file"
          name="file"
          :showUploadList="false"
          :customRequest="uploadFile"
          accept="*"
        >
          <customIcon
          :title="$t('currentInfo.file')"
            type="icon-wenjian"
            style="fontSize: 20px; padding: 8px 0 0 8px"
          ></customIcon>
        </a-upload>
        <p @click="voice" v-show="on_voice">
          <customIcon
          :title="$t('currentInfo.voice')"
            type="icon-yuyin-"
            style="fontSize: 20px; padding: 8px 0 0 8px"
          ></customIcon>
        </p>
      </div>
      <a-textarea
        v-model.trim="sendText"
        :placeholder="$t('currentInfo.pleaseEnter')"
        style="height:75px"
        @keydown="enter"
      />
      <div class="send" @click="sendMessage(sendText, 0)" 
      :title="`Enter  ${$t('currentInfo.send')}
Enter+Ctrl/Shift  ${$t('currentInfo.wrap')}`">
        <p :class="['send_btn', sendText.length ? 'activt_btn' : '']" >{{$t('currentInfo.send')}}</p>
      </div>
      <!-- 表情区域 -->
      <div v-show="faceShow">
        <div class="mask" @click="()=>{
          faceShow = false
          faceList=[]
          }"></div>
        <div class="browBox">
          <ul>
            <li
              v-for="(item, index) in faceList"
              :key="index"
              @click.stop="getBrow(index)"
            >
              {{ item.char }}
            </li>
          </ul>
        </div>
      </div>
    </div>
   
    </div>
     <!-- 语音 -->
    <div v-if="isVoice">
      <div class="Pc_record">
        <div>
          <img src="@/assets/voice.gif" width="100px" height="100px" />
          <br />
          <p>{{$t('recording')}}</p>
        </div>
        <div class="Pc_btn">
          <span
            class="flex_center"
            style="cursor: pointer"
            @click="stopRecorder"
            >{{$t('currentInfo.send')}}</span
          >
          <span class="flex_center" style="cursor: pointer" @click="cancelAudio"
            >{{$t('cancel')}}</span
          >
        </div>
      </div>
      <div class="voice_mask"></div>
    </div>
    <!-- 图片预览-->
    <div class="view_image flex_center" v-if="previewVisible">
        <customIcon
        @click="previewVisible=false"
          :title="$t('outLogin')"
          type="icon-cancel-1-copy"
          style="font-size: 30px;
          top: 25px;
          right: 20px;
          position: absolute;
            color: #ccc;"
        ></customIcon>
        <img alt="example" style="height:100%;padding:10px" v-lazy="previewImage" />
    </div>
    <!-- 播放录音 -->
    <audio ref="audio" @ended="playEnd" style="display: none"></audio>
    <!-- 点击头像 -->
    <div
      v-show="isHeadPortrait && !isHeadImg && isAdmin"
      class="click_head_portrait"
      :style="{ left: left + 'px', top: top + 'px' }"
    >
      <p @click.stop="stopSpeak">
          {{$t('groupInfo.mute')}}
      </p>
       <p @click.stop="removeforbid">
          {{$t('groupInfo.unmute')}}
      </p>
      <p @click.stop="addBlacklist">
          {{$t('groupInfo.addBlack')}}
      </p>
        <p @click.stop="removeblack">
          {{$t('groupInfo.removeBlack')}}
      </p>
      <p @click.stop="kickOutOrstopSpeak(2)"  v-show="$store.state.Socket.activityGroup.is_invite">
        {{$t('groupInfo.kickOut')}}
      </p>
    </div>
  </div>
</template>

<script>
const { dialog } = require('electron').remote
const path = require('path')
import {
  conversionFace,
  conversion,
} from "@/utils/libs.js";
import Recorder from "js-audio-recorder";
const recorder = new Recorder({
  sampleBits: 8, // 采样位数，支持 8 或 16，默认是16
  sampleRate: 22050, // 采样率，支持 11025、16000、22050、24000、44100、48000，根据浏览器默认值
  numChannels: 1, // 声道，支持 1 或 2， 默认是1e
});
import { serviceSendChatFile, uploadVoice } from "@/api/current.js";
const appData = require("@/assets/emojis.json");
import Audio from "./audio";
export default {
  name: "ChatBox",
  props: {
    isName: { 
      type: Boolean,
      default: true,
    },
    chatLogList: {
      type: Array,
      // default() {
      //   return [];
      // },
    },
    // logLoading: Boolean,
    isHeadImg: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
     on_file: {
      type: Number,
      default: 1,
    },
     on_voice: {
      type: Number,
      default: 1,
    },
    isMore:{
      type:Boolean,
      default:false
    },
    count:{
      type:Number,
      default:20
    }
  },
  components: {
    Audio,
  },
  data() {
    return {
      chatLogListData:JSON.parse(JSON.stringify(this.chatLogList)),
      loading: false,
      faceShow: false,
      faceList: [],
      sendText: "",
      sendType: 0,
      isVoice: false,
      drawRecordId: null,
      previewVisible: false,
      previewImage: "",
      isHeadPortrait: false,
      left: 0,
      top: 0,
      selectUser: {},
      timer:null,
      isDownload:false
    };
  },
  computed: {
     userInfo(){
      return JSON.parse(localStorage.getItem(this.$route.query.seller_code))[this.$route.query.kefu_code]
    },
     isViewDate() {
      return index => {
        if (this.chatLogListData[index] && this.chatLogListData[index - 1]) {
          return (
            new Date(this.chatLogListData[index].create_time).getTime() -
              new Date(this.chatLogListData[index - 1].create_time).getTime() >
            1000 * 60 * 5
          );
        } else {
          return "";
        }
      };
    }
  },
  watch: {
    "chatLogList.length": {
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
         this.isMore==false && this.messageDown();
        }
      }, 
      deep: true,
    },
    chatLogList:{
      handler(newVal,old){
        this.chatLogListData = newVal
        this.isMore==false && this.messageDown();
      },
      deep:true
    },
    sendText(newVal){
       if(!newVal)return
          var str = conversion(newVal,3333)
          if (str.length >= 240) {
            this.$message.error(this.$t('overLimit'))
            var string = str.slice(0, 240)
            var arr = string.split('[')
            arr.forEach((item,index)=>{
              if(index >0 &&item.indexOf(']') === -1 ){
                arr.pop()
              }
            })
           this.sendText = conversionFace(arr.join('['))
         }else {
          this.sendText = conversionFace(str)
         }
    },
    // logLoading(val) {
    //   this.loading = JSON.parse(JSON.stringify(val));
    // },
  },
  methods: {
    enter(event) {
      if (event.keyCode === 13 && event.ctrlKey ||event.altKey) {
        this.sendText +='\n'
      }else if(event.keyCode === 13 &&event.shiftKey){
        // shitt+回车自带换行
      }
      else if(event.keyCode === 13 ) {
        event.preventDefault();
        this.sendMessage(this.sendText, 0);
      }
    },
    sendMessage(content, type) {
      this.sendType = type;
      if (!this.sendText && this.sendType === 0) {
        this.$message.error(this.$t('sendAir'));
        return;
      }
      this.$emit("sendMessage", content, type);
      this.sendText = "";
    },
    uploadImage(file) {
      this.$emit("uploadImage", file, 1);
    },
    uploadFile(file) {
      const formdata = new FormData();
      formdata.append("filedata", file.file);
      formdata.append("filename", file.file.name);
      this.loading = true;
      serviceSendChatFile(formdata)
        .then((result) => {
          this.loading = false;
          if(result.code === -1){
            this.$message.error(result.msg)
          }else {
            this.$emit("uploadFile", result.data, 2);
          }
        })
        .catch((err) => {
          this.loading = false;
        });
    },
    faceContent() {
      this.faceShow = !this.faceShow;
      if (this.faceShow == true) {
        for (let i in appData) {
          appData[i].name = i;
          this.faceList.push(appData[i]);
        }
      } else {
        this.faceList = [];
      }
    },
    // 获取用户点击表情之后的标签 ，存放到输入框内
    getBrow(index) {
      for (let i in this.faceList) {
        if (index == i) {
          this.getBrowString = this.faceList[index].char;
          this.sendText += this.getBrowString;
        }
      }
    },
    // 来的消息显示在最下面
    messageDown() {
     if( (this.chatLogListData.length &&  this.isMore==false) ){
       this.$nextTick(()=>{
          this.$refs.chatMain.scrollTop = this.$refs.chatMain.scrollHeight
       })
     }
         
      
    },
    // 图片显示延迟显示
    loadImg(){
      if(!this.isDownload && this.isMore == false){
       this.messageDown()
     }
    },
    // 播放语音
    playRecord(stream, index,bool) {  
      this.currentIndex = index;
       let audio = this.$refs.audio;
      if(bool){
        audio.src = '';
        this.chatLogListData.forEach((item) => {
          if (item.type == 3) {
            item.message ? (item.message.play = false) : (item.play = false);
          }
      });
      }else {
        this.recordOne(index);
        if (window.URL) {
          audio.src = stream;
        } else {
          audio.src = event;
        }
        audio.autoplay = true;    
      }
     
    },
    // 只能播放一个其他全为flase
    recordOne(value) {
      this.chatLogListData.forEach((item, index) => {
        if (index === value && item.type == 3) {
          item.message ? (item.message.play = true) : (item.play = true);
        } else if (item.type == 3) {
          item.message ? (item.message.play = false) : (item.play = false);
        }
      });
    },
    voice() {
      this.sendType = 3;
      Recorder.getPermission().then(
        () => {
          this.isVoice = !this.isVoice;
          this.startRecorder();
        },
        (error) => {
          this.$toast(this.$t('permission'));
        }
      );
    },
    // 发送语音
    // 结束录音
    stopRecorder() {
      if (recorder.isServe) return;
      recorder.stop();
      this.isVoice = !this.isVoice;
      this.drawRecordId && cancelAnimationFrame(this.drawRecordId);
      this.drawRecordId = null;
      if (recorder.duration < 1) {
        this.$message.error(this.$t('timeShort'));
        return;
      }
      let dataMp3 = recorder.getWAVBlob();
      var fileName = new Date().valueOf() + "." + "wav";
      const formdata = new FormData();
      formdata.append("name", fileName);
      formdata.append("file", dataMp3);
      this.loading = true;
      uploadVoice({
        params: formdata,
        seller_code: this.userInfo.seller_code || this.$route.query.seller_code,
      })
        .then((result) => {
          this.loading = false;
          let data = result.data;
          data.duration = Math.round(recorder.duration);
          this.sendMessage(data, 3);
        })
        .catch((err) => {
          this.loading = false;
        });
    },
    // 取消发送语音需要暂停处理
    cancelAudio() {
      this.isVoice = !this.isVoice;
      recorder.stop();
      // this.$emit("cancelAudio");
    },
    // 开始录音
    startRecorder() {
      let that = this
      recorder.start().then(
        () => {
          // this.drawRecord(); //开始绘制图片
        },
        (error) => {
          // 出错
          this.$toast(this.$('noVoice'));
          recorder.isServe = true;
          this.isMask = false;
        }
      );
      recorder.onprogress = function(params) {
        if(params.duration>=59.5){
          that.stopRecorder()
        }
    } 
    },
    playEnd() {
      this.chatLogListData.forEach((item) => {
        if (item.type == 3) {
          item.message ? (item.message.play = false) : (item.play = false);
        }
      });
    },
    // 图片预览
    viewImg(val) {
      this.previewImage = val;
      this.previewVisible = true;
    },
    // 下载文件
    // downloadFile(content, fileName) {
    //   try {
    //     let aLink = document.createElement("a");
    //     let evt = document.createEvent("HTMLEvents");
    //     evt.initEvent("click", true, true); //initEvent 不加后两个参数在FF下会报错  事件类型，是否冒泡，是否阻止浏览器的默认行为
    //     if (typeof content !== "string") {
    //       aLink.href = content.src;
    //       aLink.download = content.filename;
    //     } else {
    //       aLink.href = content;
    //       aLink.download = fileName;
    //     }
    //     aLink.click();
    //     // this.$message.success(this.$t('downloadFile'))
    //   } catch (error) {
    //     this.$message.error(this.$t('fileExpired'));
    //   }
    // },
    handleRightImg(e) {
      this.isHeadPortrait = true;
      this.left = e.pageX + 10;
      this.top = e.pageY + 10;
      this.selectUser = this.chatLogListData[e.target.dataset.index];
    },
    stopSpeak() { 
       this.isHeadPortrait = false
      let {state, from_name,kefu_code } = this.selectUser;
      let params = []
      if(state){
        params=[{
          kefu_code,
          username:from_name,
          type:state
        }]
      }else {
       params= [{username:from_name}]
      }
      this.$emit("stopSpeak", params);
    },
    // 解除禁言
    removeforbid(){
       this.isHeadPortrait = false
       let {state, from_name,kefu_code } = this.selectUser;
        let params = []
      if(state){
        params=[{
          kefu_code,
          username:from_name,
          type:state
        }]
      }else {
       params= [{username:from_name}]
      }
      this.$emit("removeforbid", params);
    },
    kickOutOrstopSpeak(val) {
       this.isHeadPortrait = false
      let { from_id, from_name,status } = this.selectUser;
      this.$emit("kickOut", [{  uid:from_id, username:from_name}]);
      
    },
    // 加黑名单
    addBlacklist(){
      this.isHeadPortrait = false
      let { from_id,state, from_ip ,from_name,kefu_code} = this.selectUser;
        let params = []
      if(state){
        params=[{
          ip:from_ip,
          kefu_code,
          username:from_name,
          type:state,
          uid:from_id
        }]
      }else {
        params=[{username:from_name,  ip:from_ip,uid:from_id}]
      }
      console.log(params,4444)
      this.$emit("addBlacklist", params);
    }, 
    // 解除黑名单
    removeblack(){
      this.isHeadPortrait = false
     let { state, from_ip,from_id ,from_name,kefu_code} = this.selectUser;
        let params = []
      if(state){
        params=[{
          ip:from_ip,
          kefu_code,
          username:from_name,
          type:state,
          uid:from_id
        }]
      }else {
        params=[{username:from_name,  ip:from_ip,uid:from_id}]
      }
      this.$emit("removeblack",params);
    },
    downloadFileE(content,name,index,bool){
      
      if(bool){return}
      this.isDownload = true
      dialog.showOpenDialog({
        //默认路径
        // defaultPath :"/download",
        //选择操作，此处是打开文件夹
       properties: [ 'openFile','openDirectory'],
        //过滤条件
        filters: [ { name: 'All', extensions: ['*'] }]
    },(res)=>{
      if(!res)return
        let downloadFolder = res[0]
        let url
        if (typeof content !== "string") { 
          url = content.src;
        }else {
          url = content
        }
         this.$electron.ipcRenderer.send('download', {
           downloadFolder,
           url,
           index,
           name
         });
    })
    },
    // 下载进度条
    downloadProcess(){
      // this.$electron.ipcRenderer.on("progress",(e,obj)=>{
      //   let arr = JSON.parse(JSON.stringify(this.chatLogListData))
      //   if(arr.length){
      //     arr[obj.index].progress &&  (this.chatLogListData[obj.index].progress =true)
      //     arr[obj.index].progress_num = obj.progress_num*100
      //   }
      // })
      this.$electron.ipcRenderer.on("downloadSuccess",(e,val)=>{
        this.isDownload = false
         if(val === 'success'){
            this.$toast({ 
              icon:'check',
               content: this.$t('downloadFile')
                });
         }else if(val === 'err'){
          this.$toast({ 
            icon:'close',
            content: this.$t('downloadFilErr') });
         }
        })
    }
  },
  mounted() {
    // 将聊天框滚轮拉到最底部
    this.messageDown(); 
    // 下面这句代码是获取 点击的区域是否包含你的菜单，如果包含，说明点击的是菜单以外，不包含则为菜单以内
    document.addEventListener("click",  (e)=> {
      let flag = e.target.contains(
        document.getElementsByClassName("click_head_portrait")[0]
      );
      if (flag) return;
      this.isHeadPortrait = false;
    });
    // 滚动到顶部 加载更多
    let chatDoc = this.$refs.chatMain
    chatDoc.addEventListener('scroll',(e)=>{
        if( (e.target.scrollTop === 0 && 
         e.target.scrollHeight >  e.target.offsetHeight) && 
         !(this.chatLogListData.length>= this.count) && !this.isMore
          ){
        this.$emit('getLog',e)
      }
    })
    this.downloadProcess()
  },
};
</script>

<style lang="less" scoped>
.chat { 
  height: 100%;
 
.chat_body{
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
 position: relative;
  background-color: #f5f5f5;
}
  .chat_all {
    // background-color: #f5f5f5;
    overflow: auto;
    padding: 10px;

    &::-webkit-scrollbar {
      width: 4px;
      /*高宽分别对应横竖滚动条的尺寸*/
      border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 4px;
      background: #d8d8d8;
    }
    .forbid{
      font-size: 14px;
      color: #ccc;
      text-align: center;
    }
    .more_chat_log{
      position: absolute;
      top: 0;
      left: 50%;
      transform: translate(-50%,0);
    }
    .more_log{
        cursor: pointer;
        font-size: 12px;
        color: #ccc;
        text-align: center;
      }
  }

  .message_left {
    display: flex;
    // align-items: center;
    padding: 10px 0;
  }

  .chat_head_portrait {
    width: 30px;
    height: 30px;
    border-radius: 5px;
    margin-bottom: 10px;
  }

  .name_content_left {
    max-width: 350px;
    display: flex;
    flex-direction: column;
    font-size: 14px;
    padding: 5px 0 0 10px;
    align-items: flex-start;
  }

  .chat_content {
    padding: 5px 10px;

    .pictrue {
      img {
        max-width: 100%;
        max-height: 400px;
      }
    }

    .file_name {
      display: flex;
      flex-direction: column;
    }
  }

  .chat_content_left {
    background-color: #fff;
    border-radius: 5px;
    position: relative;

    &::before {
      content: "";
      position: absolute;
      top: 6px;
      left: -8px;
      border-top: 8px solid transparent;
      border-bottom: 8px solid transparent;
      border-right: 8px solid #fff;
    }
  }

  .chat_content_right {
    background-color: #9eea6a;
    border-radius: 5px;
    position: relative;

    &::after {
      content: "";
      position: absolute;
      top: 6px;
      right: -8px;
      border-top: 8px solid transparent;
      border-bottom: 8px solid transparent;
      border-left: 8px solid #9eea6a;
    }
  }

  .message_right {
    display: flex;
    justify-content: flex-end;
    padding: 10px 0;
  }

  .name_content_right {
    display: flex;
    flex-direction: column;
    font-size: 14px;
    padding: 0px 10px 0 0;
    align-items: flex-end;
    max-width: 350px;
  }

  .input_box {
    position: relative;
    border-right: 1px solid #eee;
    min-height: 220px;
    background-color: #fff;

    .other {
      padding-bottom: 8px;
    }

    .send {
      position: absolute;
      top: 120px;
      bottom: 10px;
      right: 10px;

      .send_btn {
        display: inline-block;
        width: 50px;
        height: 30px;
        text-align: center;
        line-height: 30px;
        background: #eee;
        border-radius: 5px;
        cursor: pointer;
      }

      .activt_btn {
        background-color: #1890ff;
        color: #ffffff;
      }
    }
  }
}

.loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 33;
}

.browBox {
  width: 400px;
  height: 200px;
  background: #fff;
  position: absolute;
  top: -220px;
  left: -90px;
  overflow: auto;
  box-shadow: 0px 0px 10px #ccc;
  z-index: 2222;

  &::-webkit-scrollbar {
    width: 4px;
    /*高宽分别对应横竖滚动条的尺寸*/
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 4px;
    background: #d8d8d8;
  }

  ul {
    display: flex;
    flex-wrap: wrap;
    padding: 10px;

    li {
      width: 10%;
      font-size: 20px;
      list-style: none;
      text-align: center;
      cursor: pointer;
    }
  }
}

.mask {
  width: 100vw;
  height: 100vh;
  background-color: rgba(156, 153, 153, 0.2);
  z-index: 11;
  position: fixed;
  top: 0;
  left: 0;
}

.Pc_record {
  font-size: 14px;
  width: 200px;
  height: 180px;
  position: absolute;
  bottom: 190px;
  left: 50%;
  transform: translate(-50%, 0);
  padding: 10px;
  line-height: 22px;
  border-radius: 5px;
  background-color: rgba(0, 20, 35, 0.5);
  color: #fff;
  font-weight: 300;
  text-align: center;
  z-index: 5;

  .Pc_btn {
    display: flex;
    justify-content: space-around;

    span {
      width: 45px;
      height: 25px;
      color: #000;
      background-color: #fff;
      border-radius: 5px;
      margin-top: 10px;
    }
  }
}

.voice_mask {
  width: 100%;
  background: rgba(0, 0, 0, 0.2);
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 2;
}
.click_head_portrait {
  position: fixed;
  background-color: #fff;
  box-shadow: 0px 0px 5px 2px #eee;
  color: #000;
  font-size: 12px;
  z-index: 11;
  cursor: pointer;
  p {
    padding: 5px 10px;
    border-bottom: 1px solid #eee;
    &:hover {
      background-color: #eee;
      color: #1890ff;
    }
  }
}
.view_image{
  height: 100%;
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 3333;
  background-color: rgba(0, 0, 0, 0.5);
}
/deep/.ant-input {
     border: none
 }

/deep/.ant-input:focus {
    box-shadow: none;
}
</style>
