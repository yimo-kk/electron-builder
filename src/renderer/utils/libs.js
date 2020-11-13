const appData = require("@/assets/emojis.json");

// 表情转化
export function conversion(input) {
    if(!input)return
    const regexTab = [];
    for (let key of Object.keys(appData)) {
      regexTab.push({
        regex: new RegExp(appData[key]["char"], "g"),
        placeholder: "[em_" + key + "]"
      });
    }
    for (let x of regexTab) {
      input = input.replace(x.regex, x.placeholder);
    }
    return input;
  }
export function conversionFace(input) {
    if(!input)return
    for (let key of Object.keys(appData)) {
        let re={
            regex: new RegExp(`\\[em_${key}\\]`, "g"),
            placeholder: appData[key]["char"]
        }
        input = input.replace(re.regex,re.placeholder);
    }
    return input;
  }
  // 校验上传图片格式
export function isImage(str) {
    var reg = /\.(png|jpg|gif|jpeg|webp)$/;
    return !reg.test(str);
  }
  // 压缩图片
export function compressImage(file, success, error) {
    const name = file.name; //文件名
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = e => {
      const src = e.target.result;
      const img = new Image();
      img.src = src;
      // 图片小于1M不压缩
      if (file.size < Math.pow(1024, 2)) {
        return success(src, file);
      }
      img.onload = () => {
        const w = img.width;
        const h = img.height;
        const quality = 0.7; // 默认图片质量为0.92
        // 生成canvas
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        // 创建属性节点
        const anw = document.createAttribute("width");
        anw.nodeValue = w;
        const anh = document.createAttribute("height");
        anh.nodeValue = h;
        canvas.setAttributeNode(anw);
        canvas.setAttributeNode(anh);
        // 铺底色 PNG转JPEG时透明区域会变黑色
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        // quality值越小，所绘制出的图像越模糊
        const base64 = canvas.toDataURL("image/jpeg", quality); // 图片格式jpeg或webp可以选0-1质量区间
        success(base64);
      };
      img.onerror = e => {
        error(e);
      };
    };
    reader.onerror = e => {
      error(e);
    };
  }
  // localStorage 存储数据
export function isLocalStorage(key){
  if(localStorage.getItem(key)){
    return true
  }else {
    return false
  }
}
// 防抖 防止点多次
export const DebounceBy = (fn, t) => {
  let delay = t || 500
  let timer
  return function () {
    let args = arguments; 
    if (timer) {
      clearTimeout(timer)
    }
    let callNow = !timer
    timer = setTimeout(() => {
      timer = null
    }, delay)
    if (callNow) fn.apply(this, args)
  }
} 
 