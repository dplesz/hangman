
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , cookieParser = require('cookie-parser')
  , bodyParser = require('body-parser')
  , fs = require ('fs')
  , path = require('path');



var app = express();

// In a real world example this would be set up as a database
// but a simple array should suffice for our needs.
app.locals.hangmanUsers = [];

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.methodOverride());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

app.get('/',routes.index);

app.post('/',function(req,res,next) {
	var userID = req.body.userID;
	var theLetter = req.body.letter.toString().toLowerCase();
	var regexp = /^[a-z]$/;
	// Don't let the user input a non-letter. No punctuation allowed.
	// Don't let the user guess the same letter twice
	if ((theLetter.match(regexp)) &&
		(app.locals.hangmanUsers[userID].letters.indexOf(theLetter) === -1)){
		app.locals.hangmanUsers[userID].letters.push(theLetter);
	}
	// Once the letter array has been updated (or not) refresh the page.
	res.end(res.redirect(req.get('referer')));
});


// here we attempt to load the wordlist and if we succeed then we start the server.
function initGame(){
	try{
		app.locals.wordList = fs.readFileSync('wordlist.txt','utf8','r').split('\r\n');
		console.log('Wordlist loaded');
		http.createServer(app).listen(app.get('port'), function(){
			console.log('Express server listening on port ' + app.get('port'));
        });
	} catch (err) {
		console.log('Wordlist not found');
	}
}

initGame();

