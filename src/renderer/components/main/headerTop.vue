<template>
<div class='header-top'>
    <div class="log">
        <img src="../../assets/logo.png" alt />
        <p class="systemName">客服系统</p>
    </div>
    <div class="frame-actions">
        <!-- <a-icon type="shrink" class="item" @click="setFrame('mini')" /> -->
        <a-icon type="minus" class="item" @click="setFrame('min')" />
        <a-icon type="border" class="item" @click="setFrame('plus')"  />
        <a-icon type="close" class="item" @click="setFrame('close')" />
  </div>
</div>
</template>

<script>
export default {
name:'HeaderTop',
components: {},
data() {
return {

}
},
computed: {},
watch: {},
methods: {
setFrame(action){
      switch (action) {
        case "min":
          this.$electron.ipcRenderer.send("window-min");
          break;
        case "plus":
          this.$electron.ipcRenderer.send("window-max");
          break;
        case "close":
          this.$electron.ipcRenderer.send("window-close");
          break;
    }
}
},
created() {

},
mounted() {

},
}
</script>
<style lang='less' scoped>
.header-top{
    height: 30px;
    background-color: #fff;
    display: flex;
    justify-content: space-between;
    -webkit-app-region: drag;
    .log {
        display: flex;
        justify-content: center;
        align-items: center;
         margin-left: 10px;
        img {
        width: 25px;
        height: 24px;
        }

    .systemName {
        color: #7c32af;
        margin-left: 5px;
        font-size: 12px;
    }
  }
 .frame-actions {
  display: flex;
  align-items: center;
  -webkit-app-region: no-drag;
  .item {
    padding: 0 15px;
    vertical-align: unset;
    font-size: 16px;
    height: 30px;
    line-height: 35px;
    color: #848484;
    cursor: pointer;
    &:hover{
        background: #eee;
        color: #6E6E6E;
    }
  }
  
}
}
</style>