const express = require('express');
var fs = require('fs');
var bodyParser     = require("body-parser");
var ejs = require('ejs');
var config = require('../config/configuration');
var modelUser = require('../libs/model/ModelUser');
var  language = require('../libs/Language');
const uuidv4 = require('uuid/v4');
var crypto= require('crypto');
const sql = require('mssql');
var moment = require('moment');
const isImage = require('is-image');
var uploadRouter = require("./upload");

const { check, validationResult } = require('express-validator/check');

module.exports = function(app,dataUsers,usersManager,tokens,ROOT_DIR) {


// set the view engine to ejs
    app.set('view engine', 'ejs');

    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());

    app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });

    app.use('/public', express.static('public'));

    app.get('/', (req, res) => {
        res.send('Chat Server is running on port 3000')
    });
    app.get('/js/client.js', (req, res) => {
        let fnCallback= req.query.callback;
        let langCode ='';
        if (req.query && req.query.lang){
            langCode= req.query.lang;
        }
        var file = "";
        file = ROOT_DIR + '/views/js/client.js';

        fs.readFile(file,'utf-8', function(err, data) {
            if (err) {
                res.writeHead(404);
                return res.end('Page or file not found');
            }
            var f = ejs.compile(data);
            var fileContent = f({hostname: config.hostname,fnCallback: fnCallback,langCode:langCode});
            res.setHeader('Content-Type', 'application/javascript');
            res.setHeader('Content-Length', fileContent.length);
            res.send(fileContent);
        });
    });

    app.get('/js/administrator.js', (req, res) => {
        let fnCallback= req.query.callback;
        let langCode ='';
        if (req.query && req.query.lang){
            langCode= req.query.lang;
        }
        var file = "";
        file = ROOT_DIR + '/views/js/administrator.js';

        fs.readFile(file,'utf-8', function(err, data) {
            if (err) {
                res.writeHead(404);
                return res.end('Page or file not found');
            }
            var f = ejs.compile(data);
            var fileContent = f({hostname: config.hostname,fnCallback:fnCallback,langCode:langCode});
            res.setHeader('Content-Type', 'application/javascript');
            res.setHeader('Content-Length', fileContent.length);
            res.send(fileContent);
        });
    });
    app.get('/js/administrator_embed.js', (req, res) => {
        var file = "";
        file = ROOT_DIR + '/views' + req.url;

        fs.readFile(file,'utf-8', function(err, data) {
            if (err) {
                res.writeHead(404);
                return res.end('Page or file not found');
            }
            var f = ejs.compile(data);
            var fileContent = f({hostname: config.hostname});
            res.setHeader('Content-Type', 'application/javascript');
            res.setHeader('Content-Length', fileContent.length);
            res.send(fileContent);
        });
    });

    app.get('/index.html', (req, res) => {
        let lng= req.query.lng;
        console.log(language.getDefaultLang(req));
        res.render('pages/index',{language:language});
    });

    app.post('/login', (req, res) => {
        var username=req.body.username;
        var password=req.body.password;
        modelUser.login({Username:username},function (user) {
            if(user!== false){
                let token = crypto.randomBytes(64).toString('hex');
                tokens[token] = new Date().getTime();
                user.token = token;
                dataUsers.set(user.User_ID,user);
                let userOnlines = usersManager.getUsers();
                for(var i=0;i<user.clients.length;i++){
                    user.clients[i].online = false;
                    if(userOnlines.has(user.clients[i].User_ID)){
                        if(Object.keys(userOnlines.get(user.clients[i].User_ID)).length>0){
                            user.clients[i].online = true;
                        }
                    }
                }
                user.setting = JSON.parse(user.setting);
                //if(clients.has())
                res.json({
                    status:1,
                    data:{
                        user: user,
                        token: token
                    }
                });
            }else{
                res.json({
                    status:2,
                    message: 'User not exist'
                });
            }
        })
    });

    app.post('/upload', uploadRouter.uploadImage);
    app.post('/upload-base64-image', uploadRouter.uploadImageBase64);

    app.post('/update-avatar', function(req, res) {

        try{
            if(!tokens.hasOwnProperty(req.body.token)){
               throw "Invalid token!";
            }
            if (Object.keys(req.files).length == 0) {
                return res.status(400).send('No files were uploaded.');
            }

            // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
            let sampleFile = req.files.file_avatar;

            let file_ext = sampleFile.name.substr((Math.max(0, sampleFile.name.lastIndexOf(".")) || Infinity) + 1);
            var filename = uuidv4();
            let newName = filename+'.'+file_ext;
            // Use the mv() method to place the file somewhere on your server
            if(isImage(newName)){
                sampleFile.mv(ROOT_DIR+'/public/uploads/avatar/'+newName, function(err) {
                    if(!err){
                        modelUser.saveAvatar(req.body.User_ID,'public/uploads/avatar/'+newName,function () { })
                        res.json({
                            status:1,
                            data:{
                                message: config.hostname+'public/uploads/avatar/'+newName
                            }
                        });
                    }else{
                        res.json({
                            status:2,
                            data:{
                                message: err
                            }
                        });
                    }


                });
            }else{
                res.json({
                    status:2,
                    data:{
                        message: 'error'
                    }
                });
            }
        }catch (e) {
            res.json({
                status:2,
                data:{
                    message: e
                }
            });
        }
    });

    app.post('/save-setting', function(req, res) {
        if(tokens.hasOwnProperty(req.body.token)){
            modelUser.saveSetting(req.body.User_ID,req.body.setting,function () {
                res.json({
                    status:1,
                    message: 'Save success full'
                });
            })
        }
    });


    app.post('/update-device-id', [
        check('device_type').not().isEmpty(),
        check('device_id').not().isEmpty(),
        check('token').not().isEmpty(),
        check('user_id').not().isEmpty(),

    ], (req, res) => {
        try {
            // return if invalid input
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.json({
                    status:2,
                    message: errors.array()
                });
            }

            //Throw exception when invalid token
            if(!tokens.hasOwnProperty(req.body.token)){
                throw 'Invalid token';
            }
            modelUser.saveDeviceToken(req.body.user_id,req.body.device_type,req.body.device_id,function () {
                return res.json({
                    status:1,
                    message:'successful'
                });
            })
        }catch (e) {
            res.json({
                status:2,
                message: e
            });
        }

    });

};
