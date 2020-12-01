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
        <a-form-item :label="$t('login.shopCode')">
          <a-input
            :placeholder="$t('login.pleaseShopCode')"
            v-decorator="[
              'shopCode',
              { initialValue: loginData.shopCode },
              {
                rules: [
                  { required: true, message: $t('login.pleaseShopCode') },
                  {
                    validator: validateShopCode,
                  },
                ],
              },
            ]"
            allowClear
          >
            <a-icon slot="prefix" type="shop" />
          </a-input>
        </a-form-item>
        <a-form-item :label="$t('login.account')">
          <a-input
            :placeholder="$t('login.pleaseAccount')"
            v-decorator="[
              'account',
              { initialValue: loginData.account },
              {
                rules: [{ required: true, message: $t('login.pleaseAccount') }],
              },
            ]"
            allowClear
          >
            <a-icon slot="prefix" type="user" />
          </a-input>
        </a-form-item>
        <a-form-item :label="$t('login.password')">
          <a-input-password
            :placeholder="$t('login.pleasePassword')"
            v-decorator="[
              'password',
              { initialValue: loginData.password },
              {
                rules: [
                  { required: true, message: $t('login.pleasePassword') },
                ],
              },
            ]"
            allowClear
          >
            <a-icon slot="prefix" type="lock" />
          </a-input-password>
        </a-form-item>
        <a-form-item :wrapper-col="{ span: 17, offset: 4 }">
          <a-button type="primary" html-type="submit" class="full_height">
            {{ $t('login.logIn') }}</a-button
          >
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
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script>
const session = require('electron').remote.session
const { remote } = require('electron')
import { mapActions, mapMutations } from 'vuex'
import { isLocalStorage } from '@/utils/libs'
export default {
  name: 'Login',
  data() {
    return {
      ip: '',
      loading: false,
      loginParam: this.$form.createForm(this, {
        name: 'login',
      }),
      loginData: {
        shopCode: '',
        account: '',
        password: '',
      },
      url: 'https://server.nikidigital.net',
    }
  },
  methods: {
    ...mapActions(['handleLogin', 'getUserInfo']),
    ...mapMutations(['SET_USER_INFO']),
    handleSubmit(e) {
      e.preventDefault()
      this.loginParam.validateFields((err, values) => {
        if (!err) {
          let params = {
            username: values.account,
            password: values.password,
            seller_code: values.shopCode,
          }
          if (values.remember) {
            this.setCookie('seller_code', params.seller_code)
            this.setCookie('username', params.username)
            this.setCookie('password', params.password)
          } else {
            this.clearCookies()
          }
          this.loading = true
          this.handleLogin(params)
            .then((result) => {
              if (result.code === 0) {
                this.$message.success(result.msg)
                this.getUserData(params, result)
              } else if (result.code === -7) {
                this.$socket.emit('message', {
                  cmd: 'forced',
                  seller_code: params.seller_code,
                  kefu_name: params.username,
                })
                this.getUserData(params, result)
              } else {
                this.loading = false
                this.$toast({
                  content: result.msg,
                })
              }
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
        callback('请输入正确的商家标识码！')
      } else {
        callback()
      }
    },
    // 存储账号等
    setCookie(name, value) {
      localStorage.setItem(name, value)
      // let Days = 300;
      // let exp = new Date();
      // let date = Math.round(exp.getTime() / 1000) + Days * 24 * 60 * 60;
      //  const cookie = {
      //   url:this.url,
      //   name: name,
      //   value: value,
      //   expirationDate: date
      // };
      // session.defaultSession.cookies.set(cookie, (error) => {
      //   if (error) console.error(error);
      // });
    },
    /**
     * 获得
     */
    getCookies() {
      this.loginData = {
        account: localStorage.getItem('username'),
        password: localStorage.getItem('password'),
        shopCode: localStorage.getItem('seller_code'),
      }

      //   session.defaultSession.cookies.get({ url: this.url },  (error, cookies)=> {
      //     if (cookies.length > 0) {
      //       this.$nextTick(()=>{
      //           this.loginData = {
      //           account:cookies[1].name == 'username' ? cookies[1].value:'',
      //           password:cookies[2].name  == 'password' ? cookies[2].value:'',
      //           shopCode:cookies[0].name  == 'seller_code' ? cookies[0].value:''
      //         }
      //       })
      //     }
      //   });
    },
    /**
     * 清空缓存
     */
    clearCookies() {
      localStorage.removeItem('username')
      localStorage.removeItem('password')
      localStorage.removeItem('seller_code')
      //   session.defaultSession.clearStorageData({
      //     origin: this.url,
      //     storages: ['cookies']
      //   }, function (error) {
      //     if (error) console.error(error);
      //   })
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
            },
          })
      })
    },
  },
  mounted() {
    this.getCookies()
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
}
</style>
