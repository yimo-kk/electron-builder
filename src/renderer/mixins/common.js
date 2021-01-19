
import zhCN from 'ant-design-vue/lib/locale-provider/zh_CN'
const path = require('path')
export default function () {
  return {
    data () {
      return {
        locale: zhCN,
        isPlaying: false
      };
    },
    methods: {
      play () {
        this.lastRunTime = Date.now();
        let audio = document.querySelector("#audio");
        if (!this.isPlaying) {
          audio.play();
          this.isPlaying = true;
        }
        let timeOut = setTimeout(() => {
          this.currentTime = Date.now();
          if (this.currentTime - this.lastRunTime >= 990) {
            if (this.isPlaying) {
              audio.currentTime = 0;
              audio.pause();
              this.isPlaying = false;
            }
          }
          clearTimeout(timeOut);
        }, 1000);
      },
      notification (data) {
        const myNotification = new Notification(this.$t('NewNews'), {
          body: ``,
          timeoutType: "default",
          silent: true,
          icon: path.join(__dirname, '../../assets/logo.png')
        });
        myNotification.onclick = () => {
          this.$electron.ipcRenderer.send("message_notification_click",);
        };
      },
      setLocale () {
        this.locale = zhCN
      }
    },
  };
}
