const Chatroom = require('./Chatroom')

module.exports = function (dataUsers) {
    // mapping of all available chatrooms
    const chatRooms = new Map();

    function renderRoomName(senderID,receiveID) {
        return [senderID,receiveID].sort().join('_');
    }

    function createChatRoom(senderID,receiveID) {
        let roomName = renderRoomName(senderID,receiveID);
        if(!chatRooms.has(roomName)){
            chatRooms.set( roomName ,Chatroom(roomName,'',dataUsers));
        }
    }

    function switchToChatRoom (senderID,receiveID) {
        let roomName = renderRoomName(senderID,receiveID);
        return chatRooms.get(roomName);
    }
    function switchToChatRoomByName (roomName) {
        return chatRooms.get(roomName);
    }
    return {
        createChatRoom:createChatRoom,
        switchToChatRoom:switchToChatRoom,
        switchToChatRoomByName:switchToChatRoomByName,
        renderRoomName:renderRoomName,
        get: function () {
            return chatRooms
        }
    }
};