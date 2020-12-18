//引入vue
import Vue from 'vue'
//引入同目录下的全部组件
const globalComponents = require.context('.', false, /\.vue$/);
//	字符串首字母大写处理
function strUp (str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
//依次进行注册
globalComponents.keys().forEach(key => {
  //获取单个组件内容
  const _component = globalComponents(key);
  //获取组件名称
  const _componentName = strUp(
    key.replace(/^\.\//, '').replace(/\.\w+$/, ''));

  //注册在vue上
  Vue.component(_componentName, _component.default || _component);
})
