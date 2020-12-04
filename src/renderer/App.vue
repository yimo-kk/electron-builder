<template>
  <a-config-provider :locale="locale">
    <div id="app">
      <router-view v-if="appView"></router-view>
      <a-modal
        :title="$t('Update')"
        width="60%"
        :closable="false"
        :visible="visible"
        :footer="null"
      >
        <a-progress
          :stroke-color="{
            '0%': '#108ee9',
            '100%': '#87d068',
          }"
          :percent="percentage"
        />
      </a-modal>
      <audio id="audio" preload="auto" loop>
        <source src="./assets/voice.mp3" type="audio/mp3" />
      </audio>
    </div>
  </a-config-provider>
</template>

<script>
import { DebounceBy } from '@/utils/libs'
import common from './mixins/common'
export default {
  name: 'my-project',
  mixins: [common()],
  provide() {
    return {
      reload: this.reload,
    }
  },

  data() {
    return {
      visible: false,
      percentage: 0,
      appView: true,
    }
  },
  mounted() {
    // 禁止拖入文件图片等
    document.ondrop = function(event) {
      return false
    }
    document.ondragenter = function(event) {
      return false
    }
    document.ondragover = function(event) {
      return false
    }
    // 更新
    this.$electron.ipcRenderer.send('checkForUpdate')
    let _this = this
    //接收主进程版本更新消息
    this.$electron.ipcRenderer.on('message', (event, arg) => {
      if ('update-available' == arg.cmd) {
        // 显示升级对话框
        _this.visible = true
      } else if ('download-progress' == arg.cmd) {
        let percent = Math.round(parseFloat(arg.message.percent))
        _this.percentage = percent
      } else if ('error' == arg.cmd) {
        _this.visible = false
        _this.$message.error(_this.$t('updateFailed'))
      }
    })

    // 点击叉叉隐藏到托盘
    this.$electron.ipcRenderer.on('before_hide', () => {
      this.$electron.ipcRenderer.send('app-hide')
    })
    // 退出程序事件
    this.$electron.ipcRenderer.on('before_closed', () => {
      let that = this
      let { kefu_code, seller_code } = that.$route.query
      if (kefu_code && seller_code) {
        let userInfo = JSON.parse(
          localStorage.getItem(that.$route.query.seller_code)
        )[that.$route.query.kefu_code]
        that.$socket.emit('message', {
          cmd: 'service-status',
          kefu_code: userInfo.kefu_code,
          kefu_id: userInfo.kefu_id,
          seller_code: userInfo.seller_code,
          username: userInfo.kefu_name,
          headimg: userInfo.kefu_avatar,
          online_status: 0,
        })
        let info = JSON.parse(localStorage.getItem(seller_code))
        delete info[kefu_code]
        localStorage.setItem(seller_code, JSON.stringify(info))
      }
      that.$router.push({ name: 'Login' })
      that.$store.commit('SET_USER_INFO', '')
      that.$store.commit('RESETVUEX')
      this.$electron.ipcRenderer.send('app-closed')
    })
  },
  methods: {
    // 刷新当前页
    reload: function() {
      this.appView = false
      this.$nextTick(function() {
        this.appView = true
      })
    },
  },
}
</script>

<style>
/* CSS */
#app {
  height: 100%;
  overflow: hidden;
}
.ant-layout-header {
  height: 55px !important;
  padding: 0 50px !important;
  line-height: 55px !important;
  background: #2a2b2d !important;
}
.ant-menu-dark,
.ant-menu-dark .ant-menu-sub {
  color: rgba(255, 255, 255, 0.65);
  background: #2a2b2d !important;
}
</style>
