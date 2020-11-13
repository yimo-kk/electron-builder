<template>
  <div class="multitap">
    <div>
      <a-spin v-if="multitapLoading" />
     <div v-else>
          <a-tabs
        v-if="technologyList.length "
        :default-active-key="technologyList[0].group_id.toString()"
        @change="callback"
      >
        <a-tab-pane
          :tab="item.group_name"
          v-for="(item) in technologyList"
          :key="item.group_id.toString()"
        >
          <div v-if="item.kefu.length">
            <a-table
              size="small"
              :columns="columns"
              :rowKey="(row,index)=>{return index}"
              :data-source="item.kefu"
            >
              <template v-for="(item, index) in columns" :slot="item.slotName">
                <span :key="index">{{ $t(item.slotName) }}</span>
              </template>
              <div slot="kefu_avatar" slot-scope="kefu_avatar,data">
                 <a-badge
                  :status=" data.online_status == 1 ? 'success':data.online_status == 2 ? 'warning':'default'"
                  :offset="[0,25]"
                  :title="data.online_status == 1 ?$t('online'):data.online_status == 2 ? $t('goAway'):$t('offline')"
                >
                  <img v-lazy="kefu_avatar" alt style="width:30px;height:30px" />
                </a-badge>
                
              </div> 
              <div
                slot="max_service_num"
                slot-scope="max_service_num,data"
                class="flex_up_down_center"
              >
                <a-icon type="user" />
                <p>{{`${data. now_service_num}/${data.max_service_num}`}}</p>
              </div>
              <div slot="operation" slot-scope="operation,data">
                 <a-button type="link" @click="relink(data)">{{$t('transfer.transfer')}}</a-button>
              </div>
            </a-table>
          </div>
          <div v-else>
            <a-empty />
          </div>
        </a-tab-pane>
      </a-tabs>
      <div v-else>
        <a-empty />
      </div>
     </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Multitap",
  props: {
    technologyList: {
      type: Array,
      default() {
        return [];
      },
    },
    multitapLoading: {
      type: Boolean,
      default: false,
    },
    groupTitle: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      columns:[
        {
          slotName: 'transfer.avatar',
          dataIndex: "kefu_avatar",
          scopedSlots: {
            customRender: "kefu_avatar",
            title:'transfer.avatar'
          },
        },
        {
          slotName: 'transfer.nickname',
          dataIndex: "kefu_name",
          scopedSlots: {
            title:'transfer.nickname'
          },
        },
        {
          slotName: 'transfer.transferNumber',
          dataIndex: "max_service_num",
          scopedSlots: {
            customRender: "max_service_num",
            title:'transfer.transferNumber'
          },
        },
        {
          slotName: 'awaitInfo.tableTitle.operating',
          dataIndex: "operation",
          scopedSlots: {
            customRender: "operation",
             title:'awaitInfo.tableTitle.operating'
          },
        },
      ],
    };
  },
  methods: {
    callback(){},
    relink(data){
      let that = this
        this.$confirm({
        title: this.$t('transfer.transfer'),
        content:`${data.online_status == 2 ? this.$t('transferState.noSservice'):'' }`+
       this.$t('transferState.confirm') + `  ${this.groupTitle}  `+ this.$t('transferState.to')+`   ${ data.kefu_name }` +  this.$t('transferState.question'),
        okText:  this.$t('determine'),
        cancelText:this.$t('cancel'),
        onOk() {
          that.$emit("confirm", data);
          }
        })
    }
  },
};
</script>
<style lang='less' scoped>
.multitap {
    text-align: center;
}
/deep/ .ant-badge-dot{
  width: 10px;
  height: 10px;
}
</style>