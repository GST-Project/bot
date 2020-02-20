const TelegramBot = require('node-telegram-bot-api');

var dataAccess = require("./data_access");
console.log('bot server started...');

// replace the value below with the Telegram token you receive from @BotFather
const token = '959074816:AAExWii_ghbnQ_FmSsVn1jFtBbOf7XYlfgU';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

var msg_count = 0;
var skills = '';


// Matches "/echo [whatever]
bot.onText(/\/speakers (.+)/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  const chatId = msg.chat.id;
  const resp = match[1]; // the captured "whatever"

	
	if (resp){
		//Data Access object calls our backend database searching for users and other data
		dataAccess.searchUser(resp, function dataDone(data){
			// this is the reponse send back to bot app
			bot.sendMessage(chatId, data);	
		}); 
		
	} else {
		//bot.sendMessage(chatId, "Sorry I couldn't find anything! Try again by typing the country name");
	}

});

// Listen for any kind of message. There are different kinds of
// messages. This is where the bot initially gets called and the main function starts here
bot.on('message', (msg) => {
	const chatId = msg.chat.id;
	console.log(msg_count);
	console.log(msg);
	// this is the start function and the bot starts here!
	if (msg.text.toString().toLowerCase() == "/start"){
		console.log("execute operation "+msg_count );		
		msg_count = msg.message_id;
		bot.sendMessage(chatId, "hey "+msg.chat.first_name+"! Great to have you here. What's your email address?");	
	} else {
		//Email search funtion and this is the second response from the bot
		if (msg.message_id == msg_count + 2){
			if (validateEmail(msg.text.toString())){
				dataAccess.searchByEmail(msg.text.toString(), function dataDone(data){
                        		bot.sendMessage(chatId, data.crawl_data+"\nNow, can you tell me some of the skills you have?");	
					//bot.sendMessage(chatId, "Now, can you tell me some of the skills you have?");
					console.log("email search");
				});
			} else {// in case no email found the bot responds the followinfg
				msg_count = msg.message_id;
				bot.sendMessage(chatId, "Sorry, I something is wrong with the email, can you try again?");
			}
		}
		//Skills Function and the 3rd response from the bot!
		if (msg.message_id == msg_count + 4){
			console.log("insert skills");
			skills = msg.text.toString().toLowerCase();	
			bot.sendMessage(chatId, "Now, can you tell where are you located?");
                }
		//Location Function and the 4rd response from the bot!
                if (msg.message_id == msg_count + 6){
			console.log("insert Location");
                	bot.sendMessage(msg.chat.id, "Please tell me what would you like to do from the 2 options", {
"reply_markup": {// Here 2 options are presented to the user for input to either "Join" or "Start" a project!
    "keyboard": [ ["Join a project"], ["Start a project"]]
    }
});	
		}

		// Join a project selection was made by the user
		if (msg.text.toString().toLowerCase() == "join a project"){
			//search on out backend for all the projects we have. Right now we are retrieving all projects but we will
			//need to search projects by location and/or region once we have more of them
			dataAccess.matchProject(skills, function dataDone(data){
                		bot.sendMessage(chatId, "I found "+data.length+" that matched your criteria:");
				for (var i = 0; i < data.length;i++){
					bot.sendMessage(chatId, "\nProject name: "+data[i].name+"\n\nThey Need "+data[i].need+"\n\n"+data[i].description+"\n\n"+"location "+data[i].location+"\n"+data[i].url+"\nProject Number:"+data[i].project_number);
				}
				//Tells the user what to do after the list of projects has been displayed in the bot app!
				if (data.length > 0){
					bot.sendMessage(chatId,"Great!", {"reply_markup":{"remove_keyboard": true}});
					bot.sendMessage(chatId,"\n Now, can you please tell me which project you will like to join? Just give us their project number: \n XX,YZ");
				}
                        });	
		}
		// Start a project was selected by the user
		if (msg.text.toString().toLowerCase() == "start a project"){
			// TODO: Function here to add a project to our database

                }
	
		//Add me to project was selected by the user. The user has selected a specific project number and he/she needs to be added
		//to our database backend!
		if (msg.message_id == msg_count + 14){
			//TODO: function to add user to a specific project!
			 bot.sendMessage(chatId,"Great!, I will notify the project owners and they will reply back to you!");
			console.log("JOIN PROJECT")
		}		
		
	}
		
  	// send a message to the chat acknowledging receipt of their message
  	//bot.sendMessage(chatId, "Hello "+msg.chat.first_name+" "+', welcome to our GST community. Here I can help you connect with the right people and work on projects!');
});

//Function to validate email format!
function validateEmail(email) 
{
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
}


