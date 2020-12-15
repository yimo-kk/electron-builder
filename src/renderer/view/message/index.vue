<template>
  <div class="message">
    <a-table
      :columns="columns"
      :data-source="$store.state.message.messageList"
      :rowKey="
        (row) => {
          return row.id
        }
      "
      size="small"
    >
      <template v-for="(item, index) in columns" :slot="item.slotName">
        <span :key="index">{{ $t(item.slotName) }}</span>
      </template>
      <a href="javaScript:void(0)" slot="status" slot-scope="status">{{
        status == 0
          ? $t('message.untreated')
          : status == 1
          ? $t('message.processed')
          : $t('message.notReached')
      }}</a>
      <span
        slot="add_time"
        slot-scope="add_time"
        :title="add_time | filterTime"
      >
        {{ add_time | filterTime }}</span
      >
      <span slot="action" slot-scope="status">
        <a-button
          @click="edit(status)"
          type="primary"
          size="small"
          style="font-size: 13px"
        >
          {{ $t('message.edit') }}
        </a-button>
      </span>
    </a-table>
    <a-modal
      title="修改状态"
      :visible="visible"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <div>
        <div class="flex status">
          <p class="title">留言类容:</p>
          <p>{{ messageContent }}</p>
        </div>
        <div class="flex status">
          <p class="title">{{ $t('message.status') }}</p>
          <a-radio-group
            name="radioGroup"
            v-model="selectStatus"
            :disabled="oldSelectStatus !== 0"
          >
            <a-radio :value="0">{{ $t('message.untreated') }}</a-radio>
            <a-radio :value="1">{{ $t('message.processed') }}</a-radio>
            <a-radio :value="2">{{ $t('message.notReached') }}</a-radio>
          </a-radio-group>
        </div>
        <div v-if="updateTime" class="flex status">
          <p class="title">{{ $t('message.processingTime') }}</p>
          <p>{{ updateTime | filterTime }}</p>
        </div>
        <div class="flex">
          <p class="title">{{ $t('message.remark') }}</p>
          <a-textarea
            v-model="remark"
            :placeholder="$t('message.editRemark')"
            :auto-size="{ minRows: 3, maxRows: 5 }"
          />
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { mapActions, mapMutations } from 'vuex'
const columns = [
  {
    slotName: 'message.name',
    dataIndex: 'username',
    ellipsis: true,
    align: 'center',
    scopedSlots: {
      title: 'message.name',
    },
  },
  {
    slotName: 'message.number',
    dataIndex: 'phone',
    ellipsis: true,
    align: 'center',
    scopedSlots: {
      title: 'message.number',
    },
  },
  {
    slotName: 'message.messageContent',
    dataIndex: 'content',
    align: 'center',
    ellipsis: true,
    scopedSlots: {
      title: 'message.messageContent',
    },
  },
  {
    slotName: 'message.email',
    ellipsis: true,
    dataIndex: 'email',
    align: 'center',
    scopedSlots: {
      title: 'message.email',
    },
  },
  {
    slotName: 'message.messageTime',
    dataIndex: 'add_time',
    ellipsis: true,
    align: 'center',
    scopedSlots: {
      customRender: 'add_time',
      title: 'message.messageTime',
    },
  },
  {
    slotName: 'message.status',
    dataIndex: 'status',
    ellipsis: true,
    align: 'center',
    scopedSlots: {
      customRender: 'status',
      title: 'message.status',
    },
  },
  {
    slotName: 'message.operating',
    key: 'id',
    align: 'center',
    scopedSlots: {
      title: 'message.operating',
      customRender: 'action',
    },
  },
]
export default {
  name: 'Message',
  components: {},
  data() {
    return {
      columns,
      visible: false,
      selectStatus: 0,
      oldSelectStatus: null,
      remark: '',
      id: null,
      updateTime: null,
      messageContent: '',
    }
  },
  filters: {
    filterTime(time) {
      return dayjs.unix(time).format('YYYY-MM-DD  HH:mm:ss')
    },
  },
  computed: {
    userInfo() {
      return JSON.parse(localStorage.getItem(this.$route.query.seller_code))[
        this.$route.query.kefu_code
      ]
    },
    saveLeaveMsg() {
      return this.$store.state.message.saveLeaveMsg
    },
  },
  watch: {
    saveLeaveMsg: {
      handler() {
        this.getMessageList({
          seller_code: this.userInfo.seller_code,
        })
      },
      deep: true,
    },
  },
  methods: {
    ...mapActions(['getMessageList']),
    ...mapMutations(['SET_UNTREATED_NUM']),
    handleOk() {
      if (!this.selectStatus) {
        this.$message.error(this.$t('message.selectStatus'))
        return
      }
      this.$socket.emit('message', {
        cmd: 'saveLeaveMsg',
        id: this.id,
        status: this.selectStatus,
        remarks: this.remark,
        seller_code: this.userInfo.seller_code,
        kefu_id: this.userInfo.kefu_id,
      })
      this.visible = false
      this.selectStatus = 0
      this.remark = ''
      this.id = null
      this.oldSelectStatus = null
      this.$message.success(this.$t('message.editSuccess'))
    },
    handleCancel() {
      this.visible = false
    },
    edit(val) {
      this.messageContent = val.content
      this.updateTime = val.update_time
      this.remark = val.remarks
      this.selectStatus = val.status
      this.oldSelectStatus = val.status
      this.id = val.id
      this.visible = true
    },
  },
}
</script>
<style lang="less" scoped>
.message {
  padding: 10px;
}
.flex {
  display: flex;
  .title {
    min-width: 80px;
    padding-right: 10px;
  }
}
.status {
  margin-bottom: 10px;
}
/deep/ .ant-table-tbody {
  background-color: #fff;
}
</style>
