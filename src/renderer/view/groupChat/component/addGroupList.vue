<template>
  <div class="add_group_list">
    <div style="width:200px;paddingBottom:10px">
      <a-input-search
        :placeholder="$t('awaitInfo.search')"
        enter-button
        @search="onSearch"
      />
    </div>
    <div v-if="isNotGroupList" style="textAlign: center">
      <a-spin tip="加载中..." />
    </div>
    <a-checkbox-group
      v-else
      v-model="addlist"
      :options="addGroupList"
      @change="onChangeCheckbox"
      style="display: flex; flex-wrap: wrap"
    >
      <div slot="label" slot-scope="scope" class="add_group_label">
        <div class="add_group_list_item">
          <img class="add_group_headimg" v-lazy="scope.headimg" alt />
          <a-badge
            :status="scope.online_status ? 'success' : 'default'"
            :offset="[4, 12]"
            :title="scope.online_status ? $t('online') : $t('offline')"
          >
            <a-icon
              v-if="scope.status"
              slot="count"
              type="clock-circle"
              style="color: #f5222d"
            />
          </a-badge>
        </div>
        <p class="add_group_list_item_username dwote">
          {{ scope.username }}
        </p>
      </div>
    </a-checkbox-group>
  </div>
</template>

<script>
export default {
  name: 'AddGroupList',
  props: {
    selectAddlist: {
      type: Array,
      default() {
        return []
      },
    },
    addGroupList: {
      type: Array,
      default() {
        return []
      },
    },
    isNotGroupList: Boolean,
    isAddGroup: Boolean,
  },
  data() {
    return {
      addlist: [],
    }
  },
  watch: {
    isAddGroup(newVal) {
      if (!newVal) {
        this.addlist = []
      }
    },
  },
  methods: {
    onChangeAddList(vals) {
      this.$emit('onChangeAddList', vals)
    },
    onChangeCheckbox(vals) {
      this.$emit('onChangeCheckbox', vals)
    },
    onSearch(val) {
      this.$emit('addSearch', val)
    },
  },
}
</script>
<style lang="less" scoped>
@import '@/style/common.less';
.add_group_list {
  position: relative;
  max-height: 250px;
  overflow: auto;
  .scrollbar();
}
.add_group_label {
  .add_group_list_item {
    .add_group_headimg {
      width: 30px;
      height: 30px;
      border-radius: 4px;
    }
  }
}
.add_group_list_item_username {
  font-size: 12px;
  max-width: 100px;
}
</style>
