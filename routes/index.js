
/*
 * GET home page.
 */
var cookieParser = require('cookie-parser');
var theUser;
var theUserID;
var theWord;


// Just grabs a random word from the wordlist.
function getNewWord(req,res){
	var randomWordIndex = Math.floor(Math.random() * req.app.locals.wordList.length);
	return req.app.locals.wordList[randomWordIndex];
}

// Initializes a new user, sets the cookie on the client side.
function setupNewHangmanGame(req,res) {
	theUser = {
			'wins': 0,
			'loses': 0,
			'word' : getNewWord(req,res),
			'letters':[]};
	theUserID = req.app.locals.hangmanUsers.length;
	res.cookie('hangmanID',theUserID);
	req.app.locals.hangmanUsers.push(theUser);
}

// Grabs the existing user data using the cookie which was set.
function getExistingHangmanGame(req,res){
	theUserID = req.cookies.hangmanID;
	theUser = req.app.locals.hangmanUsers[theUserID];
}

// calculate the number of incorrectly guessed letters.
// we want to store as little
// data on the server as possible.
function getNumWrong(word,letters){
	var wordArray = word.split('').sort();
	var numWrong = 0;
	for (var i = 0; i < letters.length; i++) {
		if ( wordArray.indexOf(letters[i]) === -1) {
			numWrong++;
		}
	}
	return numWrong;
}

// outputs the word in " _ _ a _ " format.
// this is all the client gets to see, to prevent cheating.
function displayWord(word,letters){
	var dWord = '';
	for(var i=0; i< word.length; i++){
		if (letters.indexOf(word[i]) === -1) {
			dWord = dWord + ' _ ';
		} else {
			dWord = dWord + ' ' + word[i] + ' ';
		}
	}
	return dWord;
}

// This is where the page creation process happens.
// The page is rendered using jade, which is great for
// this sort of thing.
exports.index = function(req, res){
	if(req.cookies.hangmanID !== undefined) {
		getExistingHangmanGame(req,res);
	} else {
		setupNewHangmanGame(req,res);
	}
	var dWord = displayWord(theUser.word,theUser.letters);
	var numWrong = getNumWrong(theUser.word,theUser.letters);
	var restart = 0;
	if (dWord.indexOf('_') === -1) { // If user wins
		restart = 1;
		theUser.wins++;
		theUser.word = getNewWord(req,res);
		theUser.letters = [];
		dWord = displayWord(theUser.word,theUser.letters);
		numWrong = 0;
	} else if (numWrong === 10) { // If user loses
		restart = 1;
		theUser.word = getNewWord(req,res);
		theUser.letters = [];
		theUser.loses++;
		dWord = displayWord(theUser.word,theUser.letters);
		numWrong = 0;
	}
	// Send the data to jade for rendering.
    res.render('index',{
    	wins: theUser.wins,
    	loses: theUser.loses,
    	numberWrong:numWrong,
    	letters:theUser.letters,
    	userID:theUserID,
    	newGame:restart,
    	word:dWord});
};