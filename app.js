var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var bodyParser = require('body-parser');
var multer = require('multer');
var mongoose = require('mongoose');

//express app init
var app = express();

/**
 * Initialize pagination module
 * @param {app} express app param
 **/
module.exports.init = function (app) {
    var helpers = {};
    helpers['paginate'] = function (req, res) {
       return paginateHelper;
    };
    app.dynamicHelpers(helpers);  
};

//set app level variables/functions
var secrets = require('./app/config/secrets');
var appVariables = require('./app/config/app_variables')(app);
var appfunctions = require('./app/config/app_functions')(app);

//database connection & models
var db = mongoose.connection;
db.on('connecting', function() {
    console.log('connecting to MongoDB...');
});
db.on('error', function(error) {
    console.error('Error in MongoDb connection: ' + error);
    mongoose.disconnect();
});
db.on('connected', function() {
    console.log('MongoDB connected!');
});
db.once('open', function() {
    console.log('MongoDB connection opened!');
});
db.on('reconnected', function () {
    console.log('MongoDB reconnected!');
});
db.on('disconnected', function() {
    console.log('MongoDB disconnected!');
    mongoose.connect(secrets.db);
});
mongoose.connect(secrets.db);

/**
 * @method paginate
 * @param {opts} query Mongoose options
 * @param {callback} callback
 * Extend Mongoose Models to paginate queries
 **/
mongoose.Model.paginate = function(opts, callback) {
    var limit = opts.limit || 3;
    var page = opts.page || 1;
    var sort = opts.sort || "date-dsc";
    var Model = this;

    var sortObj = {};
    switch (sort.toLowerCase()) {
    case "date-asc":
      sortObj = {'updated': 1};
      break;
    case "date-dsc":
      sortObj = {'updated': -1};
      break;
    case "name-asc":
      sortObj = {'name': 1};
      break;
    case "name-dsc":
      sortObj = {'name': -1};
      break;
    }

    Model.count(function (err, totalRecords) {
        var query = Model.find({}).sort(sortObj).skip((page - 1) * limit).limit(limit);
        query.exec(function(error, records) {
          if (err) return callback(err);
          records.totalRecords = totalRecords;
          records.currentPage = page;
          records.totalPages = Math.ceil(totalRecords / limit);
          records.limit = limit;
          records.sort = sort;
          callback(null, records);
        });
    });
};
mongoose.model('Property', require('./app/models/property').Property);
mongoose.model('Image', require('./app/models/image').Image);


//set app level variables/functions
var appVariables = require('./app/config/app_variables')(app);
var appfunctions = require('./app/config/app_functions')(app);

// view engine setup
app.set('views', path.join(__dirname, 'app/views'));
app.set('view engine', 'ejs');

//setup path for static elements - js/css/images
app.use(express.static(path.join(__dirname, 'app/public')));

//apply favicon
app.use(favicon());

//middleware for parsing json objects in http requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

//middleware for file uploads
app.use(multer({
	dest: './tmp/',
	limits: {
		fieldNameSize: 100,
		files: 3
	}}));

//setup routers
var homepage = require('./app/routes/index');
var properties = require('./app/routes/properties');
var images = require('./app/routes/images');
var api = require('./app/routes/api');

app.use('/', homepage);
//app.use('/properties', properties);
app.use('/images', images);
app.use('/api', api);


/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: err
    });
});

//set server port
app.set('port', process.env.PORT || 3000);

//inti server
var server = app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + server.address().port);
});

module.exports = app;
