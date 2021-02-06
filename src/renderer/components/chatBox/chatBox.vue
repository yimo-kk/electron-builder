<template>
  <div class="chat">
    <div class="loading" v-show="loading">
      <a-spin></a-spin>
    </div>
    <div class="chat_body" ref="chatBody">
      <div
        class="chat_all"
        :style="{
          backgroundImage: `url(${
            isName ? $store.state.Socket.activityGroup.img : ''
          })`,
        }"
        ref="chatMain"
      >
        <div class="more_chat_log ">
          <a-spin v-if="isMore" :tip="$t('loading')" />
        </div>
        <p
          v-if="count > 50 && chatLogListData.length >= count && !isMore"
          class="more_log"
        >
          {{ $t('noMore') }}
        </p>
        <div v-for="(item, index) in chatLogListData" :key="index">
          <div class="flex_center" style="color:#ccc; fontSize:12px">
            <p>
              {{
                $store.state.Socket.chatTime
                  ? item.create_time
                  : isViewDate(index)
                  ? item.create_time
                  : ''
              }}
            </p>
          </div>
          <div v-if="item.forbid || item.state == 2" class="forbid">
            {{
              item.to_name == userInfo.kefu_name
                ? ` ${item.create_time} ${item.message || item.content}`
                : item.message || item.content
            }}
          </div>
          <div v-else>
            <div
              class="message_left"
              v-if="item.from_name !== userInfo.kefu_name"
            >
              <img
                :data-index="index"
                class="chat_head_portrait"
                v-lazy="item.from_avatar"
                alt
                @contextmenu.prevent="handleRightImg"
              />
              <div class="name_content_left">
                <!--   v-if="isName" -->
                <span style="marginBottom: 2px; fontSize: 12px;color:#ccc;">{{
                  item.state == 1 || !isName ? item.from_name : item.nickname
                }}</span>
                <div class="chat_content chat_content_left">
                  <div
                    v-if="item.type === 0"
                    class="flex"
                    style="white-space: pre-line;"
                  >
                    <p
                      style="word-break: break-word;"
                      v-html="conversionFace(item.content || item.message)"
                    ></p>
                  </div>

                  <div v-else-if="item.type === 1" class="pictrue">
                    <img
                      @contextmenu="downloadImg(item.content || item.message)"
                      @click="viewImg(item.content || item.message)"
                      @load="loadImg"
                      :src="item.content || item.message"
                      alt
                    />
                  </div>
                  <div
                    :title="$t('download')"
                    v-else-if="item.type === 2"
                    style="padding-left: 10px; cursor: pointer"
                    @click="
                      downloadFileE(
                        item.content || item.message,
                        item.file_alias ||
                          (item.message && item.message.filename),
                        index,
                        item.progress
                      )
                    "
                  >
                    <div class="flex_up_down_center">
                      <div class="file_name" style="alignItems: flex-start">
                        <span style="color: #000">{{
                          (item.message && item.message.filename) ||
                            item.file_alias
                        }}</span>
                        <span
                          style="color: #333; margin: 6px; fontSize: 10px"
                          >{{
                            (item.message && item.message.filesize) ||
                              item.file_size
                          }}</span
                        >
                      </div>
                      <p style="paddingLeft: 10px">
                        <customIcon
                          type="icon-wenjianjia"
                          style="color: #b18904; fontSize: 50px"
                        ></customIcon>
                      </p>
                    </div>
                    <a-progress
                      v-if="item.progress_num"
                      :percent="item.progress_num"
                      size="small"
                    />
                  </div>
                  <div v-else-if="item.type === 3">
                    <Audio
                      :time="true"
                      @play="
                        (isPlay) => {
                          playRecord(
                            item.content ? item.content : item.message.src,
                            index,
                            isPlay
                          )
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
                <span style="marginBottom: 2px; fontSize: 12px;color:#ccc">{{
                  userInfo.kefu_name
                }}</span>
                <div class="chat_content chat_content_right">
                  <div
                    v-if="item.type === 0"
                    style="display: flex;alignItems: center;"
                  >
                    <div
                      v-if="item.type == 0 && item.is_voice && !isName"
                      class=" flex"
                      status="stop"
                      :title="$t('tts')"
                      no="1"
                    >
                      <Audio
                        :time="false"
                        @play="
                          (isPlay) => {
                            playRecord(item.voice_path, index, isPlay)
                          }
                        "
                        :isPlay="item.play"
                        :data="item"
                      ></Audio>
                    </div>
                    <p
                      style=";word-break: break-word;white-space: pre-line;"
                      v-html="conversionFace(item.content || item.message)"
                    ></p>
                  </div>
                  <div v-else-if="item.type === 1" class="pictrue">
                    <img
                      @contextmenu="downloadImg(item.content || item.message)"
                      @load="loadImg"
                      @click="viewImg(item.content || item.message)"
                      :src="item.content || item.message"
                      alt
                    />
                  </div>
                  <div
                    :title="$t('download')"
                    v-else-if="item.type === 2"
                    style="paddingRight: 10px; cursor: pointer"
                    @click="
                      downloadFileE(
                        item.content || item.message,
                        (item.message && item.message.filename) ||
                          item.file_alias,
                        index,
                        item.progress
                      )
                    "
                  >
                    <div class="flex_up_down_center">
                      <p style="paddingRight: 10px">
                        <customIcon
                          type="icon-wenjianjia"
                          style="color: #b18904; fontSize: 50px"
                        ></customIcon>
                      </p>
                      <div class="file_name" style="alignItems: flex-end">
                        <span style="color: #000">{{
                          (item.message && item.message.filename) ||
                            item.file_alias
                        }}</span>
                        <span
                          style="color: #333; margin: 6px; fontSize: 10px"
                          >{{
                            (item.message && item.message.filesize) ||
                              item.file_size
                          }}</span
                        >
                      </div>
                    </div>
                    <a-progress
                      v-if="item.progress_num"
                      :percent="item.progress_num"
                      size="small"
                    />
                  </div>
                  <div v-else-if="item.type === 3">
                    <Audio
                      :time="true"
                      @play="
                        (isPlay) => {
                          playRecord(
                            item.content ? item.content : item.message.src,
                            index,
                            isPlay
                          )
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
      <div class="input_box" v-show="isInput">
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
        <InputBox_
          ref="InputBox_"
          :isName="isName"
          :valueConten="sendText"
          @textToSpeech="textToSpeech"
          @sendMessage="sendMessage"
        ></InputBox_>
        <div v-show="faceShow">
          <div
            class="mask"
            @click="
              () => {
                faceShow = false
                faceList = []
              }
            "
          ></div>
          <div class="browBoxs flex_center">
            <div class="browBox">
              <ul>
                <li
                  v-html="faceHtml(item)"
                  v-for="(item, index) in faceList"
                  :key="index"
                  @click.stop="getBrow(item)"
                ></li>
              </ul>
            </div>
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
          <p>{{ $t('recording') }}</p>
        </div>
        <div class="Pc_btn">
          <span
            class="flex_center"
            style="cursor: pointer"
            @click="stopRecorder"
            >{{ $t('currentInfo.send') }}</span
          >
          <span
            class="flex_center"
            style="cursor: pointer"
            @click="cancelAudio"
            >{{ $t('cancel') }}</span
          >
        </div>
      </div>
      <div class="voice_mask"></div>
    </div>
    <!-- 图片预览-->
    <div class="view_image flex_center" ref="viewImage" v-show="previewVisible">
      <customIcon
        @click="clearImg"
        :title="$t('outLogin')"
        type="icon-cancel-1-copy"
        style="font-size: 30px;
          top: 25px;
          right: 20px;
          position: absolute;
            color: #ccc;"
      ></customIcon>
      <img
        @contextmenu="downloadImg(previewImage)"
        alt="example"
        ref="imageShow"
        style="height:100%;padding:10px"
        :src="previewImage"
      />
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
        {{ $t('groupInfo.mute') }}
      </p>
      <p @click.stop="removeforbid">
        {{ $t('groupInfo.unmute') }}
      </p>
      <p @click.stop="addBlacklist">
        {{ $t('groupInfo.addBlack') }}
      </p>
      <p @click.stop="removeblack">
        {{ $t('groupInfo.removeBlack') }}
      </p>
      <p
        @click.stop="kickOutOrstopSpeak(2)"
        v-show="$store.state.Socket.activityGroup.is_invite"
      >
        {{ $t('groupInfo.kickOut') }}
      </p>
    </div>
    <popup
      v-show="sendFilePopup"
      :type="sendFileType"
      :fileName="sendFileName"
      :HeadImg="sendFiletoHead"
      :sendToName="sendFiletoName"
      @ensure="fileSendEnsure"
      @cancel="fileSendCancel"
    ></popup>
  </div>
</template>

<script>
import { emojisAmap } from '../../assets/face/index'
const { dialog } = require('electron').remote
const path = require('path')
import { isImage, clipboardImg } from '@/utils/libs.js'
import Recorder from 'js-audio-recorder'
const recorder = new Recorder({
  sampleBits: 8, // 采样位数，支持 8 或 16，默认是16
  sampleRate: 48000, // 采样率，支持 11025、16000、22050、24000、44100、48000，根据浏览器默认值
  numChannels: 1, // 声道，支持 1 或 2， 默认是1e
})
import { serviceSendChatFile, uploadVoice } from '@/api/current.js'
const appData = require('@/assets/emojis.json')
import Audio from './audio'
import InputBox_ from './inputBox'
import chat from '@/mixins/chat'
import popup from '../popup/popup'
const electron = require('electron')
const { remote } = require('electron')
var imgUrl = ''
var downloadImgtext = [
  {
    label: '保存图片',
    click: (e, data) => {
      let name = imgUrl.split('/')
      let pathName = name[name.length - 1]
      dialog.showSaveDialog(
        {
          //默认路径
          defaultPath: `/download/${pathName}`,
          buttonLabel: '保存',
        },
        (res) => {
          if (!res) return
          let downloadFolder = res
          electron.ipcRenderer.send('download', {
            url: imgUrl,
            downloadFolder,
            name: pathName.split('.')[0],
          })
        }
      )
    },
  },
  {
    label: '复制',
    click: () => {
      clipboardImg(imgUrl)
    },
  },
]
var downloadImgMenu = remote.Menu.buildFromTemplate(downloadImgtext)
export default {
  name: 'ChatBox',
  mixins: [chat()],
  model: {
    prop: 'text',
    event: 'inputText',
  },
  props: {
    text: {
      type: String,
      default: '',
    },
    isName: {
      type: Boolean,
      default: true,
    },
    chatLogList: {
      type: Array,
    },
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
    isMore: {
      type: Boolean,
      default: false,
    },
    count: {
      type: Number,
      default: 20,
    },

    isInput: {
      type: Boolean,
      default: true,
    },
  },
  components: {
    Audio,
    popup,
    InputBox_,
  },
  data() {
    return {
      chatLogListData: JSON.parse(JSON.stringify(this.chatLogList)),
      loading: false,
      faceShow: false,
      faceList: [],
      sendText: JSON.parse(JSON.stringify(this.text)),
      sendType: 0,
      isVoice: false,
      drawRecordId: null,
      previewVisible: false,
      previewImage: '',
      isHeadPortrait: false,
      left: 0,
      top: 0,
      selectUser: {},
      timer: null,
      isDownload: false,
      sendFilePopup: false,
      sendFileType: 1,
      sendFileName: '',
      sendFiletoHead: '',
      sendFiletoName: '',
      currentsendData: null,
      insertion: '',
    }
  },
  computed: {
    userInfo() {
      return JSON.parse(localStorage.getItem(this.$route.query.seller_code))[
        this.$route.query.kefu_code
      ]
    },
    isViewDate() {
      return (index) => {
        if (this.chatLogListData[index] && this.chatLogListData[index - 1]) {
          return (
            new Date(this.chatLogListData[index].create_time).getTime() -
              new Date(this.chatLogListData[index - 1].create_time).getTime() >
            1000 * 60 * 3
          )
        } else {
          return ''
        }
      }
    },
    currentUser() {
      return this.$store.state.Socket.currentUser
    },
    activityGroup() {
      return this.$store.state.Socket.activityGroup
    },
  },

  watch: {
    'chatLogList.length': {
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          this.isMore == false && this.messageDown()
        }
      },
      deep: true,
    },
    chatLogList: {
      handler(newVal, old) {
        this.chatLogListData = JSON.parse(JSON.stringify(newVal))
        this.isMore == false && this.messageDown()
      },
    },
    text(newVal) {
      this.sendText = JSON.parse(JSON.stringify(newVal))
    },
  },
  methods: {
    inputText(val) {
      this.$emit('inputText', val.target.value)
    },
    sendMessage(content, type) {
      this.sendType = type
      if (this.sendType === 0 && !content) {
        this.$message.error(this.$t('sendAir'))
        return
      }
      this.$emit('sendMessage', content, type)
    },
    uploadImage(file, drag) {
      this.$emit('uploadImage', drag ? file : file.file, 1)
    },
    uploadFile(file, drag) {
      const formdata = new FormData()
      formdata.append('filedata', drag ? file : file.file)
      formdata.append('filename', drag ? file.name : file.file.name)
      this.loading = true
      serviceSendChatFile(formdata)
        .then((result) => {
          this.loading = false
          if (result.code === -1) {
            this.$message.error(result.msg)
          } else {
            this.$emit('uploadFile', result.data, 2)
          }
        })
        .catch((err) => {
          this.loading = false
        })
    },

    // 获取表情
    faceContent() {
      this.faceShow = !this.faceShow
      this.faceShow == true
        ? (this.faceList = Object.values(emojisAmap))
        : (this.faceList = [])
    },
    // 获取用户点击表情之后的标签 ，存放到输入框内
    getBrow(val) {
      this.$refs.InputBox_.insertEmoji(val)
    },
    // 来的消息显示在最下面
    messageDown() {
      if (this.chatLogListData.length && this.isMore == false) {
        this.$nextTick(() => {
          this.$refs.chatMain.scrollTop = this.$refs.chatMain.scrollHeight
        })
      }
    },
    // 图片显示延迟显示
    loadImg() {
      if (!this.isDownload && this.isMore == false) {
        this.messageDown()
      }
    },
    // 播放语音
    playRecord(stream, index, bool) {
      this.currentIndex = index
      let audio = this.$refs.audio
      if (bool) {
        audio.src = ''
        this.chatLogListData.forEach((item) => {
          item.type == 3 && item.message
            ? (item.message.play = false)
            : (item.play = false)
          item.type == 0 && (item.play = false)
        })
      } else {
        this.recordOne(index)
        if (window.URL) {
          audio.src = stream
        } else {
          audio.src = event
        }
        audio.autoplay = true
      }
    },
    // 只能播放一个其他全为flase
    recordOne(value) {
      this.chatLogListData.forEach((item, index) => {
        if (index === value) {
          item.type == 3 &&
            (item.message ? (item.message.play = true) : (item.play = true))
          item.type == 0 && (item.play = true)
        } else {
          item.type == 3 &&
            (item.message ? (item.message.play = false) : (item.play = false))
          item.type == 0 && (item.play = false)
        }
      })
    },
    voice() {
      this.sendType = 3
      Recorder.getPermission().then(
        () => {
          this.isVoice = !this.isVoice
          this.startRecorder()
        },
        (error) => {
          this.$toast(this.$t('permission'))
        }
      )
    },
    // 发送语音
    // 结束录音
    stopRecorder() {
      if (recorder.isServe) return
      recorder.stop()
      this.isVoice = !this.isVoice
      this.drawRecordId && cancelAnimationFrame(this.drawRecordId)
      this.drawRecordId = null
      if (recorder.duration < 1) {
        this.$message.error(this.$t('timeShort'))
        return
      }
      let dataMp3 = recorder.getWAVBlob()
      var fileName = new Date().valueOf() + '.' + 'wav'
      const formdata = new FormData()
      formdata.append('name', fileName)
      formdata.append('file', dataMp3)
      this.loading = true
      uploadVoice({
        params: formdata,
        seller_code: this.userInfo.seller_code || this.$route.query.seller_code,
      })
        .then((result) => {
          this.loading = false
          let data = result.data
          data.duration = Math.round(recorder.duration)
          this.sendMessage(data, 3)
        })
        .catch((err) => {
          this.loading = false
        })
    },
    // 取消发送语音需要暂停处理
    cancelAudio() {
      this.isVoice = !this.isVoice
      recorder.stop()
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
          this.$toast(this.$('noVoice'))
          recorder.isServe = true
          this.isMask = false
        }
      )
      recorder.onprogress = function(params) {
        if (params.duration >= 59.5) {
          that.stopRecorder()
        }
      }
    },
    playEnd() {
      this.chatLogListData.forEach((item) => {
        if (item.type == 3 || item.type == 0) {
          item.type == 3 && item.message
            ? (item.message.play = false)
            : (item.play = false)
          item.type == 0 && (item.play = false)
        }
      })
    },
    // 图片预览
    viewImg(val) {
      this.previewImage = val
      this.previewVisible = true
    },
    downloadImg(url) {
      downloadImgMenu.popup({ window: remote.getCurrentWindow() }, false)
      imgUrl = url
    },
    handleRightImg(e) {
      this.isHeadPortrait = true
      this.left = e.pageX + 10
      this.top = e.pageY + 10
      this.selectUser = this.chatLogListData[e.target.dataset.index]
    },
    stopSpeak() {
      this.isHeadPortrait = false
      let { state, from_name, kefu_code, from_id } = this.selectUser
      let params = []
      if (state) {
        params = [
          {
            kefu_code,
            username: from_name,
            type: state,
            uid: from_id,
          },
        ]
      } else {
        params = [{ username: from_name, uid: from_id }]
      }
      this.$emit('stopSpeak', params)
    },
    // 解除禁言
    removeforbid() {
      this.isHeadPortrait = false
      let { state, from_name, from_id, kefu_code } = this.selectUser
      let params = []
      if (state) {
        params = [
          {
            kefu_code,
            username: from_name,
            type: state,
            uid: from_id,
          },
        ]
      } else {
        params = [{ uid: from_id, username: from_name }]
      }
      this.$emit('removeforbid', params)
    },
    kickOutOrstopSpeak(val) {
      this.isHeadPortrait = false
      let { from_id, from_name, status } = this.selectUser
      this.$emit('kickOut', [{ uid: from_id, username: from_name }])
    },
    // 加黑名单
    addBlacklist() {
      this.isHeadPortrait = false
      let { from_id, state, from_ip, from_name, kefu_code } = this.selectUser
      let params = []
      if (state) {
        params = [
          {
            ip: from_ip,
            kefu_code,
            username: from_name,
            type: state,
            uid: from_id,
          },
        ]
      } else {
        params = [{ username: from_name, ip: from_ip, uid: from_id }]
      }
      this.$emit('addBlacklist', params)
    },
    // 解除黑名单
    removeblack() {
      this.isHeadPortrait = false
      let { state, from_ip, from_id, from_name, kefu_code } = this.selectUser
      let params = []
      if (state) {
        params = [
          {
            ip: from_ip,
            kefu_code,
            username: from_name,
            type: state,
            uid: from_id,
          },
        ]
      } else {
        params = [{ username: from_name, ip: from_ip, uid: from_id }]
      }
      this.$emit('removeblack', params)
    },
    downloadFileE(content, name, index, bool) {
      if (bool) return
      this.isDownload = true
      let path = `/download/${name}`
      dialog.showSaveDialog(
        {
          //默认路径
          defaultPath: path,
          buttonLabel: '保存',
        },
        (res) => {
          if (!res) return
          let downloadFolder = res
          let url
          if (typeof content !== 'string') {
            url = content.src
          } else {
            url = content
          }
          this.$electron.ipcRenderer.send('download', {
            url,
            downloadFolder,
            index,
            name,
          })
        }
      )
    },
    // 下载进度条
    downloadProcess() {
      this.$electron.ipcRenderer.on('progress', (e, obj) => {
        let arr = JSON.parse(JSON.stringify(this.chatLogListData))
        if (arr.length) {
          this.chatLogListData[obj.index].progress_num = parseInt(
            (obj.progress_num * 100).toFixed(0)
          )
        }
      })
      this.$electron.ipcRenderer.on('downloadSuccess', (e, val) => {
        imgUrl = ''
        this.isDownload = false
        if (val === 'success') {
          this.$toast({
            icon: 'check',
            content: this.$t('downloadFile'),
          })
        } else if (val === 'err') {
          this.$toast({
            icon: 'close',
            content: this.$t('downloadFilErr'),
          })
        }
      })
    },
    clearImg() {
      let el = this.$refs.imageShow
      el.style.width = null
      el.style.height = null
      this.previewVisible = false
      this.previewImage = ''
    },
    changeImageSize() {
      this.$refs.viewImage.addEventListener('wheel', this.changeImg, false)
    },
    changeImg(e) {
      let el = this.$refs.imageShow
      let delta = e.wheelDelta && (e.wheelDelta > 0 ? 1 : -1)
      if (delta > 0) {
        //放大
        // 向上滚
        let oWidth = el.offsetWidth //取得图片的实际宽度
        let oHeight = el.offsetHeight //取得图片的实际高度
        el.style.width = oWidth + 50 + 'px'
        el.style.height = oHeight + (50 / oWidth) * oHeight + 'px'
      } else if (delta < 0) {
        //缩小
        //向下滚
        let oWidth = el.offsetWidth //取得图片的实际宽度
        let oHeight = el.offsetHeight //取得图片的实际高度
        if (el.offsetWidth > 100 || el.offsetHeight > 75) {
          //判断如果图片缩小到原图大小就停止缩小(100和75分别为原图的宽高)
          el.style.width = oWidth - 50 + 'px'
          el.style.height = oHeight - (50 / oWidth) * oHeight + 'px'
        }
      }
    },
    logMore() {
      // 滚动到顶部 加载更多
      let chatDoc = this.$refs.chatMain
      chatDoc.addEventListener('scroll', this.wacthScroll)
    },
    wacthScroll(e) {
      if (
        e.target.scrollTop === 0 &&
        e.target.scrollHeight > e.target.offsetHeight &&
        !(this.chatLogListData.length >= this.count) &&
        !this.isMore
      ) {
        this.$emit('getLog', e)
      }
    },
    dragIn() {
      !this.isName && this.$refs.chatBody.addEventListener('drop', this.isDrop)
    },
    isDrop(e) {
      e.preventDefault()
      e.stopPropagation()
      this.currentsendData = e.dataTransfer.files[0]

      if (!this.currentsendData) {
        return
      }
      this.sendFilePopup = true
      this.sendFileType = this.isImageTo(this.currentsendData.type) ? 1 : 2
      this.sendFileName = this.currentsendData.name
      this.sendFiletoHead = ''
      this.sendFiletoName = this.currentUser.activtyeUsername
    },
    fileSendEnsure() {
      this.sendFilePopup = false
      if (this.isImageTo(this.currentsendData.type)) {
        this.uploadImage(this.currentsendData, 'drag')
      } else {
        this.uploadFile(this.currentsendData, 'drag')
      }
      this.sendFileType = 0
      this.sendFileName = ''
      this.sendFiletoHead = ''
      this.sendFiletoName = ''
    },
    fileSendCancel() {
      this.currentsendData = null
      this.sendFilePopup = false
      this.sendFileType = 0
      this.sendFileName = ''
      this.sendFiletoHead = ''
      this.sendFiletoName = ''
    },
    // 当选择文字转语音
    textToSpeech(e) {
      this.$emit('textToSpeech', e)
    },
    isImageTo(str) {
      var reg = /(png|jpg|gif|jpeg|webp)$/
      return reg.test(str)
    },
  },
  mounted() {
    // 将聊天框滚轮拉到最底部
    this.messageDown()
    this.menuNotClick()
    this.logMore()
    this.downloadProcess()
    this.changeImageSize()
    this.dragIn()
  },
  destroyed() {
    this.$refs.viewImage &&
      this.$refs.viewImage.removeEventListener('wheel', this.changeImg, true)
    this.$refs.chatMain &&
      this.$refs.chatMain.removeEventListener('scroll', this.wacthScroll)
  },
}
</script>

<style lang="less" scoped>
@import '@/style/index.less';
@import '@/style/chatBox.less';
</style>
