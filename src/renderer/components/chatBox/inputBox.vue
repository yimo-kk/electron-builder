<template>
  <div class="inputBox2">
    <div
      :placeholder="$t('currentInfo.pleaseEnter')"
      id="input"
      ref="inputBox_edit"
      contenteditable="true"
      v-html="nodeValue"
      @paste="setPasteImg"
      @contextmenu="setMenuPasteImg"
      @keydown="enter"
      @blur="getblur"
    ></div>
    <div class="send">
      <a-checkbox @change="textToSpeech" v-show="!isName">
        {{ $t('textToSpeech') }}
      </a-checkbox>
      <p
        :class="['send_btn']"
        @click="sendMessage"
        :title="
          `
Ctrl/Shift+Enter ${$t('currentInfo.wrap')}`
        "
      >
        {{ $t('currentInfo.send') }}S
      </p>
    </div>
  </div>
</template>

<script>
const { remote } = require('electron')
const clipboard = require('electron').clipboard

export default {
  name: 'inputBox',
  components: {},
  props: {
    isName: {
      type: Boolean,
      default: false,
    },
    valueConten: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      nodeValue: this.valueConten,
      setMenuPasteImgData: '',
      sel: null,
      range: null,
    }
  },
  computed: {},
  watch: {
    valueConten(newVal) {
      this.nodeValue = JSON.parse(JSON.stringify(newVal))
    },
    nodeValue(newVal) {
      this.$nextTick(() => {
        this.nodeValue = newVal ? newVal : ''
      })
    },
    '$store.state.Socket.activityGroup': {
      handler(newVal) {
        if (Object.keys(newVal).length) {
          document.getElementById('input').innerHTML = ''
        }
      },
      deep: true,
    },
  },
  methods: {
    /**
     * 获取div内容并转为Node数组
     * @param elem
     * @returns {ChildNode[]}
     */
    getNodeList() {
      return Array.from(this.$refs.inputBox_edit.childNodes)
    },
    // 获取光标位置
    getCursorCoordinate() {
      const selection = window.getSelection().getRangeAt(0)
      return selection
    },
    setMenuPasteImg() {
      this.setMenuPasteImgData.popup(
        { window: remote.getCurrentWindow() },
        false
      )
    },
    //
    setPasteImg(event) {
      event.preventDefault()
      if (event.clipboardData || event.originalEvent) {
        var clipboardData =
          event.clipboardData || event.originalEvent.clipboardData
        if (Object.keys(clipboardData.files).length) {
          var blob
          for (var i = 0; i < clipboardData.items.length; i++) {
            if (clipboardData.items[i].type.indexOf('image') !== -1) {
              blob = clipboardData.items[i].getAsFile()
            }
          }
          var render = new FileReader()
          let _this = this
          render.onload = function(evt) {
            //输出base64编码
            var base64 = evt.target.result
            var img = document.createElement('img')
            img.setAttribute('src', base64)
            img.setAttribute('style', 'max-width:120px; max-height:90px')
            _this.$refs.inputBox_edit.focus()
            _this.insertHtmlAtCaret(img)
          }
          render.readAsDataURL(blob)
        } else {
          var text
          // 兼容针对于opera ie等浏览器
          if (clipboardData === undefined || clipboardData === null) {
            text = window.clipboardData.getData('text') || ''
            if (text !== '') {
              if (window.getSelection) {
                // 针对于ie11 10 9 safari
                var newNode = document.createElement('span')
                newNode.innerHTML = text
                window
                  .getSelection()
                  .getRangeAt(0)
                  .insertNode(newNode)
              } else {
                // 兼容ie10 9 8 7 6 5
                document.selection.createRange().pasteHTML(text)
              }
            }
          } else {
            // 兼容chorme或hotfire
            text = clipboardData.getData('text/plain') || ''
            if (text !== '') {
              document.execCommand('insertText', false, text)
            }
          }
        }
      }
    },
    // 插入文字和图片
    insertHtmlAtCaret(html) {
      document.getElementById('input').focus()
      let range, sel
      if (window.getSelection) {
        sel = window.getSelection()
        if (sel.getRangeAt && sel.rangeCount) {
          range = sel.getRangeAt(0)
          range.deleteContents()
          let el = document.createElement('div')
          el.appendChild(html)
          var frag = document.createDocumentFragment(),
            node,
            lastNode
          while ((node = el.firstChild)) {
            lastNode = frag.appendChild(node)
          }
          range.insertNode(frag)
          if (lastNode) {
            range = range.cloneRange()
            range.setStartAfter(lastNode)
            range.collapse(true)
            sel.removeAllRanges()
            sel.addRange(range)
          }
        }
      }
    },
    // 插入表情
    insertEmoji(val) {
      document.getElementById('input').focus()
      this.insertHtml(this.faceHtml(val))
    },
    // 选中文字转语音
    textToSpeech(e) {
      this.$emit('textToSpeech', e.target.checked)
    },
    // 发送
    sendMessage() {
      let sendMessage = ''
      let sendImg = ''
      this.getNodeList().forEach((item, index) => {
        if (
          item.nodeName == '#text' ||
          item.nodeName == 'BR' ||
          item.nodeName == 'SPAN'
        ) {
          sendMessage +=
            item.nodeName == 'BR'
              ? '\n'
              : item.nodeName == 'SPAN'
              ? `[${item.dataset.name}]`
              : item.data
          if (this.getNodeList()[index + 1]) {
            if (!this.getNodeList()[index + 1].nodeName == '#text') {
              this.$emit('sendMessage', this.sendText(sendMessage), 0)
              sendMessage = ''
            }
          } else {
            if (sendMessage.trim()) {
              this.$emit('sendMessage', this.sendText(sendMessage), 0)
              sendMessage = ''
            } else {
              this.$message.error('发送内容不能为空！')
            }
          }
        } else if (item.nodeName == 'IMG') {
          sendMessage &&
            this.$emit('sendMessage', this.sendText(sendMessage), 0)
          sendMessage = ''
          this.$emit('sendMessage', item.currentSrc, 1)
          sendImg = ''
        }
      })
      document.getElementById('input').innerHTML = ''
    },
    enter(event) {
      if (event.keyCode === 13 && event.shiftKey) {
        // shitt+回车自带换行
      } else if (event.keyCode === 13) {
        event.preventDefault()
        this.sendMessage()
      }
    },
    getblur() {
      this.sel = window.getSelection()
      this.range = this.sel.getRangeAt(0)
      this.range.deleteContents()
    },
    //插入表情
    insertHtml(html) {
      if (this.sel) {
        if (this.sel.getRangeAt && this.sel.rangeCount) {
          var el = document.createElement('div')
          el.innerHTML = html
          var frag = document.createDocumentFragment(),
            node,
            lastNode
          while ((node = el.firstChild)) {
            lastNode = frag.appendChild(node)
          }
          this.range.insertNode(frag)
          if (lastNode) {
            this.range = this.range.cloneRange()
            this.range.setStartAfter(lastNode)
            this.range.collapse(true)
            this.sel.removeAllRanges()
            this.sel.addRange(this.range)
          }
        }
      } else {
        let sel = window.getSelection(),
          range
        if (sel.getRangeAt && sel.rangeCount) {
          sel.collapseToEnd()
          range = sel.getRangeAt(0)
          range.deleteContents()
          var el = document.createElement('span')
          el.innerHTML = html
          var frag = document.createDocumentFragment(),
            node,
            lastNode
          while ((node = el.firstChild)) {
            lastNode = frag.appendChild(node)
          }
          range.insertNode(frag)
          if (lastNode) {
            range = range.cloneRange()
            range.setStartAfter(lastNode)
            range.collapse(true)
            sel.removeAllRanges()
            sel.addRange(range)
          }
        }
      }
    },
    sendText(newVal) {
      if (!newVal) return
      var str = newVal
      if (str.length >= 240) {
        this.$message.error(this.$t('overLimit'))
        var string = str.slice(0, 240)
        var arr = string.split('[')
        arr.forEach((item, index) => {
          if (index > 0 && item.indexOf(']') === -1) {
            arr.pop()
          }
        })

        return arr.join('[')
      } else {
        return newVal
      }
    },
  },
  created() {},
  mounted() {
    var downloadImgtext = [
      {
        label: '粘贴',
        click: () => {
          if (clipboard.availableFormats().includes('image/png')) {
            let image = new clipboard.readImage()
            var img = document.createElement('img')
            img.setAttribute('src', image.toDataURL())
            img.setAttribute('style', 'max-width:120px; max-height:90px')
            this.insertHtmlAtCaret(img)
          } else if (
            clipboard.availableFormats().includes('text/html') ||
            clipboard.availableFormats().includes('text/plain')
          ) {
            let clipboardText = clipboard.readText()
            for (let i = 0; i < clipboardText.length; i++) {
              let textNode = document.createElement('input')
              textNode.type = 'button'
              textNode.value = clipboardText.charAt(i)
              this.insertHtmlAtCaret(textNode)
            }
          }
        },
      },
    ]
    this.setMenuPasteImgData = remote.Menu.buildFromTemplate(downloadImgtext)
  },
}
</script>
<style lang="less" scoped>
@import '@/style/common.less';
.inputBox2 {
  height: 200px;
}
#input {
  padding: 0 10px;
  border: #7f7f7f;
  height: calc(100% - 120px);
  overflow-y: auto;
  outline: none;
  width: 100%;
  color: #000;
  font-size: 14px;
  font-family: 微软雅黑, serif;
  word-wrap: break-word;
  word-break: break-all;
  overflow-x: hidden;

  .file {
    cursor: default;
    height: 45px;
    padding: 5px 10px;
    width: 300px;
    position: relative;
    border: 0.5px solid #d0d0d0;
    border-radius: 3px;

    &:hover {
      background: #d0cecd;
    }

    .el-icon-close {
      position: absolute;
      top: 3px;
      right: 5px;
      cursor: pointer;
      color: #969696;

      &:hover {
        color: #6b6b6b;
      }
    }

    .el-icon-document {
      color: #969696;
      font-size: 40px;
      float: left;
    }

    .info {
      margin-left: 15px;
      font-size: small;
      float: left;

      p {
        margin: 0;
      }
    }
  }
}
.send {
  position: absolute;
  top: 120px;
  bottom: 10px;
  right: 10px;

  /deep/ .ant-checkbox + span {
    padding-left: 0;
    color: #ccc;
  }

  .send_btn {
    display: inline-block;
    width: 50px;
    height: 30px;
    text-align: center;
    line-height: 30px;
    background: @LightGray;
    border-radius: 5px;
    .pointer();
  }

  .activt_btn {
    background-color: #1890ff;
    color: @white;
  }
}

#input:empty::before {
  color: lightgrey;
  content: attr(placeholder);
}
</style>
