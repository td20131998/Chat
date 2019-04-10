
var redisClient = require('../libs/redis/Redis');
var rClient = redisClient.connect();
var Messages = require('../libs/redis/Messages-dev')(rClient);
var gCMNotification = require('./GCMNotification');

module.exports = function (room_name,room_image,dataUsers) {
    console.log(room_name);
    const roomName =room_name;
    const roomImage =room_image;
    const members = new Map()
    var chatHistory = []

    function broadcastMessage(User_ID,message,io) {
        io.sockets.in(roomName).emit('message',message);

        addEntry([message]);


        //send message notification for app
        var userIDS=roomName.split('_');

        let recipient_ids =[];
        for(var i =0;i<userIDS.length;i++){
            if(userIDS[i] != User_ID){
                recipient_ids.push(userIDS[i]);
            }
        }

        let gcm_ids = [];
        for(var i=0;i<recipient_ids.length;i++){
            if(dataUsers.has(recipient_ids[i])){
                let usr = dataUsers.get(recipient_ids[i]);
                if(usr.Device_Type === 'android'){
                    gcm_ids.push(usr.Device_Id);
                }
            }
        }
        if(gcm_ids.length>0){
            let gcm = new gCMNotification();
            gcm.send('New message',message.message,gcm_ids,function (error,result) {
                var x= result;
            })
        }
    }

    function addEntry(entry) {
        chatHistory = chatHistory.concat(entry);
        Messages.add(roomName,entry,function () {});
    }

    function getChatHistory(callback) {
        Messages.getAll(roomName,function (err,items) {
            callback(items)
        });
        return chatHistory.slice();
    }

    function addUser(client) {
        members.set(client.id, client)
    }

    function removeUser(client) {
        members.delete(client.id)
    }

    function serialize() {
        return {
            room_name,
            image,
            numMembers: members.size
        }
    }

    return {
        broadcastMessage,
        addEntry,
        getChatHistory,
        addUser,
        removeUser,
        serialize
    }
}