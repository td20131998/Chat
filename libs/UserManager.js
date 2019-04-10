module.exports = (function () {
    var chatroomManager = null;
    // mapping of all available chatrooms
    const UserList = new Map();
    const Users = new Map();
    const UsersRoom = new Map();
    //users[userNickname][socket.id] = socket;

    var addClient = function(userID,client,dataUsers) {
        if(!Users.has(userID)) Users.set(userID,{});

        let data = Users.get(userID);
        data[client.id] = client;


        //join to exist room
        if(UsersRoom.has(userID)){
            let rooms = UsersRoom.get(userID);
            for(let key in rooms){
                client.join(key);
            }
        }

        emitOnline(userID,dataUsers);


    };

    var emitOnline = function (userID,dataUsers) {
        //send online status;
        var currentUser = dataUsers.get(userID);
        for(var i=0;i<currentUser.clients.length;i++){
            let friend_id = currentUser.clients[i].User_ID;
            if(Users.has(friend_id)){
                let clients = Users.get(friend_id);
                socket_ids = Object.keys(clients);
                for(var j=0;j<socket_ids.length;j++){
                    let data = {User_ID:userID,Room_Name:currentUser.clients[i].Room_Name};
                    let socket = clients[socket_ids[j]];
                    clients[socket_ids[j]].emit('online',data)
                }
            }
        }
    }

    var emitOffline = function (userID,dataUsers) {
        //send online status;
        var currentUser = dataUsers.get(userID);
        for(var i=0;i<currentUser.clients.length;i++){
            let friend_id = currentUser.clients[i].User_ID;
            if(Users.has(friend_id)){
                let clients = Users.get(friend_id);
                socket_ids = Object.keys(clients);
                for(var j=0;j<socket_ids.length;j++){
                    let data = {User_ID:userID,Room_Name:currentUser.clients[i].Room_Name};
                    let socket = clients[socket_ids[j]];
                    clients[socket_ids[j]].emit('offline',data)
                }
            }
        }
    }
        

    var joinRoom = function (userID,receiverID) {
        let roomName = chatroomManager.renderRoomName(userID,receiverID);
        if(Users.get(userID)){
            let Clients = Users.get(userID);
            for(var client_id in Clients){
                let client = Clients[client_id];
                client.join(roomName);
                if(!UsersRoom.has(client.userID)) UsersRoom.set(client.userID,{});
                var rooms = UsersRoom.get(client.userID);
                rooms[roomName]=roomName;
                let Chatroom = chatroomManager.switchToChatRoomByName(roomName);
                if(Chatroom){
                    Chatroom.getChatHistory(function (histories) {
                        for(var i =0;i<histories.length;i++){
                            histories[i]=JSON.parse(histories[i])[0];
                        }
                        let message = {message:'Join room', sender:userID,receive:receiverID,room_name:roomName,histories: histories};
                        client.emit('message',message)
                    })

                }

            }
        }
        if(Users.get(receiverID)){
            let Clients = Users.get(receiverID);
            for(var client_id in Clients){
                let client = Clients[client_id];
                client.join(roomName);
                if(!UsersRoom.has(client.userID)) UsersRoom.set(client.userID,{});
                var rooms = UsersRoom.get(client.userID);
                rooms[roomName]=roomName;
            }
        }
    }

    return {
        addClient:addClient,
        joinRoom:joinRoom,
        setChatroomManager:function (m) {
            chatroomManager = m;
        },
        getUsers:function () {
            return Users;
        },
        removeUserOnline:function (User_ID,Socket_ID) {
            if(Users.has(User_ID)){
                var sockets = Users.get(User_ID);
                if(sockets[Socket_ID]) delete sockets[Socket_ID];
            }
        },
        isUserOnline:function (User_ID,Socket_ID) {
            if(Users.has(User_ID)){
                var sockets = Users.get(User_ID);
                if(Object.keys(sockets).length>0) return true;
            }
            return false;
        },
        emitOffline:emitOffline
    }
})();