
const clipboard = require('electron').clipboard
const nativeImg = require('electron').nativeImage

// let appData = []
// for (let key in wChatToUi) {
//   let obj = {}
//   obj[wChatToUi[key]] = key
//   obj.name = wChatToUi[key]
//   obj.oldName = key
//   appData.push(obj)
// }
// // 表情转化

// export function conversionFace (input) {
//   if (!input) return
//   appData.forEach(key => {
//     let re = {
//       regex: new RegExp(`\\[${key.oldName}\\]`, "g"),
//       placeholder: key.name
//     }
//     input = input.replace(re.regex, re.placeholder);
//   })
//   return input;
// }
// export function conversion (input) {
//   if (!input) return
//   const regexTab = [];
//   for (let key of Object.keys(appData)) {
//     regexTab.push({
//       // regex: new RegExp(appData[key]["char"], "g"),
//       regex: new RegExp(appData[key]["name"], "g"),
//       placeholder: "[em_" + key + "]"
//     });
//   }
//   for (let x of regexTab) {
//     input = input.replace(x.regex, x.placeholder);
//   }
//   return input;
// }
// export function conversionFace (input) {
//   if (!input) return
//   for (let key of Object.keys(appData)) {
//     let re = {
//       regex: new RegExp(`\\[em_${key}\\]`, "g"),
//       // placeholder: appData[key]["char"]
//       placeholder: appData[key]["name"]
//     }
//     input = input.replace(re.regex, re.placeholder);
//   }
//   return input;
// }
// 校验上传图片格式
export function isImage (str) {
  var reg = /\.(png|jpg|gif|jpeg|webp)$/;
  return !reg.test(str);
}
// export function isImage (str) {
//   //判断是否是图片 - strFilter必须是小写列举
//   var strFilter = ".jpeg|.gif|.jpg|.png|.bmp|.pic|.svg|"
//   if (str.indexOf(".") > -1) {
//     var p = str.lastIndexOf(".");
//     var strPostfix = str.substring(p, str.length) + '|';
//     strPostfix = strPostfix.toLowerCase();
//     if (strFilter.indexOf(strPostfix) > -1) {
//       return true;
//     }
//   }
//   return false;
// }
// 压缩图片
export function compressImage (file, success, error) {
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
export function isLocalStorage (key) {
  if (localStorage.getItem(key)) {
    return true
  } else {
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
/**
 *  判断有个元素是否在一个数组的对象中
 * @param {*} arr 目标数组
 * @param {*} key 对象key值
 * @param {*} val val值
 */
export function isArr (arr, key, val) {
  return arr.some(item => {
    return item[key] == val
  })
}
/**
 * 删除数组中某个元素
 * @param {*} list 
 * @param {*} value 
 */
export function deleteListValue (list, target, value) {
  return list.filter(item => {
    return item[target] != value
  })
}

/**
 * 数组里对象某个值进行排序 高到低
 * @param {*} property 
 */
export function compare (property) {
  return function (a, b) {
    var value1 = parseInt(a[property]);
    var value2 = parseInt(b[property]);
    return value2 - value1;
  }
}
/**
 * 数组里对象中对象的时间进行排序 高到低
 * @param {*} property 
 */
export function compareTime (property, val) {
  return function (a, b) {
    if (!a[property] || !b[property]) return
    var value1 = new Date(a[property][val]);
    var value2 = new Date(b[property][val]);
    return value2 - value1;
  }
}


function convertImgToBase64 (url, callback, outputFormat) {
  var canvas = document.createElement('CANVAS'),
    ctx = canvas.getContext('2d'),
    img = new Image;
  img.crossOrigin = 'Anonymous';
  img.onload = function () {
    canvas.height = img.height;
    canvas.width = img.width;
    ctx.drawImage(img, 0, 0);
    var dataURL = canvas.toDataURL(outputFormat || 'image/png');
    callback.call(this, dataURL);
    canvas = null;
  };
  img.src = url;
}
export function clipboardImg (url) {
  convertImgToBase64(url, function (base64Image) {
    const image = nativeImg.createFromDataURL(base64Image)
    clipboard.writeImage(image)
  })
}
/**
 * 滚动条回到顶部
 * @param {*} element 
 */
export function elementScrollTop (element) {
  let timer = setInterval(function () {
    var scrollTop = element.scrollTop
    var ispeed = Math.floor(-scrollTop / 6)
    if (scrollTop == 0) {
      clearInterval(timer)
    }
    element.scrollTop = scrollTop + ispeed
  }, 30)
}
// 获取url参数
export function getQueryString (name) {
  var args = {};
  var query = location.href.split('?');
  var pairs = query[query.length - 1].split('&');
  for (let i = 0; i < pairs.length; i++) {
    var pos = pairs[i].indexOf('=');
    if (pos === -1) continue;
    var name = pairs[i].substring(0, pos);
    var value = pairs[i].substring(pos + 1);
    value = decodeURIComponent(value);
    args[name] = value;
  }
  return args;

}
/**
 * 数组去重
 * list 数组
 * id 数组中的对象的唯一表示 不传 就单纯数组去重
 */
export function repetition (list, id) {
  let arr = []
  list.forEach((item) => {
    if (id) {
      if (arr.length) {
        arr.forEach((val) => {
          if (val[id] !== item[id]) {
            arr.push(item)
          }
        })
      } else {
        arr.push(item)
      }
    } else {
      !arr.includes(item) && arr.push(item)
    }
  })

  return arr
}