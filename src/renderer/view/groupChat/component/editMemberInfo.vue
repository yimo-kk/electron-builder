<template>
  <div class="editMemberInfo">
    <div class="flex_up_down_center old_name">
      <p class="padding">头像:</p>
      <img class="avatar padding" :src="updateUser.headimg" alt="" />
      <p class="nickName padding">昵称:</p>
      <p>{{ updateUser.username }}</p>
    </div>
    <a-input
      v-model="name"
      @change="newNickName"
      :placeholder="$t('inputName')"
    />
  </div>
</template>

<script>
export default {
  name: 'editMemberInfo',
  props: {
    updateUser: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  components: {},
  data() {
    return {
      name: '',
    }
  },
  methods: {
    newNickName(val) {
      this.$emit('newNickName', this.name)
    },
  },
  mounted() {},
}
</script>
<style lang="less" scoped>
.editMemberInfo {
  // padding: 40px;
}
.old_name {
  padding-bottom: 20px;
}
.padding {
  margin-right: 10px;
}
.nickName {
  padding-left: 10px;
}
.avatar {
  width: 30px;
  height: 30px;
  border-radius: 5px;
}
</style>
