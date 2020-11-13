import Notification from './../base/notification'
let toastInstance

function getToastInstance () {
  toastInstance = toastInstance || Notification.newInstance()
  return toastInstance
}

const notice = function ({ content = $t('prompt'), icon = '', duration = 3 }) {
  let instance = getToastInstance()
  instance.notice({
    content,
    icon,
    duration
  })
}

export default notice
