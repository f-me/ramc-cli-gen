var cluster = require('cluster');

if (cluster.isMaster) {
  // Reduced number of threads to two
  // var cpuCount = require('os').cpus().length;
  var cpuCount = 2;
  for (var i = 0; i < cpuCount; i++) {
    cluster.fork();
  }
} else {
  launchWorker();
}

cluster.on('exit', function(worker) {
  console.log("[WORKER][" + worker.id + "] I'm died :(");
  cluster.fork();
});

function launchWorker() {

  // Module dependencies.
  var express = require('express');

  var app = module.exports = express();

  // Configuration

  app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.set('view options', {layout: false});
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));

    // setup db connection
    var pg = require('pg').native;
    var pgConf = require('./pg_conf.js');

    var USER = pgConf.pg_user;
    var PASSWORD = pgConf.pg_password;
    var HOST = pgConf.pg_host;
    var PORT = pgConf.pg_port;
    var DATABASE = pgConf.pg_database;

    var connPath = "tcp://" + USER + ":" + PASSWORD +
                   "@" + HOST + ":" + PORT + "/" + DATABASE;

    var dbClient = new pg.Client(connPath);
    dbClient.connect();
    app.set('dbClient', dbClient);
  });

  app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  });

  app.configure('production', function(){
    // we need show errors to user
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  });

  // Routes

  require('./routes/routes').routes(app);

  app.listen(3000, function(){
    console.log("[WORKER][" + cluster.worker.id + "] CarMa - RAMC mobile app generator is running...");
  });
}
