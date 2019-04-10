const express = require('express'),
    http = require('http'),
    app = express(),
    server = http.createServer(app),
    io = require('socket.io').listen(server);
var logger = require('morgan');

//set Root directory
global.ROOT_DIR = __dirname;


const fileUpload = require('express-fileupload');
// default options
app.use(fileUpload());
app.use(logger('dev'));

const dataUsers =new Map();

var  language = require('./libs/Language');
global.language = language;

var  striptags = require('striptags');
var config = require('./config/configuration');
var chatroomManager = require('./libs/ChatroomManager')(dataUsers);
// console.log("chatroomManager: " + chatroomManager);
var usersManager = require('./libs/UserManager');
usersManager.setChatroomManager(chatroomManager);
var tokens = {};
const sql = require('mssql');
// console.log("dataUsers: " + dataUsers);
require('./routes/routes.js')(app,dataUsers,usersManager,tokens,__dirname);

var moment = require('moment');
var EupDateTime = require('./libs/EupDateTime');

// usernames which are currently connected to the chat
const usernames = {};

// rooms which are currently available in chat
const rooms = {};

io.use(function(socket, next){
    /*console.log('token');
    console.log(socket.handshake.query);

    console.log('token');*/
    if (socket.handshake.query && socket.handshake.query.token){
        if(tokens.hasOwnProperty(socket.handshake.query.token)){
            next();
        }else{
            next(new Error('Authentication error'));
        }
    } else {
        next(new Error('Authentication error'));
    }
}).on('connection', (socket) => {

    socket.on('join', function(User_ID) {
        usernames[User_ID] = User_ID;
        socket.userID = User_ID;

        usersManager.addClient(User_ID,socket,dataUsers);

        socket.emit('joined','you are connected',)


    });

    socket.on('messagedetection', (User_ID,receiverNickName,roomName,messageContent) => {

        messageContent =striptags(messageContent,['img','a']);
        let currentTimestamp =  moment().valueOf();
        let message = {message:messageContent, sender:User_ID,receive:receiverNickName,room_name:roomName,time: currentTimestamp};

        //Chatroom manager to switch room and send message
        chatroomManager.switchToChatRoom(User_ID,receiverNickName).broadcastMessage(User_ID,message,io);
    });

    socket.on('disconnect', function() {
        console.log('disconnect:'+socket.userID )

        //tell to system users is offline;
        usersManager.removeUserOnline(socket.userID,socket.id);

        //if user offline then tell to client
        if(!usersManager.isUserOnline(socket.userID)){
            usersManager.emitOffline(socket.userID,dataUsers);
        }

    });
    socket.on('createroom',function (data) {
        chatroomManager.createChatRoom(data.sender,data.receive);
        usersManager.joinRoom(data.sender,data.receive);

    })
});


server.listen(3000,()=>{
    console.log('Node app is running on port 3000');
});
