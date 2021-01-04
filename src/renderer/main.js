import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
// antd ui
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';
import '@/assets/css.less'
import "@/assets/iconfont/iconfont.css";
import { Icon } from 'ant-design-vue'
import iconFont from './assets/iconfont/iconfont'
import './directives/index'
import i18n from './i18n/';
// 表情
import './assets/emjoy/emjoymethod.js'
import './assets/emjoy/emjoy.css'
import VueLazyload from 'vue-lazyload'
// 全局组件
import '@/components/global'
Vue.use(VueLazyload)
Vue.use(VueLazyload, {
  preLoad: 1.3,
  error: require('./assets/error.jpg'),
  loading: require('./assets/timg.gif'),
  attempt: 1
})
const customIcon = Icon.createFromIconfontCN({
  scriptUrl: iconFont
})
Vue.component('customIcon', customIcon)
if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
import Toast from '@/components/Toast/toast'
Vue.prototype.$toast = Toast
Vue.config.productionTip = false
Vue.use(Antd)
/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  i18n,
  template: '<App/>'
}).$mount('#app')
