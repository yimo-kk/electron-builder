import {
  app,
  BrowserWindow,
  Tray,
  Menu,
  globalShortcut,
  ipcMain,
  Notification,
} from "electron";
import path from "path";
import { updateHandle } from './update'
const feedUrl = 'https://user.nikidigital.net/'
/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== "development") {
  global.__static = require("path")
    .join(__dirname, "/static")
    .replace(/\\/g, "\\\\");
}

let mainWindow;
let appTray;
var notification;
const winURL =
  process.env.NODE_ENV === "development"
    ? `http://localhost:9080`
    : `file://${__dirname}/index.html`;

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    backgroundColor: "#ccc",
    useContentSize: true,
    width: 1020,
    height: 600,
    minWidth: 1020,
    minHeight: 600,
    webPreferences: {
      webSecurity: false, // 是否禁用浏览器的跨域安全特性
      nodeIntegration: true, // 是否完整支持node 
    },
    icon: path.join(__static, "./icon.ico"),
    show: false, // 先隐藏
    // frame:false
  });
  mainWindow.loadURL(winURL);
  mainWindow.on("ready-to-show", function () {
    mainWindow.show(); // 初始化后再显示
  });
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
  mainWindow.setMenu(null);
  mainWindow.on("close", (event) => {
    event.preventDefault();
    mainWindow.webContents.send("before_hide");
  });
  // 任务栏的闪烁
  ipcMain.on("message_prompt", () => {
    if (!mainWindow.isFocused()) {
      mainWindow.flashFrame(true);
    }
  });

  // 隐藏应用到托盘
  ipcMain.on("app-hide", () => {
    mainWindow.hide();
  });
  ipcMain.on("app-closed", () => {
    // 所有窗口都将立即被关闭，而不询问用户，而且 before-quit 和 will-quit 事件也不会被触发。
    app.exit();
  });
  // 新开窗口查看图片
  mainWindow.webContents.on('new-window', (event, url, frameName, disposition, options, additionalFeatures) => {
    if (frameName === 'modal') {
      event.preventDefault()
      Object.assign(options, {
        modal: true,
        width: 600,
        parent: mainWindow
      })
      event.newGuest = new BrowserWindow(options)
      event.newGuest.loadURL(url);
      event.newGuest.setMenu(null);
    }
  })
  let folderPath = ''
  let foldername = ''
  let downloadIndex = null
  ipcMain.on('download', (evt, { url, downloadFolder, name, index }) => {
    index && (downloadIndex = index)
    foldername = name
    folderPath = downloadFolder;
    mainWindow.webContents.downloadURL(url);
  })
  // 尝试更新
  updateHandle(mainWindow, feedUrl)
  // 下载文件
  mainWindow.webContents.session.on('will-download', (event, item, webContents) => {
    //设置文件存放位置
    item.setSavePath(folderPath);
    item.on('updated', (event, state) => {
      if (state === 'interrupted') {
        // 下载被中断
        console.log('Download is interrupted but can be resumed')
      } else if (state === 'progressing') { //下载中
        if (item.isPaused()) { //下载暂停
          console.log('Download is paused')
        } else {
          // 下载中 
          try {
            downloadIndex && mainWindow.webContents.send("progress", { index: downloadIndex, progress_num: item.getReceivedBytes() / item.getTotalBytes() });
          } catch (error) {
            console.log(error)
          }
        }
      }
    })
    item.once('done', (event, state) => {
      if (state === 'completed') {
        // 下载成功
        mainWindow.webContents.send("downloadSuccess", 'success');
      }
      else {
        mainWindow.webContents.send("downloadSuccess", 'error');
      }
    })
  })
}
// 设置托盘
function implementSystemTray () {
  let timer = null,
    count = 0;
  appTray = new Tray(path.join(__static, "./icon.ico"));
  const trayContextMenu = Menu.buildFromTemplate([
    {
      label: "打开",
      click: () => {
        mainWindow.show();
      },
    },
    {
      label: "退出",
      click: (event) => {
        mainWindow.webContents.send("before_closed");
      },
    },
  ]);
  appTray.setToolTip("妮姬客服系统");
  //系统托盘图标闪烁
  ipcMain.on("message_tray", () => {
    if (!mainWindow.isFocused()) {
      if (timer) return;
      timer = setInterval(function () {
        count++;
        if (count % 2 == 0) {
          appTray.setImage(path.join(__static, "./icon.ico"));
        } else {
          appTray.setImage(path.join(__static, "./favicon.ico"));
        }
      }, 500);
    }
  });
  mainWindow.on("focus", () => {
    mainWindow.flashFrame(false);
    clearInterval(timer);
    timer = null;
    appTray.setImage(path.join(__static, "./icon.ico"));
  });
  appTray.on("click", () => {
    if (mainWindow.isVisible()) {
      if (!mainWindow.isFocused()) {
        mainWindow.focus();
      } else {
        mainWindow.hide();
      }
    } else {
      mainWindow.show();
    }
  });
  appTray.on("right-click", () => {
    appTray.popUpContextMenu(trayContextMenu);
  });
}
app.on("ready", async () => {
  // 创建渲染窗口
  createWindow();
  implementSystemTray();
  // 设置快捷键
  globalShortcut.register("Ctrl+Alt+Z", function () {
    mainWindow.show();
  });
  // app.on("render-process-gone", () => {
  //   mainWindow.webContents.session.on('delete-app', '被杀死了')
  // });
});
app.on("window-all-closed", (event) => {
  mainWindow.webContents.send("before_closed");
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});



