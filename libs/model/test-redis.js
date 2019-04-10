var redisClient = require('../redis/Redis');
var rClient = redisClient.connect();
var Messages = require('../redis/Messages')(rClient);

Messages.firstLoad('18_21', function() {});