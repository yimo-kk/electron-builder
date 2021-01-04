<template>
  <div
    class="list_item flex_up_down_center"
    @click="selectGroup(groupData)"
    @contextmenu.prevent="handleRight"
    :data-index="index"
  >
    <a-badge
      :data-index="index"
      :count="groupData.badgeShow || groupData.noReadNum"
      :overflow-count="99"
    >
      <img
        class="head_portrait"
        v-lazy="groupData.group_avatar || groupData.headimg"
        alt
        :data-index="index"
      />
    </a-badge>

    <div class="group_name" :data-index="index">
      <div :data-index="index" class="title-new-time">
        <div class="flex" style="overflow: hidden;">
          <p
            style="marginRight:5px"
            class="current-name dwote"
            :data-index="index"
          >
            {{ groupData.group_name || groupData.username }}
          </p>
          <level
            v-show="!isHeadImg"
            :num="parseInt(groupData.level)"
            :data-index="index"
          ></level>
        </div>
        <span style="color: #adb8c4;">
          {{ groupData.lastMsg ? groupData.lastMsg.create_time : '' | hours }}
        </span>
      </div>

      <p :data-index="index" class="view-content dwote">
        {{ groupData.lastMsg | viewContent }}
      </p>
    </div>
    <div v-show="groupData.isMultitap" class="multitap">
      <customIcon
        type="icon-zhuanjie"
        style="fontSize:12px;color:#1890ff"
        :title="$t('currentInfo.transfer')"
      ></customIcon>
    </div>
  </div>
</template>

<script>
import { conversionFace } from '@/utils/libs.js'
import i18n from '@/i18n/'
export default {
  name: 'ListItem',
  props: {
    groupData: {
      type: Object,
    },
    index: Number,
    isHeadImg: {
      type: Boolean,
    },
  },
  components: {},
  data() {
    return {
      top: 0,
      left: 0,
    }
  },
  filters: {
    hours(val) {
      if (val) {
        let time = new Date(val)
        var hour = time.getHours() // 获取时
        var minutes = time.getMinutes() // 获取分
        return `${hour}:${minutes >= 10 ? minutes : '0' + minutes}`
      } else {
        return ''
      }
    },
    viewContent(val) {
      if (val) {
        if (val.type == 0) return val.content //conversionFace(val.content)
        if (val.type == 1) return i18n.t('listViewImg')
        if (val.type == 2) return i18n.t('listViewFile')
        if (val.type == 3) return i18n.t('listViewVoice')
      } else {
        return ` `
      }
    },
  },
  methods: {
    selectGroup(data) {
      this.$emit('selectGroup', data)
    },
    handleRight(e) {
      this.$emit('handleRight', e)
    },
  },
}
</script>

<style lang="less" scoped>
.list_item {
  height: 47px;
  min-width: 20px;
  padding: 25px 10px;
  position: relative;
  cursor: pointer;
  .head_portrait {
    width: 30px;
    height: 30px;
    border-radius: 2px;
  }

  .group_name {
    margin-left: 10px;
    font-size: 13px;
    width: 80%;
    .title-new-time {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .current-name {
      // width: 75%;
      font-size: 16px;
      font-weight: 500;
    }
  }
  .multitap {
    position: absolute;
    bottom: 2px;
    right: 10px;
  }
  .view-content {
    height: 18px;
    line-height: 18px;
    padding: 0 5px;
    color: #adb8c4;
    max-width: 85%;
  }
}
</style>
