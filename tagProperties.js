var db = require('mongojs').connect('test', ['rightMoveProps']);
var async = require('async');

var tags = [{
  label: 'needsWork',
  spec: {
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
    }, {
      summary: {
        $regex: '.*modernization.*',
        $options: 'i'
      }
    }, {
      summary: {
        $regex: '.*updating.*',
        $options: 'i'
      }
    }, {
      summary: {
        $regex: '.*own stamp.*',
        $options: 'i'
      }
    }, {
      $and: [{
        summary: {
          $regex: '.*requires.*',
          $options: 'i'
        }
      }, {
        summary: {
          $regex: '.*improvement.*',
          $options: 'i'
        }
      }]
    }]
  }
}, {
  label: 'newBuild',
  spec: {
    $or: [{
      summary: {
        $regex: '.*new build.*',
        $options: 'i'
      }
    }, {
      summary: {
        $regex: '.*recent build.*',
        $options: 'i'
      }
    }, {
      summary: {
        $regex: '.*launching soon.*',
        $options: 'i'
      }
    }, {
      summary: {
        $regex: '.*show home.*',
        $options: 'i'
      }
    }, {
      summary: {
        $regex: '.*new home.*',
        $options: 'i'
      }
    }]
  }
}, {
  label: 'swimmingPool',
  spec: {
    $or: [{
      summary: {
        $regex: '.*swimming pool.*',
        $options: 'i'
      }
    }, {
      summary: {
        $regex: '.*swimming.*',
        $options: 'i'
      }
    }, {
      summary: {
        $regex: '.*pool.*',
        $options: 'i'
      }
    }, {
      summary: {
        $regex: '.*swimmingpool.*',
        $options: 'i'
      }
    }]
  }
}];



tags.forEach(function(tag) {
  db.rightMoveProps.update(tag.spec, {
    $addToSet: {
      tags: tag.label
    }
  }, {
    multi: true
  }, function(err, docs) {
    console.log('Done', docs)
  });
});


/*db.rightMoveProps.find({}).forEach(
  function(err, property) {
    if (!property) return;
    async.map(tags, function(value, handler) {
      value.spec.identifier = property.identifier;
      db.rightMoveProps.find(value.spec, function(err, docs) {
        if(docs.length) console.log(value.spec.identifier, value.label)
        handler(docs.length ? value.label : false);
      });
    }, function(err, value) {
      value = value.filter(function(a) {
        return a
      });
      db.rightMoveProps.update({
        identifier: property.identifier
      }, {
        $set: {
          tags: value
        }
      });
    });
  });
*/
