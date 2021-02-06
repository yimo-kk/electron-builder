<template>
  <div class="sessionRecord">
    <div class="search">
      <a-form layout="inline" @submit="handleSubmit">
        <a-form-item :label="$t('awaitInfo.userName')">
          <a-input
            v-model="searchData.userName"
            :placeholder="$t('awaitInfo.search')"
          >
          </a-input>
        </a-form-item>
        <a-form-item :label="$t('awaitInfo.searchTime')">
          <a-range-picker
            v-model="searchData.time"
            :show-time="{ format: 'HH:mm' }"
            format="YYYY-MM-DD HH:mm:ss"
            valueFormat="YYYY-MM-DD HH:mm:ss"
            :placeholder="[$t('awaitInfo.startTime'), $t('awaitInfo.endTime')]"
          />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit" icon="search"> </a-button>
        </a-form-item>
      </a-form>
    </div>
    <div class="list">
      <a-table
        :columns="columns"
        :data-source="sessionRecordData"
        :rowKey="
          (row) => {
            return row.service_log_id
          }
        "
        size="small"
        :loading="loading"
        :scroll="{ y: '60vh' }"
      >
        <template v-for="(item, index) in columns" :slot="item.slotName">
          <span :key="index">{{ $t(item.slotName) }}</span>
        </template>
        <p slot="customer_avatar" slot-scope="scope">
          <a-avatar :src="scope" />
        </p>
        <div slot="operating" slot-scope="customer_id, data">
          <a-button
            type="primary"
            size="small"
            @click="viewLog(data)"
            style="font-size: 13px;"
            >{{ $t('awaitInfo.sessionRecord.viewLog') }}</a-button
          >
        </div>
      </a-table>
    </div>
    <!-- 聊天记录 -->
    <a-modal
      :title="'与' + title + '的聊天记录'"
      width="60%"
      :visible="isVisible"
      @ok="isVisible = false"
      @cancel="isVisible = false"
    >
      <div class="vieW-log">
        <ViewLog
          ref="chatBox"
          :isName="false"
          :chatLogList="chatLogList"
          :isMore="isMore"
          @getLog="getLog"
          :count="count"
          :isInput="false"
        ></ViewLog>
      </div>
    </a-modal>
  </div>
</template>

<script>
import { getSessionRecordLog } from '@/api/sessionRecord.js'

import ViewLog from '@/components/chatBox/chatBox'
import { getUserChatLog } from '@/api/current.js'
export default {
  // 会话记录
  name: 'SessionRecord',
  components: {
    ViewLog,
  },
  data() {
    return {
      loading: false,
      searchData: {
        userName: '',
        time: [],
      },
      columns: [
        {
          slotName: 'awaitInfo.sessionRecord.visitorAvatar',
          dataIndex: 'customer_avatar',
          scopedSlots: {
            customRender: 'customer_avatar',
            title: 'awaitInfo.sessionRecord.visitorAvatar',
          },
          align: 'center',
        },
        {
          slotName: 'awaitInfo.sessionRecord.visitorName',
          dataIndex: 'customer_name',
          ellipsis: true,
          align: 'center',
          scopedSlots: {
            title: 'awaitInfo.sessionRecord.visitorName',
          },
        },
        {
          slotName: 'awaitInfo.sessionRecord.visitorIp',
          dataIndex: 'customer_ip',
          ellipsis: true,
          align: 'center',
          scopedSlots: {
            title: 'awaitInfo.sessionRecord.visitorIp',
          },
        },
        {
          slotName: 'awaitInfo.sessionRecord.visitorArea',
          dataIndex: 'area',
          ellipsis: true,
          align: 'center',
          scopedSlots: {
            title: 'awaitInfo.sessionRecord.visitorArea',
          },
        },
        {
          slotName: 'awaitInfo.sessionRecord.startReceptionTime',
          dataIndex: 'start_time',
          ellipsis: true,
          scopedSlots: {
            customRender: 'start_time',
            title: 'awaitInfo.sessionRecord.startReceptionTime',
          },
          align: 'center',
        },
        {
          slotName: 'awaitInfo.sessionRecord.endReceptionTime',
          dataIndex: 'end_time',
          scopedSlots: {
            customRender: 'end_time',
            title: 'awaitInfo.sessionRecord.endReceptionTime',
          },
          align: 'center',
        },
        {
          slotName: 'awaitInfo.sessionRecord.receptionTime',
          dataIndex: 'service_time',
          scopedSlots: {
            customRender: 'service_time',
            title: 'awaitInfo.sessionRecord.receptionTime',
          },
          align: 'center',
        },
        {
          slotName: 'awaitInfo.tableTitle.operating',
          dataIndex: 'customer',
          scopedSlots: {
            customRender: 'operating',
            title: 'awaitInfo.tableTitle.operating',
          },
          align: 'center',
        },
      ],
      sessionRecordData: [],
      title: '',
      isVisible: false,
      chatLogList: [],
      count: 0,
      page: 1,
      isMore: false,
    }
  },
  computed: {
    userInfo() {
      return JSON.parse(localStorage.getItem(this.$route.query.seller_code))[
        this.$route.query.kefu_code
      ]
    },
  },
  watch: {},
  methods: {
    async getSessionRecordLogData() {
      this.loading = true

      let data = await getSessionRecordLog({
        kefu_code: this.userInfo.kefu_code,
        username: this.searchData.userName,
        start_time: this.searchData.time.length ? this.searchData.time[0] : '',
        end_time: this.searchData.time.length ? this.searchData.time[1] : '',
      })
      this.sessionRecordData = data.data
      this.loading = false
    },
    //搜索
    handleSubmit() {
      this.getSessionRecordLogData()
    },
    // 点击查看聊天记录
    viewLog(data) {
      this.chatLogList = []
      this.is_relink = data.is_relink
      this.title = data.customer_name
      this.isVisible = true
      this.getUserChatLog({
        page: 1,
        username: data.customer_name,
        kefu_code: this.userInfo.kefu_code,
        kefu_id: this.userInfo.kefu_id,
        is_relink: data.is_relink,
        seller_code: this.userInfo.seller_code,
      })
    },
    getUserChatLog(params, callback) {
      this.isMore = true
      getUserChatLog(params)
        .then((result) => {
          this.count = result.count
          let array = result.data.map((item) => {
            if (item.type == 0) {
              item.content
                ? (item.content = this.conversionFace(item.content))
                : (item.message = this.conversionFace(item.message))
              item.play = false
            } else if (item.type === 2) {
              item.progress = false
              item.progress_num = 0
            } else if (item.type == 3) {
              item.play = false
            }
            return item
          })
          if (this.page > 1) {
            this.chatLogList.unshift(...array)
            callback && callback()
            setTimeout(() => {
              this.isMore = false
            }, 200)
          } else {
            this.chatLogList = array
            this.isMore = false
          }
        })
        .catch((err) => {
          setTimeout(() => {
            this.isMore = false
          }, 200)
        })
    },
    getLog(e, fn) {
      this.isMore = true
      this.page++
      let scrollH = this.$refs.chatBox.$refs.chatMain.scrollHeight
      this.getUserChatLog(
        {
          is_relink: this.is_relink,
          seller_code: this.userInfo.seller_code,
          page: this.page,
          username: this.title,
          kefu_code: this.userInfo.kefu_code,
          kefu_id: this.userInfo.kefu_id,
        },
        () => {
          setTimeout(() => {
            e.target.scrollTo(0, e.target.scrollHeight - (scrollH + 30))
          })
        }
      )
    },
  },
  created() {},
  mounted() {
    this.getSessionRecordLogData()
  },
}
</script>
<style lang="less" scoped>
.list {
  padding: 0 50px;
}
.vieW-log {
  height: 54vh;
  overflow: auto;
}
.search {
  padding: 20px 0 20px 20px;
}
</style>
