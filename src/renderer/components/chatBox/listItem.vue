<template>
  <div
    class="list_item flex_up_down_center"
    @click="selectGroup(groupData)"
    @contextmenu.prevent="handleRight"
    :[dataIndex]="index"
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
      <div :[dataIndex]="index" class="title-new-time">
        <div class="flex" style="overflow: hidden;" :[dataIndex]="index">
          <p
            :[dataIndex]="index"
            style="marginRight:5px"
            class="current-name dwote"
          >
            {{ groupData.group_name || groupData.username }}
          </p>
          <level
            v-show="!isHeadImg"
            :num="parseInt(groupData.level)"
            :[dataIndex]="index"
          ></level>
        </div>
        <span
          style="color: #adb8c4;font-size: 11px;min-width: 35px;"
          :data-index="index"
        >
          {{ groupData.lastMsg ? groupData.lastMsg.create_time : '' | hours }}
        </span>
      </div>

      <div class="view-content " :data-index="index">
        <p
          v-if="groupData.lastMsg && groupData.lastMsg.type === 0"
          :data-index="index"
          class="view-content dwote"
          v-html="conversionFace(groupData.lastMsg.content)"
        ></p>
        <p
          v-else-if="groupData.lastMsg"
          :data-index="index"
          class="view-content dwote"
        >
          {{ groupData.lastMsg | viewContent }}
        </p>
      </div>
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
      dataIndex: 'data-index',
    }
  },
  filters: {
    hours(val) {
      if (val) {
        let oleTime = new Date(val) // 把传入的参数转为时间戳
        let timestamp = new Date().getTime() // 当前时间戳
        let todayTime = 1000 * 60 * 60 * 24 * 1 //1天
        let weekTime = 1000 * 60 * 60 * 24 * 7 // 7天
        // 判断 传入时间的差值
        if (timestamp - oleTime.getTime() < todayTime) {
          // 1天内 返回时分
          let hour = oleTime.getHours() //得到小时
          let minu = oleTime.getMinutes() //得到分钟
          return `${hour}:${minu < 10 ? '0' + minu : minu}`
        } else if (timestamp - oleTime.getTime() < weekTime) {
          //一周内 返回星期几
          let day = oleTime.getDay() //得到周几
          let week
          switch (day) {
            case 1:
              week = '星期一'
              break
            case 2:
              week = '星期二'
              break
            case 3:
              week = '星期三'
              break
            case 4:
              week = '星期四'
              break
            case 5:
              week = '星期五'
              break
            case 6:
              week = '星期六'
              break
            case 7:
              week = '星期天'
              break
            default:
              week = ''
              break
          }
          return week
        } else {
          //大于一周 返回月日
          let month = oleTime.getMonth() //得到月份
          let date = oleTime.getDate() //得到日期
          return `${month + 1}-${date}`
        }
      } else {
        return ''
      }
    },
    viewContent(val) {
      if (val) {
        if (val.type == 0) return val.content
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
