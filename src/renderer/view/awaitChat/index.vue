<template>
  <div class="await_list">
    <a-divider orientation="left">{{ $t('awaitInfo.title') }}</a-divider>
    <div class="handle">
      <div class="search">
        <a-input-search
          :placeholder="$t('awaitInfo.search')"
          allowClear
          enter-button
          @search="onSearch"
        />
      </div>
    </div>
    <div class="tabl_list">
      <a-table
        :rowKey="
          (row) => {
            return row.customer_id
          }
        "
        :columns="columns"
        :data-source="awaitList"
        :pagination="pagination"
        size="small"
        :loading="loading"
        @change="handleTableChange"
        :scroll="{ y: 320 }"
      >
        <template v-for="(item, index) in columns" :slot="item.slotName">
          <span :key="index">{{ $t(item.slotName) }}</span>
        </template>
        <p slot="customer_avatar" slot-scope="scope">
          <a-avatar :src="scope" />
        </p>
        <p slot="is_tourist" slot-scope="num">
          {{
            num == 0
              ? $t('awaitInfo.tableTitle.Tourist')
              : $t('awaitInfo.tableTitle.user')
          }}
        </p>
        <div slot="uid" slot-scope="customer_id, data">
          <a-button
            type="primary"
            size="small"
            @click="reception(data)"
            style="font-size: 13px;"
            >{{ $t('awaitInfo.tableTitle.reception') }}</a-button
          >
        </div>
      </a-table>
    </div>
  </div>
</template>

<script>
import { getCustomerQueue, reception } from '@/api/await.js'
import { mapMutations, mapActions } from 'vuex'
export default {
  name: 'AwaitChat',
  components: {},
  data() {
    return {
      pagination: {},
      loading: false,
      columns: [
        {
          slotName: 'awaitInfo.tableTitle.visitorAvatar',
          dataIndex: 'customer_avatar',
          scopedSlots: {
            customRender: 'customer_avatar',
            title: 'awaitInfo.tableTitle.visitorAvatar',
          },
          align: 'center',
        },
        {
          slotName: 'awaitInfo.tableTitle.visitorName',
          dataIndex: 'customer_name',
          ellipsis: true,
          align: 'center',
          scopedSlots: {
            title: 'awaitInfo.tableTitle.visitorName',
          },
        },
        {
          slotName: 'awaitInfo.tableTitle.visitorIp',
          dataIndex: 'customer_ip',
          ellipsis: true,
          align: 'center',
          scopedSlots: {
            title: 'awaitInfo.tableTitle.visitorIp',
          },
        },
        {
          slotName: 'awaitInfo.tableTitle.interviewTime',
          dataIndex: 'create_time',
          ellipsis: true,
          align: 'center',
          scopedSlots: {
            title: 'awaitInfo.tableTitle.interviewTime',
          },
        },
        {
          slotName: 'awaitInfo.tableTitle.visitorType',
          dataIndex: 'is_tourist',
          ellipsis: true,
          scopedSlots: {
            customRender: 'is_tourist',
            title: 'awaitInfo.tableTitle.visitorType',
          },
          align: 'center',
        },
        {
          slotName: 'awaitInfo.tableTitle.operating',
          dataIndex: 'customer',
          scopedSlots: {
            customRender: 'uid',
            title: 'awaitInfo.tableTitle.operating',
          },
          align: 'center',
        },
      ],
    }
  },
  computed: {
    awaitList() {
      return this.$store.state.Socket.awaitList
    },
    userInfo() {
      return JSON.parse(localStorage.getItem(this.$route.query.seller_code))[
        this.$route.query.kefu_code
      ]
    },
  },
  methods: {
    ...mapActions(['getAwaitList']), //'getCurrentListData'
    ...mapMutations(['SET_AWAIT_LIST']),
    deleteDataItem(customer_id) {
      let arr = []
      this.awaitList.forEach((item, index) => {
        if (item.customer_id != customer_id) {
          arr.push(item)
        }
      })
      this.SET_AWAIT_LIST(arr)
    },
    reception(data) {
      let that = this
      this.$confirm({
        content: `${this.$t('confirmReception')} ${
          data.customer_name
        } ${this.$t('transferState.question')}`,
        okText: this.$t('determine'),
        cancelText: this.$t('cancel'),
        onOk() {
          let params = {
            kefu_code: that.userInfo.kefu_code,
            kefu_name: that.userInfo.kefu_name,
            seller_code: that.userInfo.seller_code,
            uid: data.customer_id,
          }
          reception(params).then((result) => {
            if (result.code != -1) {
              let socketMessage = {
                username: data.customer_name,
                kefu_code: that.userInfo.kefu_code,
                uid: data.customer_id,
                seller_code: that.userInfo.seller_code,
                kefu_name: that.userInfo.kefu_name,
                cmd: 'service-prompt',
              }
              that.$socket.emit('message', socketMessage)
              that.$store.commit('SET_CURRENT_USER', {
                activtyUid: data.customer_id,
                activtyeUsername: data.customer_name,
                login_ip: data.customer_ip,
                area: data.customer_area,
              })
              //  that.getCurrentListData()
              that.$emit('selectMenu', { key: 'CurrentChat' })
            } else {
              that.$message.error(result.msg)
            }
          })
        },
      })
    },
    onSearch(val) {
      this.getAwaitList({
        seller_code: JSON.parse(
          localStorage.getItem(this.$route.query.seller_code)
        )[this.$route.query.kefu_code].seller_code,
        username: val,
      })
    },
    // 分页
    handleTableChange(pagination) {
      const pager = {
        ...this.pagination,
      }
      pager.current = pagination.current
      this.pagination = pager
    },
  },
}
</script>

<style lang="less" scoped>
.await_list {
  overflow: auto;
  // background-color: #fff;
  .handle {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 50px;
  }

  .search {
    width: 300px;
  }

  .tabl_list {
    padding: 0 50px;
  }

  &::-webkit-scrollbar {
    width: 4px;
    /*高宽分别对应横竖滚动条的尺寸*/
    // background-color: #fff;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 4px;
    background: #d8d8d8;
  }
}

.refresh_btn {
  text-align: right;
  margin-right: 20px;
  margin-bottom: 8px;
}
</style>
