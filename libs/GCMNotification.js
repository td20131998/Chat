
var gcm = require('node-gcm');
var config = require('../config/configuration');

var GCMNotification =function(){

}
GCMNotification.prototype ={
    send:function (title,body,recipient,callback) {
        var sender = new gcm.Sender(config.GCM_API_KEY);
        var message = new gcm.Message();
        message.addNotification({
            title: title,
            body: body,
            icon: 'ic_launcher'
        });
        message.delay_while_idle = 1;
        sender.send(message, recipient, 4, function (err, result) {
            callback(err, result);
        });
    }
}
//EupDateTime
module.exports = GCMNotification;