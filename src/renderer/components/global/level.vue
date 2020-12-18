<script>
export default {
  name: 'Level',
  props: {
    num: {
      type: Number,
      default: 0,
    },
  },
  render(createElement) {
    let element = []
    if (this.num) {
      element.push(
        createElement('img', {
          style: {
            width: '25px',
            height: '25px',
          },
          attrs: {
            src: this.num
              ? require(`../../assets/img/level-${this.num}.svg`)
              : '',
            // 添加属性的地方
          },
        })
      )
    }
    return createElement('div', element)
  },
  data() {
    return {}
  },
}
</script>
