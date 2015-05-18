var db = require('mongojs').connect('wigwamm', ['rightmoveCodes', 'landReg', 'priceBands', 'outcodes']);
var async = require('async');


var step = function(array, handler, done) {
  var position = 0;
  var next = function() {
    if (position < array.length)
      handler(array[++position], next);
    else
      done();
  };
  next();
}


db.rightmoveCodes.distinct('outcode', function(err, outcodes) {
  step(outcodes, function(outcode, handler) {
    db.landReg.find({
      postCode: {
        $regex: '.*' + outcode + '.*',
        $options: 'i'
      }
    }).sort({
      price: 1
    }, function(err, docs) {
      if (docs.length)
        db.outcodes.update({
          outcode: outcode
        }, {
          outcode: outcode,
          bands: Array(4).join(',').split(',').map(function(val, index) {
            return {
              min: index == 0 ? 0 : (docs[Math.floor(index * (docs.length / 4))] || {}).price,
              max: index == 4 ? Infinity : (docs[(Math.floor((index + 1) * (docs.length / 4)))] || {}).price
            };
          })
        }, {
          upsert: true
        }, function() {
          handler();
          console.log(outcode);
        });
      else
        handler();
    });
  }, function() {
    console.log('Done');
  });
});
