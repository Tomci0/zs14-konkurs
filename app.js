const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const { readdirSync } = require('file-system');
const noBots = require('express-nobots');
const session = require('express-session');
const csrf = require('csrf');
const passport = require("passport");
require('dotenv').config();
const mongoose = require("mongoose");
const flash = require('express-flash');


// CONNETCING TO DATABASE

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connection.on('connected', function(){
  console.log('[MONGODB] Connected to database');
});
mongoose.connection.on('error', function(err){
  throw err;
});
mongoose.connection.on('disconnected', function(){
  console.log('[MONGODB] Disconnected from database');
});

// DEBUG

debug = (process.env.VERSION === 'PROD') ? function() {} : console.log;


// EXPRESS

var app = express();

app.set('trust proxy', 1) // trust first proxy
const sessionMiddleware = session({
  secret : 'miCFzbONZDYRRqus',
  resave : true,
  saveUninitialized : true
})
app.use(sessionMiddleware);

// view engine setup e
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

if (process.env.VERSION === 'PROD') {
  app.use(logger('combined'));
} else {
  app.use(logger('dev'));
}

app.use(express.json());
app.use(noBots({block:true}));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.disable('x-powered-by');
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// 
// PASSPORT GOOGLE OAUTH
// 

require('./middleware/passport');

// 
// JS FILES
// 

// BIBLIOTEKI

// app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist'));
// app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist'));
// app.use('/popper', express.static(__dirname + '/node_modules/popper.js/dist/umd'));
// app.use('/jquery-easing', express.static(__dirname + '/node_modules/jquery-easing/dist'));
// app.use('/daterangepicker', express.static(__dirname + '/node_modules/daterangepicker'));
// app.use('/moment', express.static(__dirname + '/node_modules/moment/min'));
// app.use('/fontawesome', express.static(__dirname + '/node_modules/@fortawesome/fontawesome-free'));

//
//
//


console.log('\n')

readdirSync(path.join(__dirname, 'routes')).forEach(function(file, index, array) {
  if (file.split('.')[1] === 'js' ) {
    let siteFile = require('./routes/' + file.split('.')[0]);

    if (file.split('.')[0] === 'index') {
      app.use('/', siteFile);
      debug('Loading site: / from file: ' + file);
    } else {
      app.use('/' + file.split('.')[0], siteFile);
      debug('Loading site: /' + file.split('.')[0] + ' from file: ' + file);
    }
  } else if (!file.split('.')[1]) {
    let files = readdirSync(path.join(__dirname, 'routes/' + file));
    if (files.find(r => r === 'data.js')) {
      let dataFile = require('./routes/' + file.split('.')[0] + '/data');
      if (dataFile.url) {
        if (dataFile.mainFile) {
          let mainFile = require('./routes/' + file.split('.')[0] + '/' + dataFile.mainFile.split('.')[0]);
          if (mainFile.length > 0) {
            app.use(dataFile.url, mainFile);
            dataFile.loadOtherFiles(mainFile);
            debug('Loading site: ' + dataFile.url + ' from file: /routes/' + file.split('.')[0] + '/' + dataFile.mainFile);
          } else {
            debug('Error loading mainFile from /routes/' + file.split('.')[0] + '/' + dataFile.mainFile);
          }
        } else {
          debug('Error loading mainFile from /routes/' + file.split('.')[0] + '/data.js');
        }
      } else {
        debug('Error loading url from /routes/' + file.split('.')[0] + '/data.js');
      }
    } else {
      debug('Error loading file: /routes/' + file + '/data.js - no data.js file found');
    }
  }
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  res.status(404).render('errors/404')
});

app.use(function(req, res, next) {
    res.locals.userData = req.user || false;
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = process.env.VERSION === 'PROD' ? {} : err;
  res.status(err.status || 500).json({
    "error": "500 Internal Server Error",
    "message": err.message
  });
});

// var debug = require('debug')('ejs:server');
var http = require('http');

/**
 * Get port from environment and store in Express.
 */
var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
      ? 'Pipe ' + port
      : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
      ? 'pipe ' + addr
      : 'port ' + addr.port;
  console.log('\nListening on ' + bind + '\nhttp://localhost:' + port + "\nVERSION: " + process.env.VERSION + '\n');
}