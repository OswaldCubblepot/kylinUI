const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { spawn, exec } = require('child_process');
const fetch = require('node-fetch');
const axios = require('axios');

let mainWindow;
let pythonProcess;
let serverProcess;
let isDarkMode = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
      webviewTag: true  // 启用 WebView 标签
    },
    autoHideMenuBar: true
  });

  mainWindow.loadFile('index.html');
  mainWindow.webContents.openDevTools();
}

function startPythonScript() {
  pythonProcess = spawn('python3', ['dhr.py']);  // 使用 'python3' 运行 dhr.py

  pythonProcess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  pythonProcess.on('close', (code) => {
    console.log(`Python script exited with code ${code}`);
  });
}

function startNodeServer() {
  serverProcess = exec('node server.js', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error starting server: ${error}`);
      return;
    }
    if (stderr) {
      console.error(`Server stderr: ${stderr}`);
    }
    console.log(`Server stdout: ${stdout}`);
  });
}

// 在应用准备好之前启动Python脚本和Node服务器
startPythonScript();
startNodeServer();

app.whenReady().then(() => {
  createWindow();

  app.on('ready', () => {
    app.disableHardwareAcceleration();
    createWindow();
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
  if (pythonProcess) {
    pythonProcess.kill();
  }
  if (serverProcess) {
    serverProcess.kill();
  }
});

ipcMain.on('runPython', async (event) => {
  try {
    console.log('Fetching status from Flask server...');
    const response = await fetch('http://localhost:5000/get_status');
    
    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
    }

    const status = await response.json();

    console.log('Received status from Flask server:', status);

    let message;
    if (typeof status === 'number') {
      message = `目前推荐使用的是第${status}种方案`;
    } else {
      message = '数据不可用';
    }

    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: '推荐方案',
      message: message
    });

    event.reply('fromPython', status);
  } catch (err) {
    console.error('Error fetching status from Flask server:', err);
    dialog.showErrorBox('Error', 'Failed to fetch status from Flask server. Please check the console for more details.');
    event.reply('fromPython', 'data not available');
  }
});

ipcMain.on('server-type-selected', (event, serverType) => {
  console.log(`Server type selected: ${serverType}`);

  axios.post('http://localhost:3500', { number: serverType })
    .then(response => {
      console.log(`Response from server: ${response.data.message}`);
    })
    .catch(error => {
      console.error(`Error sending data to server: ${error}`);
    });
});

// 新增代码：处理暗夜模式切换
ipcMain.on('toggle-dark-mode', (event) => {
  isDarkMode = !isDarkMode;
  mainWindow.webContents.send('dark-mode-status', isDarkMode);
});

