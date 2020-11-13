<template>
<div class="member" @contextmenu.prevent="handleRight" @click="selectGroupUser(groupList)">
    <div class="member_headimg">
        <img v-lazy="groupList.headimg" alt />
        <a-badge :status="groupList.online_status?'success':'default'" :offset="[2,12]" :title="groupList.online_status? $t('online'):$t('offline')" />
    </div>
    <P class="member_name">{{groupList.username}}
        <span v-if="groupList.status" style="fontSize:10px;color:#eee;marginLeft:10px">{{$t('groupInfo.banned')}}</span>
    </P>

    <div v-show="operate && isOperate " class="operate" :style="{left:left+'px',top:top+'px'}">
        <p @click.stop="stopSpeak" class="operate_name" v-if="groupList.status==0 &!pull">
            <customIcon type="icon-icon-test" style="fontSize:12px"></customIcon><span>{{$t('groupInfo.isMute')}}</span>
        </p>
        <p @click.stop="stopSpeak" v-if="groupList.status==1 &&!pull" class="operate_name">
            <customIcon type="icon-yichu" style="fontSize:12px"></customIcon>
            <span>{{$t('groupInfo.unmute')}}</span>
        </p>
        <p @click.stop="kickOut" v-if="!pull" class="operate_name">
            <customIcon type="icon-yichu" style="fontSize:12px"></customIcon>
            <span>{{$t('groupInfo.kickOut')}}</span>
        </p>
        <p @click.stop="addGroup" v-if="pull" class="operate_name">
            <customIcon type="icon-yichu" style="fontSize:12px"></customIcon>
            <span>{{$t('groupInfo.pull')}}</span>
        </p>

    </div>

</div>
</template>

<script>
export default {
    name: "MemberList",
    props: {
        groupList: {
            type: Object,
            default () {
                return {};
            },
        },
        isOperate: Boolean,
        pull: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            left: 0,
            top: 0,
            operate: false,
        };
    },
    methods: {
        selectGroupUser(data) {
            if (this.operate) {
                this.operate = false;
                return;
            } else {
                this.$emit("selectGroupUser", data);
            }
        },
        handleRight(e) {
            this.operate = true;
            this.left = e.pageX > document.body.offsetWidth - 90 ? document.body.offsetWidth - 90 : e.pageX;
            this.top = e.pageY > document.body.offsetHeight - 70 ? document.body.offsetHeight - 70 : e.pageY;
        },
        kickOut() {
            this.$emit('kickOut', this.groupList)
            this.operate = false;
        },
        stopSpeak() {
            this.$emit('stopSpeak', this.groupList)
            this.operate = false;
        },
        addGroup() {
            this.$emit('addGroup', this.groupList)
            this.operate = false;
        }

    },
};
</script>

<style lang="less" scoped>
.member {
    display: flex;
    align-items: center;
    padding-left: 20px;
    position: relative;
    height: 50px;
    cursor: pointer;

    .member_headimg {
        display: flex;

        img {
            height: 30px;
            width: 30px;
            border-radius: 5px;
        }
    }

    .member_name {
        padding-left: 20px;
    }

    &:hover {
        background-color: #ccc;
    }
}

.operate {
    position: fixed;
    padding: 10px;
    font-size: 12px;
    background-color: #eee;
    z-index: 4444;
    cursor: pointer;
    border-radius: 2px;
    box-shadow: 0px 0px 1px #ccc;

    .operate_name {
        line-height: 22px;

        &:hover {
            background-color: #ccc;
        }

        span {
            padding-left: 5px;
        }
    }
}
</style>
