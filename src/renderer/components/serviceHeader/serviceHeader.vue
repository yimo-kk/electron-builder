<template>
  <div class="serviceHeader flex_up_down_center">
    <div v-if="Object.keys(userInfo).length > 0" class="flex_up_down_center">
      <div>
        <a-badge
          :status="
            kefuStatus == 1
              ? 'success'
              : kefuStatus == 2
              ? 'warning'
              : 'default'
          "
          class="flex"
          :offset="[0, 25]"
          :title="
            kefuStatus == 1
              ? $t('online')
              : kefuStatus == 2
              ? $t('goAway')
              : $t('offline')
          "
        >
          <a-avatar
            :src="userInfo.kefu_avatar"
            :title="
              kefuStatus == 1
                ? $t('online')
                : kefuStatus == 2
                ? $t('goAway')
                : $t('offline')
            "
          />
        </a-badge>
      </div>
      <div class="flex_up_down_center login_state">
        <a-dropdown placement="bottomLeft">
          <a-button type="link">
            {{ userInfo.kefu_name }}
            <a-icon type="down" />
          </a-button>
          <a-menu slot="overlay">
            <a-menu-item>
              <p @click="setStatus(1)">{{ $t('online') }}</p>
            </a-menu-item>
            <a-menu-item>
              <p @click="setStatus(2)">{{ $t('goAway') }}</p>
            </a-menu-item>
            <a-menu-item>
              <p @click="setting">{{ $t('setting') }}</p>
            </a-menu-item>
            <a-menu-item>
              <p @click="telegramSetting">
                {{ $t('telegramAccount') }}
              </p>
            </a-menu-item>
            <a-menu-item>
              <p @click="refresh">{{ $t('refresh') }}</p>
            </a-menu-item>
            <a-menu-item>
              <p @click="confirm">{{ $t('outLogin') }}</p>
            </a-menu-item>
          </a-menu>
        </a-dropdown>
      </div>
    </div>
    <div class="language flex">
      <span @click="changeLocale(localeval === 'zh' ? 'en' : 'zh')">{{
        localeval == 'zh' ? 'English' : '中文'
      }}</span>
    </div>
    <a-modal
      :title="$t('setting')"
      width="60%"
      :visible="isSetting"
      @ok="handleOk"
      @cancel="isSetting = false"
    >
      <div class="setting-style">
        <a-form>
          <a-form-item :label="$t('transfer_task')">
            <a-checkbox v-model="settingData.transfer_task">
              {{ $t('task') }}
            </a-checkbox>
            <a-checkbox v-model="settingData.transfer_tray">
              {{ $t('tray') }}
            </a-checkbox>
            <a-checkbox v-model="settingData.transfer_sound">
              {{ $t('voicePrompt') }}
            </a-checkbox>
          </a-form-item>
          <a-form-item :label="$t('toBeConnected')">
            <a-checkbox v-model="settingData.menu_prompt">
              {{ $t('waitNum') }}
            </a-checkbox>
          </a-form-item>
          <a-form-item :label="$t('groupPrompt')">
            <a-checkbox v-model="settingData.group_task">
              {{ $t('task') }}
            </a-checkbox>
            <a-checkbox v-model="settingData.group_tray">
              {{ $t('tray') }}
            </a-checkbox>
            <a-checkbox v-model="settingData.group_sound">
              {{ $t('voicePrompt') }}
            </a-checkbox>
            <a-checkbox v-model="settingData.group_receive">
              {{ $t('userMessageNum') }}
            </a-checkbox>
            <a-checkbox v-model="settingData.group_menu">
              {{ $t('menuMessageNum') }}
            </a-checkbox>
          </a-form-item>
          <a-form-item :label="$t('userPrompt')">
            <a-checkbox v-model="settingData.user_task">
              {{ $t('task') }}
            </a-checkbox>
            <a-checkbox v-model="settingData.user_tray">
              {{ $t('tray') }}
            </a-checkbox>
            <a-checkbox v-model="settingData.user_sound">
              {{ $t('voicePrompt') }}
            </a-checkbox>
            <a-checkbox v-model="settingData.user_join">
              {{ $t('userEntry') }}
            </a-checkbox>
            <a-checkbox v-model="settingData.user_receive">
              {{ $t('userMessageNum') }}
            </a-checkbox>
            <a-checkbox v-model="settingData.menu_total">
              {{ $t('menuMessageNum') }}
            </a-checkbox>
          </a-form-item>
          <a-form-item :label="$t('messagePrompt')">
            <a-checkbox v-model="settingData.stay_num">
              {{ $t('meneTotal') }}
            </a-checkbox>
          </a-form-item>
        </a-form>
      </div>
    </a-modal>
    <a-modal
      :title="$t('telegramAccount')"
      :visible="telegramShow"
      @ok="telegramOk"
      @cancel="telegramShow = false"
      :okText="$t('submit')"
      :cancelText="$t('cancel')"
    >
      <div class="telegram">
        <p>{{ $t('binding') }}</p>
        <a-switch
          style="margin:0 5px"
          :checked-children="$t('yes')"
          :un-checked-children="$t('no')"
          v-model="selectStatus"
        />
        <span class="prompt">{{
          $t('accountStart') + userInfo.kefu_code + $t('accountEnd')
        }}</span>
      </div>
    </a-modal>
  </div>
</template>

<script>
import common from '@/mixins/common'
import moment from 'moment'
import 'moment/locale/zh-cn'
moment.locale('zh-cn')
import { mapMutations, mapActions } from 'vuex'
import { isBindTelegram, saveBindTelegram } from '@/api/index'

export default {
  name: 'ServiceHeader',
  inject: ['reload'],
  mixins: [common()],
  data() {
    return {
      selectStatus: false,
      telegramShow: false,
      istelegram: false,
      settingData: {
        group_menu: true,
        group_receive: true,
        group_sound: true,
        group_task: true,
        group_tray: true,
        menu_prompt: true,
        stay_num: true,
        transfer_sound: true,
        transfer_task: true,
        transfer_tray: true,
        user_join: true,
        user_receive: true,
        user_sound: true,
        user_task: true,
        user_tray: true,
        menu_total: true,
      },
      localeval: localStorage.getItem('lang') || 'zh',
      isSetting: false,
    }
  },
  computed: {
    kefuStatus() {
      return this.$store.state.Socket.kefuStatus.online_status
    },
    userInfo() {
      return JSON.parse(localStorage.getItem(this.$route.query.seller_code))[
        this.$route.query.kefu_code
      ]
    },
  },
  watch: {
    '$store.state.Setting.prompt'(val) {
      this.settingValue = val
    },
  },
  methods: {
    moment,
    ...mapActions(['getKefuSystemData', 'updateKefuSystemData']),
    ...mapMutations([
      'RESETVUEX',
      'SET_MULTITAPPROMPT',
      'SET_USERPROMPT',
      'SET_GROUPPROMPT',
      'SET_AWAITPROMPT',
      'SET_MESSAGEPROMPT',
      'SET_SETTING',
    ]),
    confirm() {
      let that = this
      this.$confirm({
        title: this.$t('prompt'),
        content: this.$t('loginPrompt'),
        okText: this.$t('determine'),
        cancelText: this.$t('cancel'),
        onOk() {
          that.$emit('setStatus', 0)
          that.$router.push({
            name: 'Login',
          })
          that.RESETVUEX()
          localStorage.clear()
        },
        onCancel() {},
      })
    },
    refresh() {
      location.reload()
    },
    setStatus(index) {
      if (this.kefuStatus == index) return
      let that = this
      this.$confirm({
        title: this.$t('prompt'),
        content: `${this.$t('update')} ${
          index == 1
            ? this.$t('online')
            : index == 2
            ? this.$t('goAway')
            : this.$t('offline')
        } ${this.$t('status')} `,
        okText: this.$t('determine'),
        cancelText: this.$t('cancel'),
        onOk() {
          that.$emit('setStatus', index)
          if (index === 1) {
            that.refresh()
          }
        },
      })
    },
    changeLocale(localeval) {
      this.localeval = localeval
      if (localeval === 'en') {
        moment.locale('en')
        this.$i18n.locale = 'en'
        localStorage.setItem('lang', 'en')
        this.$nextTick(() => {
          this.locale = null
        })
      } else {
        moment.locale('zh')
        this.$i18n.locale = 'zh'
        localStorage.setItem('lang', 'zh')
      }
    },
    setting() {
      this.getKefuSystemData({ kefu_id: this.userInfo.kefu_id }).then((res) => {
        this.settingData = JSON.parse(JSON.stringify(res))
      })
      this.isSetting = true
    },
    handleOk() {
      this.updateKefuSystemData({
        kefu_id: this.userInfo.kefu_id,
        data: this.settingData,
      })
        .then(() => {
          this.$message.success(this.$t('updateSuccess'))
        })
        .catch((err) => {
          this.$message.error(this.$t('updateError'))
        })
      this.isSetting = false
    },
    telegramSetting() {
      this.isBindTelegram(this.userInfo.kefu_code)
        .then((result) => {
          this.telegramShow = true
          this.selectStatus = result
          this.istelegram = result
        })
        .catch((err) => {
          console.log(err)
          this.$message.error(this.$t('connectError'))
        })
    },
    telegramOk() {
      this.isBindTelegram(this.userInfo.kefu_code)
        .then((result) => {
          if (!result && this.selectStatus) {
            this.$confirm({
              title: this.$t('addError'),
              content:
                this.$t('accountStart') +
                this.userInfo.kefu_code +
                this.$t('accountEnd'),
              okText: this.$t('determine'),
            })
          } else {
            saveBindTelegram({
              kefu_code: this.userInfo.kefu_code,
              telegram_status: this.selectStatus ? 1 : 0,
            })
              .then((result) => {
                this.telegramShow = false
                this.$message.success(this.$t('updateSuccess'))
              })
              .catch((err) => {
                this.telegramShow = false
                this.$message.error(this.$t('connectError'))
              })
          }
        })
        .catch((err) => {
          console.log(err)
          this.$message.error(this.$t('connectError'))
        })
    },
    switchChange() {},
    isBindTelegram(kefu_code) {
      return new Promise(async (resolve, reject) => {
        await isBindTelegram({ kefu_code: kefu_code })
          .then((result) => {
            let res = result.telegram_status ? true : false
            resolve(res)
          })
          .catch((err) => {
            reject(err)
          })
      })
    },
  },
  mounted() {
    window.document.addEventListener('keyup', (e) => {
      if (e.code === 'F5') {
        this.refresh()
      }
    })
  },
  destroyed() {},
}
</script>

<style lang="less" scoped>
@import '@/style/common.less';
.serviceHeader {
  color: #fff;
  margin-right: -30px;
  padding-top: 10px;
  .login_state {
    margin: 0 5px;
    padding-top: 10px;
  }

  .notLogin {
    padding-top: 10px;
  }
  .language {
    padding-right: 10px;
    margin-right: -20px;
    span {
      border-radius: 10px;
      border: 1px solid #ccc;
      line-height: 20px;
      font-size: 12px;
      padding: 0px 3px;
      cursor: pointer;
    }
  }
}
.setting-style {
  height: 54vh;
  overflow: auto;
  .scrollbar();
}
.telegram {
  display: flex;
  padding: 10px;
  font-size: 13px;
  .prompt {
    font-size: 12px;
    color: #1e9fff;
  }
}
/deep/ .ant-form-item {
  margin-bottom: 0px;
}
/deep/ .ant-modal-body {
  padding: 0 0 0 24px;
}
</style>
