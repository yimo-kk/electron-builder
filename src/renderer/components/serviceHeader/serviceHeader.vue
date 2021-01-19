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
            <!-- <a-menu-item>
              <p @click="setStatus(0)">{{$t('offline')}}</p>
            </a-menu-item> -->
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
  </div>
</template>

<script>
const { remote } = require('electron')
import common from '@/mixins/common'
import moment from 'moment'
import 'moment/locale/zh-cn'
moment.locale('zh-cn')
import { mapMutations } from 'vuex'
export default {
  name: 'ServiceHeader',
  inject: ['reload'],
  mixins: [common()],
  data() {
    return {
      localeval: localStorage.getItem('lang') || 'zh',
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
  methods: {
    moment,
    ...mapMutations(['RESETVUEX']),
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
        },
        onCancel() {},
      })
    },
    refresh() {
      location.reload()
      // this.reload()
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
        this.setLocale()
      }
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
</style>
