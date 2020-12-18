<template>
  <div class="popup">
    <div class="mask flex_center">
      <div class="popup-content">
        <div class="popup-title flex">
          <p>发送给：</p>
          <a-icon type="close" @click="cancel" />
        </div>
        <div class="send-to flex">
          <img :src="HeadImg" alt="" />
          <p>{{ sendToName }}</p>
        </div>
        <div class="send-content dwwo-3">
          {{ type == 1 ? '[图片]  ' : '[文件]  ' }}{{ fileName }}{{ type }}
        </div>
        <div class="footer">
          <a-button
            type="primary"
            size="small"
            @click="ensure"
            style="fontSize:12px"
          >
            确定
          </a-button>
          <a-button
            type="link"
            size="small"
            @click="cancel"
            style="fontSize:12px"
          >
            取消
          </a-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Popup',
  props: {
    type: Number,
    fileName: String,
    HeadImg: String,
    sendToName: String,
  },
  data() {
    return {}
  },
  computed: {},
  watch: {},
  methods: {
    ensure() {
      this.$emit('ensure')
    },
    cancel() {
      this.$emit('cancel')
    },
  },
  created() {},
  mounted() {},
}
</script>
<style lang="less" scoped>
.popup {
  .mask {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 99;
    width: 100vw;
    height: 100vh;
    background-color: rgba(204, 204, 204, 0.2);
    .popup-content {
      position: relative;
      width: 350px;
      height: 230px;
      border-radius: 5px;
      background-color: #fff;
      box-shadow: 0px 0px 8px 4px #eee;
      padding: 12px;
      .popup-title {
        justify-content: space-between;
      }
      .send-to {
        padding: 15px 20px;
        img {
          width: 30px;
          height: 30px;
          margin-right: 20px;
        }
      }
      .send-content {
        background-color: #eee;
        border-radius: 3px;
        margin: 0 10px;
        padding: 10px;
        word-break: break-all;
        max-height: 87px;
      }
      .footer {
        position: absolute;
        bottom: 10px;
        right: 10px;
      }
    }
  }
}
</style>
