var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var config = require('config.json')('./config/config.json');

var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var redis = require('redis');
var morgan = require('morgan');

var fs = require('fs');

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;

var app = express();



var logDirectory = './log';

// ensure log directory exists
if (!fs.existsSync(logDirectory)){
    fs.mkdirSync(logDirectory);
}

var FileStreamRotator = require('file-stream-rotator');

// create a rotating write stream
var accessLogStream = FileStreamRotator.getStream({
    date_format: 'YYYYMMDD',
    filename: logDirectory + '/access-%DATE%.log',
    frequency: 'daily',
    verbose: false
});


// setup the logger
//app.use( morgan('combined', {stream: accessLogStream}));
app.use( morgan('dev', {stream: accessLogStream}));

var mysql = require('mysql');

// Web page
var index = require('./routes/web/index');

var dropbox_release = require('./routes/msg/dropbox-release');

// Android
var sms_send = require('./routes/msg/auth/sms/send');
var sms_check = require('./routes/msg/auth/sms/check');

var msg_error = require('./routes/msg/error');

var msg_user = require('./routes/msg/user/user');
var msg_mapping = require('./routes/msg/user/mapping');
var msg_reservation = require('./routes/msg/user/reservation');
var msg_chatting = require('./routes/msg/user/chatting');
var msg_recovery_password = require('./routes/msg/user/recovery/password');
var msg_invitation = require('./routes/msg/user/invitation');
var msg_picture = require('./routes/msg/user/repository/picture');

var msg_yellow_id = require('./routes/msg/yellow_id/yellow_id');

var msg_firebase = require('./routes/msg/firebase/firebase');


//console.log("My webpage start!");

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(morgan('dev'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended:false, parameterLimit: 1000000}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'dist')));

// Web page
app.use('/', index);
app.use('/dropbox-release', dropbox_release);
app.use('/msg/release/dropbox', dropbox_release);

// Android
app.use('/msg/error', msg_error);
app.use('/msg/firebase', msg_firebase);
app.use('/msg/yellow_id', msg_yellow_id);

app.use('/msg/user', msg_user);
app.use('/msg/user/mapping', msg_mapping);
app.use('/msg/user/reservation', msg_reservation);
app.use('/msg/user/chatting', msg_chatting);
app.use('/msg/user/invitation', msg_invitation);
app.use('/msg/user/recovery/password', msg_recovery_password);
app.use('/msg/user/repository/picture', msg_picture);

app.use('/msg/auth/sms/send', sms_send);
app.use('/msg/auth/sms/check', sms_check);

client = redis.createClient(config.redis.port, config.redis.host);
client.auth(config.redis.password);

app.use(function(req,res,next){
      req.cache = client;
      next();
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
