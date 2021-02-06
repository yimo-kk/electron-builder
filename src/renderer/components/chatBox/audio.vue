<template>
  <div class="record_content pointer flex_up_down_center" @click="audio">
    <p
      class="time"
      style="marginleft:10px"
      v-if="playdata.from_name === userInfo.kefu_name && time"
    >
      {{ playdata.file_duration || playdata.message.duration }}"
    </p>
    <div
      :class="[
        'cricleplay',
        playdata.from_name === userInfo.kefu_name ? 'different' : '',
      ]"
      status="stop"
      no="1"
    >
      <div class="small"></div>
      <div :class="['middle', play ? '' : 'stopanimate']"></div>
      <div :class="['large', play ? '' : 'stopanimate']"></div>
    </div>
    <p class="time" v-if="playdata.from_name !== userInfo.kefu_name && time">
      {{ playdata.file_duration || playdata.message.duration }}"
    </p>
  </div>
</template>

<script>
export default {
  name: 'Audio',
  props: {
    data: {
      type: Object,
      default: () => {
        return {}
      },
    },
    isPlay: {
      type: Boolean,
      default: false,
    },
    time: Boolean,
  },
  data() {
    return {
      playdata: JSON.parse(JSON.stringify(this.data)),
      play: JSON.parse(JSON.stringify(this.isPlay)),
    }
  },
  computed: {
    userInfo() {
      return JSON.parse(localStorage.getItem(this.$route.query.seller_code))[
        this.$route.query.kefu_code
      ]
    },
  },
  watch: {
    isPlay(val) {
      this.play = this.isPlay
    },
    data: {
      handler: function(val) {
        this.playdata = JSON.parse(JSON.stringify(val))
      },
      deep: true,
    },
  },
  methods: {
    audio() {
      this.$emit('play', this.isPlay)
    },
  },
}
</script>

<style lang="less" scoped>
@import '@/style/common.less';
.record_content {
  .time {
    font-size: 12px;
    min-width: 20px;
    margin-left: 8px;
  }
}
.small {
  width: 14px;
  height: 14px;
  border-style: solid;
  border-top-color: transparent;
  border-left-color: transparent;
  border-bottom-color: transparent;
  border-radius: 50%;
  box-sizing: border-box;
  vertical-align: middle;
  display: inline-block;
  color: @audioColor;
}

.middle {
  width: 24px;
  height: 22px;
  border-style: solid;
  border-top-color: transparent;
  border-left-color: transparent;
  border-bottom-color: transparent;
  border-radius: 50%;
  box-sizing: border-box;
  vertical-align: middle;
  display: inline-block;
  margin-left: -22px;
  animation: show2 3s ease-in-out infinite;
  opacity: 1;
  color: @audioColor;
}

@keyframes show2 {
  0% {
    opacity: 0;
  }

  30% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
}

.cricleplay {
  width: 100%;
}

.different {
  transform: rotate(180deg);
}

.large {
  width: 34px;
  height: 30px;
  border-style: solid;
  border-top-color: transparent; //大专栏 纯css3配合vue实现微信语音播放效果;
  border-left-color: transparent;
  border-bottom-color: transparent;
  border-radius: 50%;
  box-sizing: border-box;
  vertical-align: middle;
  display: inline-block;
  margin-left: -32px;
  animation: show3 3s ease-in-out infinite;
  opacity: 1;
  color: @audioColor;
}

@keyframes show3 {
  0% {
    opacity: 0;
  }

  60% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
}

.stopanimate {
  -moz-animation-name: none;
  -webkit-animation-name: none;
  -ms-animation-name: none;
  animation-name: none;
}
</style>
