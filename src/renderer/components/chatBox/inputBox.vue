<template>
  <div>
    <div class="other flex_up_down_center">
      <customIcon
        :title="$t('currentInfo.expression')"
        type="icon-biaoqing1"
        style="fontSize: 20px; padding: 8px 0 0 8px"
        @click="faceContent"
      ></customIcon>
    </div>
    <div
      ref="inputBox"
      class="input-box"
      contenteditable="true"
      v-html="parsingEmoji(innerText)"
      @input="changeTxt"
      @focus="lock = true"
      @blur="lock = false"
    ></div>
    <div class="send">
      <a-checkbox @change="textToSpeech" v-show="false">
        {{ $t('textToSpeech') }}
      </a-checkbox>
      <p
        :class="['send_btn', innerText.length ? 'activt_btn' : '']"
        @click="sendMessage(innerText, 0)"
        :title="
          `Enter  ${$t('currentInfo.send')}
Enter+Ctrl/Shift  ${$t('currentInfo.wrap')}`
        "
      >
        {{ $t('currentInfo.send') }}
      </p>
    </div>
    <!-- 表情区域 -->
    <div v-show="faceShow">
      <div
        class="mask"
        @click="
          () => {
            faceShow = false
            faceList = []
          }
        "
      ></div>
      <div class="browBox">
        <ul>
          <li
            v-html="parsingEmoji(item)"
            v-for="(item, index) in faceList"
            :key="index"
            @click.stop="getBrow(index)"
          ></li>
          <!-- <li v-html=""></li> wChatToUi -->
          <!-- <li
                v-for="(item, index) in faceList"
                :key="index"
                @click.stop="getBrow(index)"
              >
                {{ item.char }}
              </li> -->
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { emojisAmap, wChatToUi } from '@/assets/emjoy/emjoydata'
export default {
  name: 'InputBox',
  props: {
    inputValue: {
      type: Object,
      default() {
        return {
          txt: '',
        }
      },
    },
    insertion: {
      type: String,
    },
  },
  data: function() {
    return {
      innerText: this.inputValue.txt,
      lock: false,
      faceShow: false,
      faceList: [],
      lastEditRange: null,
    }
  },
  watch: {
    inputValue: {
      handler(newValue, oldValue) {
        if (!this.lock) {
          this.innerText = this.inputValue.txt
        }
      },
      deep: true,
    },
    // insertion(val) {
    //   this.insertHtmlAtCaret(val)
    // },
  },
  methods: {
    changeTxt: function(e) {
      this.inputValue.txt = this.$el.innerHTML
    },
    _insertimg(str) {
      var selection = window.getSelection
        ? window.getSelection()
        : document.selection
      this.$refs.inputBox.focus()
      if (this.lastEditRange) {
        // 存在最后光标对象，选定对象清除所有光标并添加最后光标还原之前的状态
        selection.removeAllRanges()
        selection.addRange(this.lastEditRange)
      }
      var range = selection.createRange
        ? selection.createRange()
        : selection.getRangeAt(0)
      if (!window.getSelection) {
        var selection = window.getSelection
          ? window.getSelection()
          : document.selection
        var range = selection.createRange
          ? selection.createRange()
          : selection.getRangeAt(0)
        range.pasteHTML(str)
        range.collapse(false)
        range.select()
      } else {
        var hasR = range.createContextualFragment(str)
        var hasR_lastChild = hasR.lastChild
        while (
          hasR_lastChild &&
          hasR_lastChild.nodeName.toLowerCase() == 'br' &&
          hasR_lastChild.previousSibling &&
          hasR_lastChild.previousSibling.nodeName.toLowerCase() == 'br'
        ) {
          var e = hasR_lastChild
          hasR_lastChild = hasR_lastChild.previousSibling
          hasR.removeChild(e)
        }
        range.insertNode(hasR)
        if (hasR_lastChild) {
          range.setEndAfter(hasR_lastChild)
          range.setStartAfter(hasR_lastChild)
        }
        range.collapse(false)
        selection.removeAllRanges()
        selection.addRange(range)
      }
      // 无论如何都要记录最后光标对象
      this.lastEditRange = selection.getRangeAt(0)
    },
    faceContent() {
      this.faceShow = !this.faceShow
      if (this.faceShow == true) {
        this.faceList = Object.keys(emojisAmap).map((item) => {
          return `[${item}]`
        })
        this.faceList.push(...Object.values(wChatToUi))
      } else {
        this.faceList = []
      }
    },
    // 获取用户点击表情之后的标签 ，存放到输入框内
    getBrow(index) {
      for (let i in this.faceList) {
        if (index == i) {
          // this.inputValue.txt += this.faceList[index]
          this._insertimg2(this.parsingEmoji(this.faceList[index]))
        }
      }
    },
    textToSpeech() {},
  },
  mounted() {},
}
</script>
<style lang="less" scoped>
.input-box {
  height: 80px;
  width: 100%;
  background: #fff;
  padding-left: 8px;
}
[contenteditable]:focus {
  outline: none;
}

.browBox {
  width: 400px;
  height: 200px;
  background: #fff;
  position: absolute;
  top: -220px;
  left: -90px;
  overflow: auto;
  box-shadow: 0px 0px 10px #ccc;
  z-index: 2222;
  // .scrollbar();

  ul {
    display: flex;
    flex-wrap: wrap;
    padding: 10px;

    li {
      width: 10%;
      font-size: 15px;
      list-style: none;
      text-align: center;
      // .pointer();
    }
  }
}

.mask {
  width: 100vw;
  height: 100vh;
  background-color: rgba(156, 153, 153, 0.2);
  z-index: 11;
  position: fixed;
  top: 0;
  left: 0;
}
</style>
