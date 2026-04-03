var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
let mongoose = require('mongoose');

var indexRouter = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/users', require('./routes/users'));
app.use('/api/v1/roles', require('./routes/roles'));
app.use('/api/v1/posts', require('./routes/posts'));
app.use('/api/v1/comments', require('./routes/comments'));
app.use('/api/v1/messages', require('./routes/messages'));
app.use('/api/v1/upload', require('./routes/upload'));

// New modules from the image assignment
app.use('/api/v1/conversations', require('./routes/conversations'));
app.use('/api/v1/saved-posts', require('./routes/savedPosts'));
app.use('/api/v1/view-histories', require('./routes/viewHistories'));
app.use('/api/v1/follows', require('./routes/follows'));
app.use('/api/v1/reactions', require('./routes/reactions'));
app.use('/api/v1/notifications', require('./routes/notifications'));
app.use('/api/v1/reports', require('./routes/reports'));

mongoose.connect('mongodb://localhost:27017/SocialMedia?directConnection=true');
mongoose.connection.on('connected', () => {
  console.log("MongoDB connected");
});
mongoose.connection.on('disconnected', () => {
  console.log("MongoDB disconnected");
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
