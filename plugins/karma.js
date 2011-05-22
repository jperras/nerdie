var nerdie = null
  , alfred = require('alfred')
  , namespace = 'karma'
  , exports = [];

var init = function (parentNerdie) {
	nerdie = parentNerdie;
};

var DB_PATH = __dirname + '/../data/karma.db';

/* !karma <username> */
exports.push({
	init: init,
	pattern: function() { return nerdie.anchoredPattern('karma', true); },
	handler: function(msg) {

		alfred.open(DB_PATH, function(err, db) {
			if (err) { throw err; }

			var Karma = db.define('Karma');
			Karma.property('name', 'string', {maxlength: 24});
			Karma.property('score', Number);

			//Karma.find({name: {$eq: msg.match_data[2]}}) (function(err, key, value) {
				//console.log('processing find query...');
				//if (err) {
					//msg.say(msg.user + ' is karmaless!');
				//}
				//console.log(err);
			//});
		});
	}
});

/* <username>++ || <username>-- */
exports.push({
	init: init,
	pattern: /(.+)[\+\-]{2}$/i,
	handler: function(msg) {
		var target = msg.match_data[1];
		var Karma = null;

		alfred.open(DB_PATH, function(err, db) {
			if (err) { throw err; }

			try {
				Karma = db.define('Karma');
				Karma.property('name', 'string', {maxlength: 24});
				Karma.property('score', Number);
				Karma.index('name', function(data) {
					return data.name;
				});
			} catch (e) {
				// Do nothing - db already defined.
				// @TODO: Fix this dumbness when emitter design is complete.
			}

			try {
				Karma.find({'name': {$eq: target}}).all(function(results) {
					if (results.length === 0) {
						var data = {name: target, score: 1};
						var k = Karma.new(data);

						k.save(function(errors) {
							if (errors) {
								msg.say('Could not save karma for ' + target);
								console.log(errors);
							}
							console.log('Karma updated for '+ target +'.');
						});
					}
					if (err) {
						msg.say('There was an error reading ' + msg.user + '\'s karma.');
					}
				});
			} catch (e) {
				console.log(e);
				console.log('An error ocurred.');
			}
		});
	}
});

module.exports = exports;
