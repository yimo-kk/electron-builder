<template>
  <div class="login flex_center">
    <div v-if="loading" class="spin">
      <a-spin class="loading"></a-spin>
    </div>
    <a-card style="width: 400px;textAlign: center;paddingTop:20px">
      <a-form
        :form="loginParam"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 17 }"
        @submit="handleSubmit"
      >
        <a-form-item :label="$t('login.shopUrl')" style="position: relative;">
          <a-input
            v-model="loginData.shopUrl"
            placeholder="例如：server.nikidigital.net"
            allowClear
          >
            <a-icon slot="prefix" type="fork" />
          </a-input>
        </a-form-item>
        <a-form-item :label="$t('login.shopCode')" style="position: relative;">
          <a-input
            @focus="shopCodeFocus"
            @blur="shopCodeBlur"
            v-model="loginData.shopCode"
            :placeholder="$t('login.pleaseShopCode')"
            allowClear
          >
            <a-icon slot="prefix" type="shop" />
          </a-input>
          <div
            class="show-shopCode pointer"
            v-show="showShopCode"
            @click="getShopCode"
          >
            <p
              v-for="(item, index) in shopCodeList"
              :key="index"
              :data-index="item.value"
              class="shopCode-item isShowShopCode"
            >
              {{ item.value }}
              <a-icon
                type="close-circle"
                @click.stop="closeShopCode(item.value)"
              />
            </p>
          </div>
        </a-form-item>
        <a-form-item :label="$t('login.account')" style="position: relative;">
          <!--  @blur="accountBlur" -->
          <a-input
            @focus="accountFocus"
            @blur="accountBlur"
            v-model="loginData.account"
            :placeholder="$t('login.pleaseAccount')"
            allowClear
          >
            <a-icon slot="prefix" type="user" />
          </a-input>
          <div
            class="show-shopCode pointer"
            v-show="showAccountList"
            @click="getAccount"
          >
            <p
              v-for="(item, index) in shopAccountList"
              :key="index"
              :data-index="
                JSON.stringify({ account: item.value, password: item.password })
              "
              class="shopCode-item isShopAccount"
            >
              {{ item.value }}
              <a-icon
                type="close-circle"
                @click.stop="
                  closeAccount({ account: item.value, password: item.password })
                "
              />
            </p>
          </div>
        </a-form-item>
        <a-form-item :label="$t('login.password')">
          <a-input-password
            v-model="loginData.password"
            :placeholder="$t('login.pleaseAccount')"
            allowClear
          >
            <a-icon slot="prefix" type="lock" />
          </a-input-password>
        </a-form-item>
        <a-form-item :wrapper-col="{ span: 17, offset: 4 }">
          <a-button type="primary" html-type="submit" style="width:100%">
            {{ $t('login.logIn') }}</a-button
          >
          <div class="other_language">
            <a-checkbox
              v-decorator="[
                'remember',
                {
                  valuePropName: 'checked',
                  initialValue: true,
                },
              ]"
            >
              <p class="remember_password">{{ $t('login.remember') }}</p>
            </a-checkbox>
            <p
              class="language"
              @click="changeLocale(localeval === 'zh' ? 'en' : 'zh')"
            >
              {{ localeval == 'zh' ? 'English' : '中文' }}
            </p>
          </div>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script>
import Store from 'electron-store'
const store = new Store()
import { mapActions, mapMutations } from 'vuex'
import { isLocalStorage } from '@/utils/libs'
import moment from 'moment'
import 'moment/locale/zh-cn'
moment.locale('zh-cn')
export default {
  // 登录
  name: 'Login',
  data() {
    return {
      localeval: localStorage.getItem('lang') || 'zh',
      ip: '',
      loading: false,
      loginParam: this.$form.createForm(this, {
        name: 'login',
      }),
      loginData: {
        shopUrl: '',
        shopCode: '',
        account: '',
        password: '',
      },
      showShopCode: false,
      shopCodeList: [],
      showAccountList: false,
      shopAccountList: [],
      loginUserInfo: {}, //存储得数据
    }
  },
  watch: {
    showShopCode(val) {
      val && (this.showAccountList = !val)
    },
    showAccountList(val) {
      val && (this.showShopCode = !val)
    },
    'loginData.account'(newVal, oldVal) {
      let isShopAccount = this.loginUserInfo.loginInfo.some((item) => {
        return (
          item.value == this.loginData.shopCode &&
          item.children.some((val) => {
            return val.value == newVal
          })
        )
      })
      if (!isShopAccount) {
        this.loginData.password = ''
      } else {
        this.shopAccountList.forEach((item) => {
          if (item.value == this.loginData.shopCode) {
            item.children.forEach((val) => {
              val.account == newVal && (this.loginData.password = val.password)
            })
          }
        })
      }
    },
  },
  methods: {
    ...mapActions(['handleLogin', 'getUserInfo']),
    ...mapMutations(['SET_USER_INFO', 'SET_LOGINSTATE', 'SET_SHOPURL']),
    handleSubmit(e) {
      e.preventDefault()
      this.loginParam.validateFields((err, values) => {
        if (!err) {
          if (!this.loginData.shopCode) {
            this.$message.error(this.$t('correctCode'))
            return
          }
          if (!this.loginData.account) {
            this.$message.error(this.$t('login.pleasePassword'))
            return
          }
          if (!this.loginData.password) {
            this.$message.error(this.$t('login.pleasePassword'))
            return
          }
          let params = {
            shopUrl: this.loginData.shopUrl,
            username: this.loginData.account,
            password: this.loginData.password,
            seller_code: this.loginData.shopCode,
          }
          this.loading = true
          localStorage.setItem('shopUrl', this.loginData.shopUrl)
          this.SET_SHOPURL(this.loginData.shopUrl)
          this.handleLogin(params)
            .then((result) => {
              if (result.code === 0) {
                if (values.remember) {
                  this.loginSave({
                    logoNum: params.seller_code,
                    account: params.username,
                    password: params.password,
                    shopUrl: params.shopUrl,
                  })
                } else {
                  this.loginSave(params.seller_code, params.username, '')
                }
                this.$message.success(result.msg)
                this.getUserData(params, result)
              } else if (result.code === -7) {
                // this.$socket.emit('message', {
                //   cmd: 'forced',
                //   seller_code: params.seller_code,
                //   kefu_name: params.username,
                // })
                this.getUserData(params, result)
              } else {
                this.loading = false
                this.$toast({
                  content: result.msg,
                })
              }
              this.SET_LOGINSTATE(result.code)
            })
            .catch((error) => {
              this.loading = false
            })
        }
      })
    },
    // 校验商家标识
    validateShopCode(rule, value, callback) {
      var reg = /[^\w\.\/]/
      if (value && reg.test(value)) {
        callback(this.$t('correctCode'))
      } else {
        callback()
      }
    },
    //获取
    getCookies() {
      if (Object.keys(this.loginUserInfo).length) {
        let {
          shopUrl,
          logoNum,
          account,
          password,
        } = this.loginUserInfo.currentLogin
        this.loginData = {
          account: account,
          password: password,
          shopCode: logoNum,
          shopUrl,
        }
      }
    },

    getUserData(params, result) {
      this.getUserInfo({
        accessToken: result.data.accessToken,
        refreshToken: result.data.refreshToken,
      }).then((res) => {
        let kefu_info = res.data
        kefu_info['accessToken'] = result.data.accessToken
        kefu_info['refreshToken'] = result.data.refreshToken
        if (isLocalStorage(params.seller_code)) {
          let code = JSON.parse(localStorage.getItem(params.seller_code))
          code[res.data.kefu_code] = kefu_info
          localStorage.setItem(params.seller_code, JSON.stringify(code))
        } else {
          let obj = {}
          obj[res.data.kefu_code] = kefu_info
          localStorage.setItem(params.seller_code, JSON.stringify(obj))
        }
        this.loading = false
        res.code === 1 &&
          this.$router.push({
            name: 'Home',
            query: {
              seller_code: params.seller_code,
              kefu_code: res.data.kefu_code,
              kefu_name: this.loginData.account,
            },
          })
      })
    },
    // 存储账号等
    loginSave({ shopUrl, logoNum, account, password }) {
      //当前登录账号信息
      let loginUserInfo = {
        currentLogin: {
          logoNum,
          account,
          password,
          shopUrl,
        },
      }
      // 获取数据查找当前商家是否存在
      let userInfo = store.get('loginUserInfo')
      let userInfoList = []
      if (userInfo) {
        userInfoList = JSON.parse(JSON.stringify(userInfo.loginInfo))
        let isNotUserInfo = true
        let isAccount = true
        for (let item in userInfoList) {
          if (
            userInfoList[item].label === 'logoNum' &&
            userInfoList[item].value === logoNum
          ) {
            isNotUserInfo = false
            for (let val in userInfoList[item].children) {
              if (
                userInfoList[item].children[val].label === 'account' &&
                userInfoList[item].children[val].value === account
              ) {
                isAccount = false
                userInfoList[item].children[val].password = password
              }
            }
            isAccount &&
              userInfoList[item].children.push({
                value: account,
                label: 'account',
                password: password,
              })
          }
        }
        isNotUserInfo &&
          userInfoList.push({
            value: logoNum,
            label: 'logoNum',
            children: [
              {
                value: account,
                label: 'account',
                password: password,
              },
            ],
          })
      } else {
        // 所有账号
        userInfoList = [
          {
            value: logoNum,
            label: 'logoNum',
            children: [
              {
                value: account,
                label: 'account',
                password: password,
              },
            ],
          },
        ]
      }
      loginUserInfo.loginInfo = userInfoList
      store.set({ loginUserInfo })
    },
    // 商家标识框获取和失去焦点
    shopCodeFocus() {
      if (this.loginUserInfo && this.loginUserInfo.loginInfo) {
        this.shopCodeList = this.loginUserInfo.loginInfo
        this.showShopCode = true
      }
    },
    shopCodeBlur() {
      if (this.loginUserInfo.loginInfo) {
        let isExist = this.loginUserInfo.loginInfo.some((item) => {
          return this.loginData.shopCode == item.value
        })
        if (!isExist) {
          this.shopAccountList = []
          this.loginData.account = ''
          this.loginData.password = ''
        }
      }
    },
    getShopCode(e) {
      if (!e.target.dataset.index) return
      if (this.loginData.shopCode != e.target.dataset.index) {
        this.loginData.shopCode = e.target.dataset.index
        this.loginData.account = ''
        this.loginData.password = ''
      }
      this.showShopCode = false
    },
    // 获取账号 获取焦点和失去焦点
    accountFocus() {
      this.showShopCode = false
      if (this.loginData.shopCode && Object.keys(this.loginUserInfo).length) {
        this.loginUserInfo.loginInfo.filter((item) => {
          return (
            item.value === this.loginData.shopCode &&
            (this.shopAccountList = item.children)
          )
        })
        this.shopAccountList.length && (this.showAccountList = true)
      }
    },
    accountBlur() {
      !this.shopAccountList.some((item) => {
        return item.value == this.loginData.account
      }) && (this.loginData.password = '')
    },
    accountChange() {
      this.loginData.password = ''
    },
    getAccount(e) {
      let accountAndPassword = JSON.parse(e.target.dataset.index)
      if (!e.target.dataset.index) return
      this.loginData.account = accountAndPassword.account
      this.loginData.password = accountAndPassword.password
      this.showAccountList = false
    },
    // 删除 账号
    closeAccount(data) {
      let userList = JSON.parse(JSON.stringify(this.loginUserInfo))['loginInfo']
      userList.forEach((item) => {
        if (item.value == this.loginData.shopCode) {
          let childrens = item.children.filter((val) => {
            return val.value != data.account
          })
          item.children = childrens
          if (data.account == this.loginData.account) {
            this.loginData.account = ''
            this.loginData.password = ''
          }
          this.shopAccountList = childrens
        }
      })
      this.$set(this.loginUserInfo, 'loginInfo', userList)
      store.set({ loginUserInfo: this.loginUserInfo })
    },
    // 删除商家标识
    closeShopCode(shopCode) {
      let userList = JSON.parse(JSON.stringify(this.loginUserInfo))[
        'loginInfo'
      ].filter((item) => {
        return item.value != shopCode
      })
      if (shopCode == this.loginData.shopCode) {
        this.loginData.shopCode = ''
        this.loginData.account = ''
        this.loginData.password = ''
      }
      this.shopCodeList = userList
      this.$set(this.loginUserInfo, 'loginInfo', userList)
      store.set({ loginUserInfo: this.loginUserInfo })
    },
    notClick() {
      document.addEventListener('click', (e) => {
        let flag = e.target.contains(
          document.getElementsByClassName('isShopAccount')[0]
        )
        if (!flag) return
        this.showAccountList = false
      })
      document.addEventListener('click', (e) => {
        let flag = e.target.contains(
          document.getElementsByClassName('isShowShopCode')[0]
        )
        if (!flag) return
        this.showShopCode = false
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
        // this.setLocale()
      }
    },
  },
  mounted() {
    // store.delete('loginUserInfo') // 清空存储数据
    // console.log(store.get('loginUserInfo'), '获取得数据')
    this.loginUserInfo = store.get('loginUserInfo') || {}
    this.getCookies()
    this.notClick()
    // this.$socket
  },
}
</script>

<style lang="less" scoped>
@import '@/style/common.less';
.login {
  .full_height();
  height: 100vh;
  background: url('../../assets/loginBg.jpg') no-repeat;
  background-size: cover;
  position: relative;
}
.spin {
  width: 100%;
  .full_height();
  background-color: rgba(0, 0, 0, 0.4);
  position: absolute;
  left: 0;
  top: 0;
  z-index: 333;

  .loading {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 555;
  }
}
.remember_password {
  font-size: 10px;
  color: #ccc;
}
.show-shopCode {
  background: rgba(255, 255, 255, 0.8);
  position: absolute;
  left: 0px;
  top: 30px;
  border-radius: 2px;
  box-shadow: 0px 0px 4px 1px #ccc;
  width: 100%;
  z-index: 45;
  overflow: auto;
  max-height: 130px;
  .shopCode-item {
    padding: 0 15px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    &:hover {
      background-color: #ededed;
    }
  }
}
.other_language {
  display: flex;
  justify-content: space-between;
  align-items: center;
  .language {
    border-radius: 5px;
    border: 1px solid #ccc;
    line-height: 20px;
    font-size: 12px;
    height: 20px;
    padding: 0px 3px;
    cursor: pointer;
  }
}
/deep/.ant-input {
  font-size: 12px;
  border: 1px solid #d9d9d9;
}
/deep/.ant-form-item-control {
  text-align: left;
}
/deep/.ant-form-explain {
  font-size: 12px;
}
/deep/ .ant-checkbox-wrapper {
  display: flex;
  align-items: center;
  // width: 6rem;
}
</style>
