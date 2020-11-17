<template>
<div class="list_item flex_up_down_center" @click="selectGroup(groupData)"  @contextmenu.prevent="handleRight" :data-index='index'>
     <a-badge  :data-index='index' :count="groupData.badgeShow ||groupData.noReadNum" :overflow-count="99" >
        <img class="head_portrait" v-lazy="groupData.group_avatar || groupData. headimg" alt  :data-index='index'/>
    </a-badge>
    
    <div class="group_name" :data-index='index'>
        <p :data-index='index'>{{groupData.group_name ||groupData.username }}</p> 
        <p :data-index='index'>{{groupData.create_time ||groupData.access_time }}</p>
    </div>
    <div v-show="groupData.isMultitap" class="multitap" >
         <customIcon type="icon-zhuanjie" style="fontSize:12px;color:#1890ff" :title="$t('currentInfo.transfer')"></customIcon> 
    </div>
</div>
</template>

<script>

export default {
    name: "ListItem",
    props: {
        groupData: {
            type: Object,
        },
        index:Number
    },
    data() {
        return {
            top: 0,
            left: 0,
        };
    },
    methods: {
        selectGroup(data) {
                this.$emit("selectGroup", data);
        },
        handleRight(e) {
             this.$emit("handleRight", e);
        },
    },
};
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
    }
.multitap{
    position: absolute;
    top: 5px;
    right: 5px;
}
}
</style>
