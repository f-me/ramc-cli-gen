exports.index = function(req, res) {
  res.render('index', { title: 'CaRMa - Генерирование мобильных приложений' });
};

exports.client = function(req, res) {
  res.render('client', {});
};

exports.genClient = function(req, res) {
  genClientApp(req, res);
};

exports.partner = function(req, res) {
  loadPartners(req, res);
};

exports.genPartner = function(req, res) {
  genPartnerApp(req, res);
};

function genClientApp(req, res) {
  var buildName = gen_rand_name();
  var logo = req.files.logo;
  var errMsg = req.param('err_msg');
  var infoMsg = req.param('info_msg');
  var tel = req.param('tel');

  var cp = require('child_process');
  var scriptCWD = __dirname + '/../../';
  cp.execFile(scriptCWD + 'generate-ramc-cli.sh',
              ['-n', buildName, '-l', logo.path, '-f', errMsg, '-i', infoMsg, '-p', tel],
              {cwd: scriptCWD},
              function(err, stdout, stderr) {

    var legendText = 'PAMK - загрузка клиентского приложения';
    if (err) {
      res.render('download_file_err', { legend: legendText });
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
    if (err) {
      res.render('download_file_err', { legend: legendText });
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
    // move builded folder to public zone
    fs.rename(privBuildDir, pubBuildDir, function(err) {
      var fileNames = fs.readdirSync(pubBuildDir);
      files = fileNames.map(function(fileName) {
        return {name: fileName, path: '/build/gen-' + type + '/' + buildName + '/' + fileName};
      });
      callback(files);
    });
  });
}

function loadPartners(req, res) {
  var pg = require('pg').native;
  var pgConf = require('../pg_conf.js');

  var USER = pgConf.pg_user;
  var PASSWORD = pgConf.pg_password;
  var HOST = pgConf.pg_host;
  var PORT = pgConf.pg_port;
  var DATABASE = pgConf.pg_database;

  var connPath = "tcp://" + USER + ":" + PASSWORD +
                 "@" + HOST + ":" + PORT + "/" + DATABASE;

  var client = new pg.Client(connPath);
  client.connect();

  var query = client.query("SELECT id, name" +
                           " FROM partnertbl" +
                           " WHERE ismobile AND name is not null" +
                           " ORDER BY name");
  var partners = [];
  query.on('row', function(row) {
    partners.push(row);
  });
  query.on('end', function() {
    client.end();
    res.render('partner', { partners: partners});
  });
}

function gen_rand_name() {
  var crypto = require('crypto');
  return crypto.randomBytes(8).toString('hex');
}
