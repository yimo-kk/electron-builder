
export default function () {
  return {
    data () {
      return {

      };
    },
    methods: {
      menuNotClick () {
        // 下面这句代码是获取 点击的区域是否包含你的菜单，如果包含，说明点击的是菜单以外，不包含则为菜单以内
        document.addEventListener('click', (e) => {
          let flag = e.target.contains(
            document.getElementsByClassName('click_head_portrait')[0]
          )
          if (flag) return
          this.isHeadPortrait = false
        })
      },
    },
  };
}
