function routes(app) {
  var dbClient = app.get('dbClient');

  var index = function(req, res) {
    res.render('index', { title: 'CaRMa - Генерирование мобильных приложений' });
  };

  var client = function(req, res) {
    loadClients(req, res, dbClient);
  };

  var genClient = function(req, res) {
    genClientApp(req, res);
  };

  var partner = function(req, res) {
    loadPartners(req, res, dbClient);
  };

  var genPartner = function(req, res) {
    genPartnerApp(req, res);
  };

  app.get('/', index);
  app.get('/client', client);
  app.get('/partner', partner);
  app.post('/client/gen', genClient);
  app.post('/partner/gen', genPartner);
}
exports.routes = routes;

// Private methods

function genClientApp(req, res) {
  var buildName = gen_rand_name();
  var logo = req.files.logo;
  var icon48x48 = req.files.icon48x48;
  var icon72x72 = req.files.icon72x72;
  var icon96x96 = req.files.icon96x96;
  var errMsg = req.param('err_msg');
  var infoMsg = req.param('info_msg');
  var tel = req.param('tel');
  var program = req.param('program');

  var cp = require('child_process');
  var scriptCWD = __dirname + '/../../';
  cp.execFile(scriptCWD + 'generate-ramc-cli.sh',
              ['-n', buildName, '-l', logo.path, '-f', errMsg, '-i', infoMsg,
               '-p', tel, '-r', program, '-4', icon48x48.path, '-7', icon72x72.path,
               '-9', icon96x96.path],
              {cwd: scriptCWD},
              function(err, stdout, stderr) {

    var legendText = 'PAMK - загрузка клиентского приложения';
    if (err || stderr) {
      var  error = err || stderr;
      res.render('download_file_err', { legend: legendText, error: error });
      console.error(error);
    } else {
      moveBuildedApp(buildName, 'cli', function(files) {
        res.render('download_file', { legend: legendText, files: files });
      });
    }
  });
}

function genPartnerApp(req, res) {
  var buildName = gen_rand_name();
  var partnerId = req.param('partner');

  var cp = require('child_process');
  var scriptCWD = __dirname + '/../../';
  cp.execFile(scriptCWD + 'generate-ramc-par.sh',
              ['-n', buildName, '-p', partnerId],
              {cwd: scriptCWD},
              function(err, stdout, stderr) {

    var legendText = 'PAMK - загрузка партнёрского приложения';
    if (err || stderr) {
      var  error = err || stderr;
      res.render('download_file_err', { legend: legendText, error: error });
      console.error(error);
    } else {
      moveBuildedApp(buildName, 'par', function(files) {
        res.render('download_file', { legend: legendText, files: files });
      });
    }
  });
}

// move folder with builded apps
// from private to public zone
function moveBuildedApp(buildName, type, callback) {
  var fs = require('fs');
  var cp = require('child_process');

  var scriptCWD = __dirname + '/../../';
  var privBuildDir = scriptCWD + 'gen-' + type + '/' + buildName;
  var pubBuildDir = __dirname + '/../public/build/gen-' + type + '/' + buildName;
  var files = [];
  // remove folder if it already exists
  cp.execFile('rm', ['-rf', pubBuildDir], function(err, stdout, stderr) {
    if (err || stderr) {
      var  error = err || stderr;
      console.error(error);
    } else {
      // move builded folder to public zone
      fs.rename(privBuildDir, pubBuildDir, function(err) {
        if (err) {
          console.error(error);
        } else {
          var fileNames = fs.readdirSync(pubBuildDir);
          files = fileNames.map(function(fileName) {
            return {name: fileName, path: '/build/gen-' + type + '/' + buildName + '/' + fileName};
          });
          callback(files);
        }
      });
    }
  });
}

function loadPartners(req, res, dbClient) {
  var query = dbClient.query("SELECT id, name" +
                           " FROM partnertbl" +
                           " WHERE ismobile AND name is not null" +
                           " ORDER BY name");
  var partners = [];
  query.on('row', function(row) {
    partners.push(row);
  });
  query.on('end', function() {
    res.render('partner', { partners: partners});
  });
}

function loadClients(req, res, dbClient) {
  var query = dbClient.query("SELECT id, label" +
                           " FROM \"Program\"" +
                           " WHERE label is not null" +
                           " ORDER BY label");
  var programs = [];
  query.on('row', function(row) {
    programs.push(row);
  });
  query.on('end', function() {
    res.render('client', { programs: programs});
  });
}

function gen_rand_name() {
  var crypto = require('crypto');
  return crypto.randomBytes(8).toString('hex');
}
