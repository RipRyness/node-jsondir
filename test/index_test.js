/**
 * @fileOverview Tests for main file.
 */

var jsondir = require('../src/index');
var FS = require('fs');
var ASYNC = require('async');
var File = jsondir.File;
// var uidNumber = require('uid-number');

exports.json2dir = function(test) {
  test.expect(41);

  ASYNC.series([
    function(callback) {
      jsondir.json2dir({}, function(err) {
        if (err instanceof File.FileExistsException) {
          test.ok(true);
          return callback();
        }

        return callback(err);
      });
    },
    function(callback) {
      jsondir.json2dir({
        "-path": 'test/output'
      }, function(err) {
        if (err) return callback(err);
        test.ok(FS.existsSync('test/output'));
        test.ok(FS.statSync('test/output').isFile());
        FS.unlinkSync('test/output');
        callback();
      });
    },
    function(callback) {
      jsondir.json2dir({
        "-path": 'test/output',
        "a": {}
      }, function(err) {
        if (err) return callback(err);
        test.ok(FS.existsSync('test/output'));
        test.ok(FS.statSync('test/output').isDirectory());
        test.ok(FS.existsSync('test/output/a'));
        test.ok(FS.statSync('test/output/a').isFile());
        FS.unlinkSync('test/output/a');
        FS.rmdirSync('test/output');
        callback();
      });
    },
    function(callback) {
      jsondir.json2dir({
        "a": {}
      }, { ignoreExists: true }, function(err) {
        if (err) return callback(err);
        test.ok(FS.existsSync('a'));
        test.ok(FS.statSync('a').isFile());
        FS.unlinkSync('a');
        callback();
      });
    },
    function(callback) {
      jsondir.json2dir({
        "-path": 'test/output',
        "a": {
          "a1": {},
          "a2": {
            "a21": {}
          }
        },
        "b": {},
        "c": {
          "c1": {}
        }
      }, function(err) {
        if (err) return callback(err);
        test.ok(FS.existsSync('test/output/a'));
        test.ok(FS.statSync('test/output/a').isDirectory());
        test.ok(FS.existsSync('test/output/b'));
        test.ok(FS.statSync('test/output/b').isFile());
        test.ok(FS.existsSync('test/output/c'));
        test.ok(FS.statSync('test/output/c').isDirectory());
        test.ok(FS.existsSync('test/output/a/a1'));
        test.ok(FS.statSync('test/output/a/a1').isFile());
        test.ok(FS.existsSync('test/output/a/a2'));
        test.ok(FS.statSync('test/output/a/a2').isDirectory());
        test.ok(FS.existsSync('test/output/a/a2/a21'));
        test.ok(FS.statSync('test/output/a/a2/a21').isFile());
        test.ok(FS.existsSync('test/output/c/c1'));
        test.ok(FS.statSync('test/output/c/c1').isFile());
        FS.unlinkSync('test/output/a/a2/a21');
        FS.rmdirSync('test/output/a/a2');
        FS.unlinkSync('test/output/a/a1');
        FS.rmdirSync('test/output/a');
        FS.unlinkSync('test/output/b');
        FS.unlinkSync('test/output/c/c1');
        FS.rmdirSync('test/output/c');
        FS.rmdirSync('test/output');
        callback();
      });
    },
    function(callback) {
      jsondir.json2dir({
        "-path": 'test/output',
        "a": {
          "-type": 'z'
        }
      }, function(err) {
        if (err instanceof File.UnknownFileTypeException) {
          test.ok(true);
          FS.rmdirSync('test/output');
          return callback();
        }

        return callback(err);
      });
    },
    function(callback) {
      jsondir.json2dir({
        "-path": 'test/output',
        "a": {
          "-type": 'l'
        }
      }, function(err) {
        if (err instanceof File.MissingRequiredParameterException) {
          test.ok(true);
          FS.rmdirSync('test/output');
          return callback();
        }

        return callback(err);
      });
    },
    function(callback) {
      jsondir.json2dir({
        "-path": 'test/output',
        "a": {
          "-type": 'd',
          "-mode": 511
        },
        "b": {
          "-type": 'l',
          "-dest": 'a'
        },
        "c": {
          "-type": '-',
          "-content": 'something something something dark side',
          "-mode": 'rw-rw-rw-'
        },
        "d": {
          "-type": 'd',
          "-umask": 146
        },
        "e": {
          "-type": 'f',
          "-umask": 146
        }
      }, function(err) {
        if (err) return callback(err);
        var faStats = FS.statSync('test/output/a');
        var fbStats = FS.statSync('test/output/b');
        var fblStats = FS.lstatSync('test/output/b');
        var fcStats = FS.statSync('test/output/c');
        var fdStats = FS.statSync('test/output/d');
        var feStats = FS.statSync('test/output/e');
        test.ok(faStats.isDirectory());
        test.ok((faStats.mode & 0777) === 0777);
        test.ok(fbStats.isDirectory());
        test.ok(fblStats.isSymbolicLink());
        test.ok(fcStats.isFile());
        test.ok(FS.readFileSync('test/output/c', { encoding: 'utf8' }) === 'something something something dark side');
        test.ok((fcStats.mode & 0777) === 0666);
        test.ok(fdStats.isDirectory());
        test.ok((fdStats.mode & 0777) === 0555);
        test.ok(feStats.isFile());
        test.ok((feStats.mode & 0777) === 0444);
        FS.unlinkSync('test/output/e');
        FS.rmdirSync('test/output/d');
        FS.unlinkSync('test/output/c');
        FS.unlinkSync('test/output/b');
        FS.rmdirSync('test/output/a');
        FS.rmdirSync('test/output');
        callback();
      });
    },
    function(callback) {
      jsondir.json2dir({
        "-path": 'test/output',
        "-inherit": 'mode',
        "-mode": 511,
        "a": {
          "a1": {
            "a11": {}
          }
        },
        "b": {}
      }, function(err) {
        if (err) return callback(err);
        test.ok((FS.statSync('test/output').mode & 0777) === 0777);
        test.ok((FS.statSync('test/output/a').mode & 0777) === 0777);
        test.ok((FS.statSync('test/output/b').mode & 0777) === 0777);
        test.ok((FS.statSync('test/output/a/a1').mode & 0777) === 0777);
        test.ok((FS.statSync('test/output/a/a1/a11').mode & 0777) === 0777);
        FS.unlinkSync('test/output/a/a1/a11');
        FS.rmdirSync('test/output/a/a1');
        FS.rmdirSync('test/output/a');
        FS.unlinkSync('test/output/b');
        FS.rmdirSync('test/output');
        callback();
      });
    }
    // This test doesn't work because owner/group attribute setting requires
    // super user, and grunt/nodeunit do something weird with that.
    //
    // function(callback) {
    //   jsondir.json2dir({
    //     "-path": 'test/output',
    //     "-inherit": ['owner', 'group'],
    //     "-owner": 'dwieeb',
    //     "-group": 'staff',
    //     "a": {
    //       "a1": {
    //         "a11": {}
    //       }
    //     },
    //     "b": {}
    //   }, function(err) {
    //     if (err) return callback(err);
    //     uidNumber('dwieeb', 'staff', function(uid, gid) {
    //       var outputStats = FS.statSync('test/output');
    //       var faStats = FS.statSync('test/output/a');
    //       var fbStats = FS.statSync('test/output/b');
    //       var fa1Stats = FS.statSync('test/output/a/a1');
    //       var fa11Stats = FS.statSync('test/output/a/a1/a11');
    //       test.ok(outputStats.uid === uid);
    //       test.ok(outputStats.gid === gid);
    //       test.ok(faStats.uid === uid);
    //       test.ok(faStats.gid === gid);
    //       test.ok(fbStats.uid === uid);
    //       test.ok(fbStats.gid === gid);
    //       test.ok(fa1Stats.uid === uid);
    //       test.ok(fa1Stats.gid === gid);
    //       test.ok(fa11Stats.uid === uid);
    //       test.ok(fa11Stats.gid === gid);
    //       callback();
    //     });
    //   });
    // }
  ], function(err) {
    if (err) throw err;
    test.done();
  });
};