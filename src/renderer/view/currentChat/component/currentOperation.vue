<template>
  <div class="current_operation">
    <div class="info">
      <p class="title">{{$t('currentInfo.accessInformation')}}</p>
      <p class="subTitle">
        {{$t('currentInfo.ip')}}:
      {{currentUser.login_ip}}
      </p>
      <p class="subTitle dwote" :title="currentUser.area">
        {{$t('currentInfo.area')}}：
      {{ currentUser.area}}
      </p>
    </div>
    <div class="remark info">
      <p class="title"> {{$t('currentInfo.otherOperations')}}</p>
      <a-button @click="multitapConversation">
        <customIcon type="icon-zhuanjie" style="fontSize:16px"></customIcon>{{$t('currentInfo.transferCurrentConversation')}}
      </a-button>
      <a-button @click="closeChat">
        <a-icon type="close-circle"  />{{$t('currentInfo.closeCurrentSession')}}
      </a-button>
    </div>
  </div>
</template>

<script>
import { reLink } from "@/api/current.js";

export default {
  name: "CurrentOperation",
  props: {
    groupTitle: {
      type: String,
    },
  },
  data() {
    return {
      IP: "",
      adress: "",
    };
  },
  computed: {
      currentUser() {
      return this.$store.state.Socket.currentUser;
    },
  },
  methods: {
    multitapConversation() {
      this.$emit("multitapConversation",'col');
    },
    closeChat(){
       this.$emit("closeChat",'col');
    }
  },
};
</script>

<style lang="less" scoped>
.current_operation {
  .info {
    .title {
      padding: 0 10px;
      height: 35px;
      background-color: #eee;
      line-height: 35px;
    }

    .subTitle {
      padding: 0 10px;
      height: 35px;
      width: 100%;
      line-height: 35px;

      span {
        margin-left: 20px;
      }
    }
  }

  .remark_content {
    border: 1px solid #eee;
    border-radius: 10px;
    margin: 10px;
  }
}
</style>
