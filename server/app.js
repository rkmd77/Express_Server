var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var ejs = require('ejs');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
//新添加goods路由
var goodsRouter = require('./routes/goods');

var app = express();

// view engine setup (jade)
app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

// view engine setup (ejs)
app.engine('.html',ejs.__express);
app.set('view engine', 'html');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//路由拦截
app.use(function(req, res, next){
	if(req.cookies.userID){
		next();
	}
	else{
		//if(req.originalUrl=='/users/login' || req.originalUrl=='/users/logout' || req.originalUrl.indexOf('/goods/list')>-1){
		if(req.originalUrl=='/users/login' || req.originalUrl=='/users/logout' || req.path=='/goods/list'){
			next();
		}
		else{
			res.json({
				status: "10001",
				msg: 'please login first!',
				results: ''
			});
		}
	}
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
//新添加goods路由
app.use('/goods', goodsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
