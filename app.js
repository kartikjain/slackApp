var express = require('express');
var bodyParser = require('body-parser');
var app = express();
require('dotenv').config();  //read environment variables from .env file

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.all('*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, Authorization, Content-Type');
  next();
});

var toDoList = {};   //master to do list

app.post('/addtodo',function(req,res){
	console.log("hit /addtodo")
	var text = req.body.text;
	var token = req.body.token;
	var channelId = req.body.channel_id;
	if(token !== process.env.SLACK_VERIFICATION_TOKEN) {
	    // the request is NOT coming from Slack!
	    return;
	}
	if (text && text != "") {
		if(!toDoList[channelId]){
			toDoList[channelId] = [];
		}
		toDoList[channelId].push(text);
		var data = {
		  response_type: 'in_channel', // public to the channle
		  text: "Status ",
		  attachments:[
		  {
		    text: "Added TODO For "+text
		  }
		]};
		res.json(data);
	} else {
	var data = {
	  response_type: 'ephemeral', // private message
	  text: 'How to use /addtodo command:',
	  attachments:[
		  {
			text: 'Type a List entry after the command, e.g. `/addtodo Buy house`',
		  }
	  ]
	};
	res.json(data);
   }
})

app.post('/listtodo',function(req,res){
	console.log("hit /listtodos")
	var token = req.body.token;
	var channelId = req.body.channel_id;
	if(token !== process.env.SLACK_VERIFICATION_TOKEN) {
	    // the request is NOT coming from Slack!
	    return;
	}
	var stringifiedList = "No TODOs";
	if(toDoList[channelId] && toDoList[channelId].length > 0){
		stringifiedList = toDoList[channelId].join(',');
	}
	var data = {
	  response_type: 'in_channel', // public to the channle
	  text: "To Do List for this channel: ",
	  attachments:[
	  {
	    text: stringifiedList
	  }
	]};
	res.json(data);

})

app.post('/listreset',function(req,res){
	console.log('/listreset')
	var token = req.body.token;
	var channelId = req.body.channel_id;
	if(token !== process.env.SLACK_VERIFICATION_TOKEN) {
	    // the request is NOT coming from Slack!
	    return;
	}
	toDoList[channelId] = [];
	var data = {
	  response_type: 'in_channel', // public to the channel
	  text: "Status: ",
	  attachments:[
	  {
	    text: "To Do List for this channel Reset "
	  }
	]};
	res.json(data);
})

app.post('/marktodo',function(req,res){
	console.log('/listreset')
	var text = req.body.text;
	var token = req.body.token;
	var channelId = req.body.channel_id;
	if(token !== process.env.SLACK_VERIFICATION_TOKEN) {
	    // the request is NOT coming from Slack!
	    return;
	}
	if (text && text != "") {
		for(var i=0;i<toDoList[channelId].length;i++){
			if(toDoList[channelId][i] === text){
				toDoList[channelId].splice(i,1);
				break;
			}
		}
		var data = {
		  response_type: 'in_channel', // public to the channle
		  text: "Status ",
		  attachments:[
		  {
		    text: "Removed TODO For "+text
		  }
		]};
		res.json(data);
	} else {
		var data = {
		  response_type: 'ephemeral', // private message
		  text: 'How to use /marktodo command:',
		  attachments:[
			  {
				text: 'Type a List entry after the command, e.g. `/marktodo Buy house`',
			  }
		  ]
		};
		res.json(data);
   }
})

var server = app.listen(process.env.PORT || 3000, () => {
  console.log('Express server listening on port %d ', server.address().port);
});