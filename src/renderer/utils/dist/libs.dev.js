"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.conversion = conversion;
exports.conversionFace = conversionFace;
exports.isImage = isImage;
exports.compressImage = compressImage;
exports.isLocalStorage = isLocalStorage;
exports.isArr = isArr;
exports.deleteListValue = deleteListValue;
exports.compare = compare;
exports.clipboardImg = clipboardImg;
exports.DebounceBy = void 0;

var appData = require("@/assets/emojis.json");

var clipboard = require('electron').clipboard;

var nativeImg = require('electron').nativeImage;


function conversion (input) {
  if (!input) return;
  var regexTab = [];

  for (var _i = 0, _Object$keys = Object.keys(appData); _i < _Object$keys.length; _i++) {
    var key = _Object$keys[_i];
    regexTab.push({
      regex: new RegExp(appData[key]["char"], "g"),
      placeholder: "[em_" + key + "]"
    });
  }

  for (var _i2 = 0, _regexTab = regexTab; _i2 < _regexTab.length; _i2++) {
    var x = _regexTab[_i2];
    input = input.replace(x.regex, x.placeholder);
  }

  return input;
}

function conversionFace (input) {
  if (!input) return;

  for (var _i3 = 0, _Object$keys2 = Object.keys(appData); _i3 < _Object$keys2.length; _i3++) {
    var key = _Object$keys2[_i3];
    var re = {
      regex: new RegExp("\\[em_".concat(key, "\\]"), "g"),
      placeholder: appData[key]["char"]
    };
    input = input.replace(re.regex, re.placeholder);
  }

  return input;
} // 校验上传图片格式


function isImage (str) {
  var reg = /\.(png|jpg|gif|jpeg|webp)$/;
  return !reg.test(str);
}
// 压缩图片
function compressImage (file, success, error) {
  var name = file.name; //文件名

  var reader = new FileReader();
  reader.readAsDataURL(file);

  reader.onload = function (e) {
    var src = e.target.result;
    var img = new Image();
    img.src = src; // 图片小于1M不压缩

    if (file.size < Math.pow(1024, 2)) {
      return success(src, file);
    }

    img.onload = function () {
      var w = img.width;
      var h = img.height;
      var quality = 0.7; // 默认图片质量为0.92
      // 生成canvas

      var canvas = document.createElement("canvas");
      var ctx = canvas.getContext("2d"); // 创建属性节点

      var anw = document.createAttribute("width");
      anw.nodeValue = w;
      var anh = document.createAttribute("height");
      anh.nodeValue = h;
      canvas.setAttributeNode(anw);
      canvas.setAttributeNode(anh); // 铺底色 PNG转JPEG时透明区域会变黑色

      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h); // quality值越小，所绘制出的图像越模糊

      var base64 = canvas.toDataURL("image/jpeg", quality); // 图片格式jpeg或webp可以选0-1质量区间

      success(base64);
    };

    img.onerror = function (e) {
      error(e);
    };
  };

  reader.onerror = function (e) {
    error(e);
  };
} // localStorage 存储数据


function isLocalStorage (key) {
  if (localStorage.getItem(key)) {
    return true;
  } else {
    return false;
  }
} // 防抖 防止点多次


var DebounceBy = function DebounceBy (fn, t) {
  var delay = t || 500;
  var timer;
  return function () {
    var args = arguments;

    if (timer) {
      clearTimeout(timer);
    }

    var callNow = !timer;
    timer = setTimeout(function () {
      timer = null;
    }, delay);
    if (callNow) fn.apply(this, args);
  };
};
/**
 *  判断有个元素是否在一个数组的对象中
 * @param {*} arr 目标数组
 * @param {*} key 对象key值
 * @param {*} val val值
 */


exports.DebounceBy = DebounceBy;

function isArr (arr, key, val) {
  return arr.some(function (item) {
    return item[key] == val;
  });
}
/**
 * 删除数组中某个元素
 * @param {*} list 
 * @param {*} value 
 */


function deleteListValue (list, target, value) {
  return list.filter(function (item) {
    return item[target] != value;
  });
}
/**
 * 数组里对象某个值进行排序 高到低
 * @param {*} property 
 */


function compare (property) {
  return function (a, b) {
    var value1 = parseInt(a[property]);
    var value2 = parseInt(b[property]);
    return value2 - value1;
  };
}

function convertImgToBase64 (url, callback, outputFormat) {
  var canvas = document.createElement('CANVAS'),
    ctx = canvas.getContext('2d'),
    img = new Image();
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

function clipboardImg (url) {
  convertImgToBase64(url, function (base64Image) {
    var image = nativeImg.createFromDataURL(base64Image);
    clipboard.writeImage(image);
  });
}