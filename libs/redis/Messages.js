module.exports= function (redisCLient) {
    return {
        add: function (key,message,callback) {
            redisCLient.incr('message_id',function (err,message_id) {
                message.id = message_id;
                redisCLient.rpush(key,JSON.stringify(message), function(err, result) {
                    callback(err,result);
                })
            })
        } ,

        getAll: function (key,callback) {
            redisCLient.lrange(key, 0, -1, function(err, reply) {
                callback(err,reply)
            });
        }
    };
};