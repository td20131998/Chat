module.exports={
    connect: function () {
        //test redis cache server
        var redis = require('redis');
        var client = redis.createClient(6379, '127.0.0.1');
        client.on('connect', function() {
            console.log('Redis client connected');
        });

        client.on('error', function (err) {
            console.log('Something went wrong ' + err);
        });

        return client;
    }
}