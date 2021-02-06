import Vue from "vue";
import Router from "vue-router";
import store from "../store";
import routers from "./router";
// socket
import SocketIO from "socket.io-client";
import VueSocketIO from "vue-socket.io";
// import { BaseUrl } from '@/config.js'
Vue.use(Router);
const originalPush = Router.prototype.push;
Router.prototype.push = function push (location, onResolve, onReject) {
  if (onResolve || onReject)
    return originalPush.call(this, location, onResolve, onReject);
  return originalPush.call(this, location).catch((err) => err);
};
const router = new Router({
  model: history,
  routes: routers,
});
router.beforeEach((to, from, next) => {
  let token;
  let { kefu_code, seller_code } = to.query;
  if (
    localStorage.getItem(seller_code) &&
    JSON.parse(localStorage.getItem(seller_code))[kefu_code]
  ) {
    token = JSON.parse(localStorage.getItem(seller_code))[kefu_code][
      "accessToken"
    ];
  }

  store.commit("SET_CURRENT_PAGE", to.name);
  if (!token && to.name !== "Login") {
    // 未登录且要跳转的页面不是登录页
    next({
      name: "Login", // 跳转到登录页
    });
  } else if (!token && to.name === "Login") {
    // 未登陆且要跳转的页面是登录页
    next(); // 跳转
  }
  if (to.name === "Login") {
    store.commit("RESETVUEX");
    store.commit("SET_USER_INFO", "");
    next(); // 跳转
  }
  if (to.name !== "Login") {
    let path
    if (seller_code && kefu_code) {
      path = `/socket.io/?username=${kefu_code}&code=${seller_code}&`
    } else {
      path = `/socket.io/?username=loginauth&`
    }
    let url = localStorage.getItem('shopUrl') || store.state.Setting.shopUrl
    url && Vue.use(
      new VueSocketIO({
        debug: true,
        connection: SocketIO.connect(`wss://${url}`, {
          // connection: SocketIO.connect(`wss://server.nikidigital.net`, {
          path: path,
          transports: ["websocket"],
        }),
        vuex: {
          store,
          mutationPrefix: "SOCKET_",
          actionPrefix: "SOCKET_",
        },
      })
    );

  }
  next();
});

export default router;
