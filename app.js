var app = require('express')();
var db = require('mongojs').connect(require('../dbPath.json').url, ['outcodes', 'rightmoveProps']);
var Load = require('ractive-load');
var moment = require('moment');
var async = require('async');

app.use(require('express').static(process.cwd() + '/public'));
app.use(require('body-parser').urlencoded({
  extended: false
}));

app.get('/', function(req, res) {
  Load('views/index.html').then(function(Component) {
    db.outcodes.find({}, function(err, outcodes) {
      var outs = {};
      outcodes.forEach(function(value){
        outs[value.outcode] = value;
      });
      db.rightMoveProps.aggregate([{$group:{_id:'$outcode', count:{$sum:1}}}], function(err, counts){
        counts.forEach(function(count){
          outs[count._id] && (outs[count._id].count = count.count);
        });
        var ractive = new Component({
          data: {
            outcodes: Object.keys(outs).map(function(key){return outs[key]})
          }
        });
        res.send(ractive.toHTML());
      });
    });
  }).catch(function(a, b) {
    console.log(a, b)
  });
});

app.get('/properties/:area/:range/:category', function(req, res) {
  db.outcodes.findOne({
    outcode: req.params.area
  }, function(err, outcode) {
    var band = outcode.bands[req.params.range]||{};
    console.log(band)
    db.rightMoveProps.find({
      outcode: req.params.area,
      price: {
        $gte: band.min||0,
        $lte: band.max||Infinity
      },
      tags: req.params.category=='unclassified'?null:req.params.category
    }, function(err, docs) {
      res.send(docs);
    })
  });
});

app.listen(1337);
