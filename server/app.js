var cluster = require('cluster');

if (cluster.isMaster) {
  var cpuCount = require('os').cpus().length;
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
  var express = require('express')
    , routes = require('./routes/routes');

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
  });

  app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  });

  app.configure('production', function(){
    // we need show errors to user
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  });

  // Routes

  app.get('/', routes.index);
  app.get('/client', routes.client);
  app.get('/partner', routes.partner);
  app.post('/client/gen', routes.genClient);
  app.post('/partner/gen', routes.genPartner);

  app.listen(3000, function(){
    console.log("[WORKER][" + cluster.worker.id + "] CarMa - RAMC mobile app generator is running...");
  });
}
