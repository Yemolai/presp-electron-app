// Module to control application life.
var app = require('electron').app;
// Module to create native browser window.
var BrowserWindow = require('electron').BrowserWindow;

var ENV = require('./.env');
var fs = require('fs');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow;

var dbPath = null;
if ('db' in ENV && 'dialect' in ENV.db && ENV.db.dialect=='sqlite') {
  if ('internal' in ENV.db && ENV.db.internal === true) {
    dbPath = __dirname + '/' + ENV.db.path;
    var emptyPath = __dirname + '/vazio.sqlite';
    fs.stat(dbPath, function (err, stats) {
      if (err !== null) {
        if (err.code === 'ENOENT') {
          console.warn('Arquivo de banco de dados não existe, será criado.');
          fs.createReadStream(emptyPath)
          .pipe(fs.createWriteStream(dbPath));
        } else if (stats.isDirectory()) {
          console.error('Caminho do banco de dados leva a uma pasta');
          console.error('Path: ', dbPath);
          app.quit();
        } else {
          console.error('NÃO FOI POSSÍVEL ENCONTRAR ARQUIVO DE BANCO DE DADOS!');
          console.error('Detalhes: ', err);
          app.quit();
        }
      }
    });
  }
}

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 790,
    height: 555,
    icon: 'img/favicon.ico'
  });
  mainWindow.setMenuBarVisibility(false);
  // mainWindow.maximize();
  // and load the index.html of the app.
  mainWindow.loadURL('file://' + __dirname + '/index.html');

  // Open the DevTools.
  // mainWindow.webContents.openDevTools(); (Pressione Ctrl+Shift+I)

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function () {
  // TODO check if database file exists
  // TODO copy default empty database as counter-measure if has no database file
  createWindow();
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});
