<template>
  <div class="flex_up_down_center">
    <div>
      <a-input-number
        :disabled="stop"
        :min="0"
        :max="30"
        :stop="1"
        v-model.number="AddBalckDay"
        @change="onChangeDay"
        :precision="0"
        :formatter="limitNumber"
        :parser="limitNumber"
      />
      <span class="cheap">{{ $t('day') }}</span>
    </div>
    <div>
      <a-input-number
        :disabled="stop"
        :min="0"
        :max="23"
        :stop="1"
        v-model.number="AddBalckHour"
        @change="onChangeHour"
        :precision="0"
        :formatter="limitNumber"
        :parser="limitNumber"
      />
      <span class="cheap">{{ $t('hour') }}</span>
    </div>
    <div>
      <a-input-number
        :disabled="stop"
        :min="0"
        :max="59"
        :stop="1"
        v-model.number="AddBalckMinute"
        @change="onChangeMinute"
        :precision="0"
        :formatter="limitNumber"
        :parser="limitNumber"
      />
      <span class="cheap">
        {{ $t('minute') }}
      </span>
    </div>
    <div v-if="ispermanent">
      <a-checkbox v-model="stop" @change="permanent">
        {{ $t('permanent') }}
      </a-checkbox>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AddBalckTime',
  props: {
    day: {
      type: Number,
      default: 0,
    },
    hour: {
      type: Number,
      default: 0,
    },
    minute: {
      type: Number,
      default: 0,
    },
    permanentTime: {
      type: Boolean,
      default: false,
    },
    ispermanent: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      stop: JSON.parse(JSON.stringify(this.permanentTime)),
      AddBalckDay: JSON.parse(JSON.stringify(this.day)),
      AddBalckHour: JSON.parse(JSON.stringify(this.hour)),
      AddBalckMinute: JSON.parse(JSON.stringify(this.minute)),
    }
  },
  watch: {
    day(newVal) {
      this.AddBalckDay = newVal
    },
    hour(newVal) {
      this.AddBalckHour = newVal
    },
    minute(newVal) {
      this.AddBalckMinute = newVal
    },
    permanentTime(newVal) {
      this.stop = newVal
    },
  },
  methods: {
    //不让输入小数
    limitNumber(value) {
      if (typeof value === 'string') {
        return !isNaN(Number(value)) ? value.replace(/\./g, '') : 0
      } else if (typeof value === 'number') {
        return !isNaN(value) ? String(value).replace(/\./g, '') : 0
      } else {
        return 0
      }
    },
    // 勾选永久时
    permanent(e) {
      this.stop = e.target.checked
      this.AddBalckDay = null
      this.AddBalckHour = null
      this.AddBalckMinute = null
      this.$emit('permanent', this.stop)
    },
    onChangeDay(e) {
      if (e > 30) {
        this.AddBalckDay = 30
        return
      }
      this.$emit('onChangeDay', this.AddBalckDay ? this.AddBalckDay : 0)
    },
    onChangeHour(e) {
      if (e > 24) {
        this.AddBalckHour = 24
        return
      }
      this.$emit('onChangeHour', this.AddBalckHour ? this.AddBalckHour : 0)
    },
    onChangeMinute(e) {
      if (e > 60) {
        this.AddBalckMinute = 60
        return
      }
      this.$emit(
        'onChangeMinute',
        this.AddBalckMinute ? this.AddBalckMinute : 0
      )
    },
  },
}
</script>
<style lang="less" scoped>
.cheap {
  margin-right: 10px;
}
/deep/.ant-input-number {
  width: 60px;
}
</style>
