var app = require('express')();
var db = require('mongojs').connect('test', ['outcodes', 'rightMoveProps', 'priceBands']);
var Load = require('ractive-load');
var moment = require('moment');
var async = require('async');


app.use(require('express').static(process.cwd() + '/public'));

app.get('/', function(req, res) {
  Load('views/index.html').then(function(Component) {
    db.outcodes.find({}, function(err, outcodes) {
      async.map(outcodes, function(outcode, cb) {
        db.rightMoveProps.find({
          outcode: outcode.outcode,
          $or: [{
            summary: {
              $regex: '.*needs work.*',
              $options: 'i'
            }
          }, {
            summary: {
              $regex: '.*in need of.*',
              $options: 'i'
            }
          }]
        }, function(err, properties) {
          console.log(properties)
          db.priceBands.find({
            outcode: outcode.outcode
          }).sort({
            band: 1
          }, function(err, bands) {
            cb(null, {
              outcode: outcode.outcode,
              ranges: bands,
              properties: []
            });
          });
        });
      }, function(err, data) {
        var ractive = new Component({
          data: {
            outcodes: data
          }
        });

        res.send(ractive.toHTML());
      });
    });
  }).catch(function(a, b) {
    console.log(a, b)
  });
});

app.listen(1337);
