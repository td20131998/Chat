
var hostname = '<%= hostname %>';
var langCode = '<%= langCode %>';
var user = {};
var el_users =null;
var fnCallback ='<%= fnCallback %>';

//Init language
EupChatLanguage.setDefaultLang(langCode);

var Rooms = [];

var eupAppChatClient = (function () {
    return {
        init:function (username,password) {
            $.ajax({
                url: hostname+'login',
                type: 'POST',
                data: {username:username,'password':password},
                dataType:'json',
                success:function (response) {

                    if(response.status == 1){
                        user = response.data.user;

                        localStorage.setItem('token', response.data.token);

                        var socket = io.connect(hostname,{
                            query: {
                                token: localStorage.getItem('token'),
                            }
                        });
                        socket.on('error', function(response) {
                            alert(response);
                        });
                        socket.on( 'connect', function () {

                            socket.on( 'disconnect', function () {
                                console.log( 'disconnected to server' );
                            } );

                            /* if(!socket.connected){
                                 alert('please login to connect');
                                 return false;
                             }*/
                            $('body').append('<div id="eupchat">' +
                                '<div class="eupchat-header" id="eupchat-header"><span class="title">Eup chat</span><div class="eupchat-min-max-control">' +
                                '<span  class="eupchat-min"><img src="'+hostname+'public/images/icon-minimum.png"></span>' +
                                '<span  class="eupchat-max"><img src="'+hostname+'public/images/icon-maximum.png"></span>' +
                                '<span  class="eupchat-normal hide-this"><img src="'+hostname+'public/images/icon-normal.png"></span></div></div>' +
                                '   <div id="eupchat-main-chat" style="width: 100%">' +
                                '       <div class="eupchat-left">' +
                                '                <div><div id="eupchat-my-account"></div><span title="'+EupChatLanguage.get('Setting')+'" id="eupchat_btn_setting"><img src="'+hostname+'public/images/icon-settings.png"></span></div>' +
                                '                <div id="eupchat-toolbars"><input type="text" placeholder="'+EupChatLanguage.get('Search')+'" id="eupchat-search"></div>' +
                                '                <ul id="eupchat-users">' +
                                '                </ul>' +
                                '       </div>' +
                                '       <div class="eupchat-right">' +
                                '                <div id="chat-rooms-container"></div>' +
                                '       </div>' +
                                '   </div>' +
                                SoundAudioManager.getAudioHtmlControl() +

                                '</div>');

                            $(document).find('#eupchat-my-account').html('<span class="avatar"><img src="'+user.Avatar+'"></span>'+user.name);
                            /*dragElement(document.getElementById("eupchat"));*/
                            new Draggable('eupchat');
                            $('#eupchat').on('click','.eupchat-min',function () {
                                $('#eupchat').removeClass('min');
                                $('#eupchat').removeClass('max');
                                $('#eupchat').addClass('close-w');
                                $('.eupchat-max').addClass('hide-this');
                                $('.eupchat-normal').removeClass('hide-this');
                            })
                            $('#eupchat').on('click','.eupchat-max',function () {
                                $('#eupchat').removeClass('min');
                                $('#eupchat').addClass('max');
                                $('#eupchat').removeClass('close-w');
                                $('.eupchat-max').addClass('hide-this');
                                $('.eupchat-normal').removeClass('hide-this');
                                //$('#eupchat-max').style.display='none';
                            })
                            $('#eupchat').on('click','.eupchat-normal',function () {
                                $('#eupchat').removeClass('max');
                                $('#eupchat').addClass('min');
                                $('#eupchat').removeClass('close-w');
                                $('.eupchat-normal').addClass('hide-this');
                                $('.eupchat-max').removeClass('hide-this');
                                //$('#eupchat-max').style.display='none';
                            })
                            
                            el_users =$('#eupchat-users');
                            chatRoomManager.renderListClients(user.clients);
                            chatRoomManager.initFilter(user.clients);

                            UserList.setUserList(user.clients);

                            Rooms = user.clients;
                            el_users.on('click','li',function () {
                                var username = $(this).data('username');
                                var room_name = [username,user.User_ID].sort().join('_');
                                chatRoomManager.add(room_name,username,socket)
                                socket.emit("createroom", {sender:user.User_ID,receive:username});
                            })

                            socket.emit("join", user.User_ID);

                            socket.on("message", function(msg){
                                chatBox.displayMessage(msg);
                            });

                            socket.on('updaterooms',function(msg){
                                var final_message = $("<p />").text(msg.senderNickname+': '+ msg.message);
                                /*$("#history").append(final_message);
                                final_message.scrollintoview();*/
                            })

                            socket.on('updatechat',function(msg){
                                var final_message = $("<p />").text(msg.senderNickname+': '+ msg.message);
                                $("#history").append(final_message);
                                final_message.scrollintoview();
                            })

                            socket.on('userdisconnect',function(msg){
                                var final_message = $("<p />").text(msg.senderNickname+': '+ msg.message);
                                $("#history").append(final_message);
                                final_message.scrollintoview();
                            })

                            socket.on('userOnline',function (key) {
                                var room_name = [key,user.User_ID].sort().join('_');
                                if(el_users.find('li[data-room-name='+room_name+']').length<1){
                                    el_users.append('<li data-room-name='+room_name+' data-username="'+key+'">'+key+'<span class="count-message" data-count="0"></span></li>');
                                }
                            });

                            socket.on('listuser',function (msg) {
                                for(var key in msg.users){
                                    el_users.append('<li data-room-name='+([key,user.User_ID]).sort().join('_')+' data-username="'+key+'"><p class="name">'+key+'</p><span class="count-message" data-count="0"></span></li>');
                                }
                            });

                            socket.on('online',function (data) {
                                chatRoomManager.setOnline(data.Room_Name);
                            })

                            socket.on('offline',function (data) {
                                chatRoomManager.setOffline(data.Room_Name);
                            })

                        } );


                        //init event
                        $(document).on('click','#eupchat_btn_setting',function () {
                            formSetting.buildForm();
                        });
                        formSetting.bindEvent();
                        messageTemplate.loadMessageTemplate();
                    }
                }
            })
            

        }
    }
})()

var chatRoomManager = (function() {
    var rooms ={};
    var getClientInfomation = function (receiver_id) {
        for(var i = 0;i<user.clients.length;i++){
            if(user.clients[i].User_ID == receiver_id){
                return user.clients[i];
            }
        }
        return {}
    }
    
    var filterClient = function (keyword) {
        keyword = keyword.toLowerCase().latinise();
        $('#eupchat-users').find('li .name').each(function () {
                var html = $(this).html().toLowerCase().latinise();
                if(html.indexOf(keyword) !== -1){
                    $(this).closest('li').show();
                }else{
                    $(this).closest('li').hide();
                }
        })
    }
    
    return {
        add: function (room_name,receiver_id,socket) {
            var client = getClientInfomation(receiver_id);
            var el_chatRoomContainer = $('#chat-rooms-container');
            if(el_chatRoomContainer.find('#room_'+room_name).length==0){
                console.log(user);
                el_chatRoomContainer.append('<div class="chatbox" id="room_'+room_name+'">' +
                    '<div class="room_title" id="room_title"><img src="'+client.Avatar+'">'+client.name+'</div>' +
                    '<div class="messages" id="messages_'+room_name+'"></div>' +
                    '<div id="eupchat-tool">' +
                    '   <div class="eupchat-upload-image"><form id="form_image_'+room_name+'"><input name="eupchat_file" data-id="'+room_name+'"  type="file" accept="image/*" id="eupchat_img_'+room_name+'" ></form></div>' +
                    '   <div class="eupchat-upload-file"><form id="form_file_'+room_name+'"><input name="eupchat_file" data-id="'+room_name+'"  type="file" accept="*" id="eupchat_file_'+room_name+'" ></form></div>' +
                    '   <div class="eupchat-auto-message"><span class="message-template"><img src="'+hostname+'public/images/icon-conversation.png"></span></div>' +
                    '</div>'+
                    '<input data-id="'+room_name+'" autocomplete="off" placeholder="'+EupChatLanguage.get('Type your message here')+'"  class="message" id="message_'+room_name+'" type="text" value="">' +
                    '<input data-id="'+room_name+'" class="bttn-send" type="button" id="btn_'+room_name+'" value="'+EupChatLanguage.get('Send')+'">' +
                    '</div>');
                chatBox.add(room_name,receiver_id,socket);
                chatBox.setActiveBoxChat(room_name);
            }else{
                chatBox.setActiveBoxChat(room_name);
            }
        },
        renderListClients:function (clients) {
            var el_users = $('#eupchat-users');
            console.log(clients);
            for(var i=0;i<clients.length;i++){
                let client = clients[i];
                let key = client.User_ID;
                el_users.append('<li class="'+(client.online?'online':'')+'" data-room-name='+([key,user.User_ID]).sort().join('_')+' data-username="'+key+'"><div class="avatar"><img src="'+client.Avatar+'"></div><p class="name">'+client.name+'</p><span class="count-message" data-count="0"></span></li>');
            }
        },
        setOnline: function(room_name){
            var el_users = $('#eupchat-users');
            el_users.find('li[data-room-name='+room_name+']').addClass('online');
        },
        setOffline: function(room_name){
            var el_users = $('#eupchat-users');
            el_users.find('li[data-room-name='+room_name+']').removeClass('online');
        },
        initFilter:function () {
            $(document).on('keyup','#eupchat-search',function () {
                filterClient($(this).val())
            })
        }
    }
})();

var chatBox = (function () {
    var chats = new Map();
    var getChatBox = function (id) {
        return chats.get(id);
    }
    var removeChatBox = function (id) {
        var chatBox = getChatBox(id);
        chatBox.el_room.remove();
        chats.delete(id);

    }
    var handSendMessage= function (cb) {
        var msg = $('#message_'+cb.room_name).val();
        $('#message_'+cb.room_name).val("");
        cb.socket.emit("messagedetection",user.User_ID,cb.receiver_id,cb.room_name,msg, function() {
            cb.el_messge.val("");
        });



        /*$.ajax({
            url: hostname+'update-device-id',
            data: {token:user.token,'user_id':user.User_ID,'device_id':'emdCQeYdChY:APA91bE5DdA79A-jNwL9s2jrDf_F0VoeoGvwoaHUG86bHCSK4nKwPCdlV2CodeODdwUg-B8545BaQ2iDmmKD_zKL4smg0QgaGwLD_V9sRCYLujtu3dgHicfdgiYQWEyl2GLKXgZYFPmv','device_type':'android'},
            method: 'POST',
            type: 'POST', // For jQuery < 1.9
            dataType:'json',
            success: function(response){
                debugger
            }
        });*/
    };
    var handSendMessage1= function (cb,msg) {
        cb.socket.emit("messagedetection",user.User_ID,cb.receiver_id,cb.room_name,msg, function() {
            cb.el_messge.val("");
        });
    };

    var getSender =function(User_ID){
        if(isMe(User_ID)){
            return user;
        }
        var sender = UserList.getUserByID(User_ID);

        return sender;
    };

    var isMe = function (User_ID) {
        return (User_ID === user.User_ID);
    }

    var renderMessage= function(msg){
        var myClass ='not-mine';
        if(isMe(msg.sender)){
            myClass = 'mine'
        }
        var sender = getSender(msg.sender);
        var strMessge = '<div class="message-item '+myClass+'">' +
            '<div class="user-info"><span class="avatar"><img src="'+sender.Avatar+'"></span>'+sender.name+'</div> ' +
            '<div class="message-content"><span class="time">'+EupChatDateTime.format(msg.time)+'</span>'+ msg.message+'</div>' +
            '</div>';
        return strMessge;
    }
    
    var setActiveBoxChat = function (room_name) {
        chats.forEach(function (chatbox, key, map) {
            chatbox.el_room.removeClass('chatbox-active');
        })
        var currentChatBox = chats.get(room_name);
        currentChatBox.el_room.addClass('chatbox-active');
    }
    return{
        add: function (room_name,receiver_id,socket) {
            var chat = {
                room_name:room_name,
                receiver_id:receiver_id,
                messages: [],
                el_room: $('#room_'+room_name),
                el_messges: $('#messages_'+room_name),
                el_messge: $('#message_'+room_name),
                el_btn: $('#btn_'+room_name),
                el_upload_image: $('#eupchat_img_'+room_name),
                el_upload_file: $('#eupchat_file_'+room_name),
                socket: socket,
            };
            chat.el_btn.unbind('click');
            chat.el_btn.click(function () {
                var id = $(this).attr('data-id');
                var cb= getChatBox(id);
                handSendMessage(cb);

            });
            chat.el_messge.unbind('keyup');
            chat.el_messge.keyup(function (event) {
                if (event.keyCode === 13) {
                    event.preventDefault();
                    var id = $(this).attr('data-id');
                    var cb= getChatBox(id);
                    handSendMessage(cb);
                }

            });


            chat.el_upload_image.unbind('click');
            chat.el_upload_image.change(function () {
                var rname = $(this).attr('data-id');
                var formData = new FormData($(this).closest('form')[0]);
                formData.append('User_ID', user.User_ID);
                formData.append('room_name', rname);
                $.ajax({
                    url: hostname+'upload',
                    data: formData,
                    cache: false,
                    contentType: false,
                    processData: false,
                    method: 'POST',
                    type: 'POST', // For jQuery < 1.9
                    dataType:'json',
                    success: function(response){
                        debugger
                        if(response.status==1){
                            var id = $(this).attr('data-id');
                            var cb= getChatBox(rname);
                            handSendMessage1(cb, response.data.message);
                        }
                    }
                });
            });
            chat.el_upload_file.unbind('click');
            chat.el_upload_file.change(function () {
                var rname = $(this).attr('data-id');
                var formData = new FormData($(this).closest('form')[0]);
                formData.append('User_ID', user.User_ID);
                formData.append('room_name', rname);
                $.ajax({
                    url: hostname+'upload',
                    data: formData,
                    cache: false,
                    contentType: false,
                    processData: false,
                    method: 'POST',
                    type: 'POST', // For jQuery < 1.9
                    dataType:'json',
                    success: function(response){
                        if(response.status==1){
                            var id = $(this).attr('data-id');
                            var cb= getChatBox(rname);
                            handSendMessage1(cb, response.data.message);
                        }
                    }
                });
            });

            chats.set(room_name,chat);;
        },
        displayMessage: function(msg){
            var chatbox = getChatBox(msg.room_name);
            if(chatbox){
                var el_ms =null;
                if(msg.histories !== undefined){
                    for(var i=0;i<msg.histories.length;i++){
                        var msg_old = msg.histories[i];
                        chatbox.el_messges.append(renderMessage(msg_old));
                    }
                }else{
                    chatbox.el_messges.append(renderMessage(msg));

                    if(!isMe(msg.sender)) SoundAudioManager.play('sound_new_message');
                }
                var x = chatbox.el_messges.find('.message-item').last();
                chatbox.el_messges.find('.message-item').last().scrollintoview();

            }else{
                var el_count= $('#eupchat-users').find('li[data-room-name='+msg.room_name+'] .count-message');
                var cnt = parseInt(el_count.attr('data-count'));
                cnt+=1;
                el_count.html('('+cnt+')').attr('data-count',cnt);


                if(!isMe(msg.sender)) SoundAudioManager.play('sound_new_message');
            }
        },
        setActiveBoxChat:setActiveBoxChat
    }
})();

var UserList = (function () {
    var users =[];
    return{
        setUserList: function (list) {
            users = list;
        },
        getUserByID : function (User_ID) {
            var user= users.filter(x => x.User_ID === User_ID);
            if(user.length>0) return user[0];
            return false;
        },
        getUserByRoomName: function (User_ID) {

        },

    }
})();

var SoundAudioManager = (function () {
    var sounds ={
        'sound_new_message': hostname+'public/sounds/new-message.mp3'
    }
    return{
        getAudioHtmlControl: function () {
            var keys = Object.keys(sounds);
            var html = '<div id="RingListDiv" style="display:none !important;">'
            for(var i=0;i< keys.length;i++){
                html+='<audio controls="controls" preload="auto" id="eupchat-audio-'+keys[i]+'" src="'+sounds[keys[i]]+'"></audio>';
            }
            html+= '</div>';

            return html;
        },
        play: function (key) {
            if(user.setting[key]) $("#eupchat-audio-"+key)[0].play();
        }
    }
})();

var EupChatDateTime =(function(){
    return {
        format: function (timestamp) {
            return moment(timestamp).format('L HH:mm:ss');
        }
    }
})()

var formSetting =(function () {
    var closeForm = function () {
        $('#eupchat_setting').remove();
    }
    var getSetting = function () {
        var setting = {}
        if($('#eupchat_sound_newmessage').prop('checked')){
            setting.sound_new_message= true;
        }else{
            setting.sound_new_message= false;
        }

        var messages = [];
        $('#list-messagetemplate li textarea').each(function () {
            messages.push($(this).val());
        });
        setting.messagetemplate=messages;

        return setting;
    };
    var uploadAvatar = function () {
        $(document).on('click','#upload_avatar',function () {
            var formData = new FormData($('#form-upload-avatar')[0]);
            formData.append('User_ID', user.User_ID);
            formData.append('token', localStorage.getItem('token'));
            $.ajax({
                url: hostname+'update-avatar',
                data: formData,
                cache: false,
                contentType: false,
                processData: false,
                method: 'POST',
                type: 'POST', // For jQuery < 1.9
                dataType:'json',
                success: function(response){
                    if(response.status==1){
                        $('#form-upload-avatar').find("img").attr('src',response.data.message);
                    }else{
                       alert(message);
                    }
                }
            });
        })

    }
    return {
        buildForm: function () {
            var html = '' +
                '<div id="eupchat_setting">' +
                    '<span id="eupchat_btn_form_close" title="'+EupChatLanguage.get("Close setting")+'"><img src="'+hostname+'public/images/icon-close.png"></span>'+
                    '<ul class="eupchat-setting-tab eupchat-tabs" target="eupchat-tab1" >' +
                    '   <li target="eupchat-setting-1" class="eupchat-tab active">'+EupChatLanguage.get('Basic setting')+'</li>' +
                    '   <li target="eupchat-setting-2" class="eupchat-tab ">'+EupChatLanguage.get('Message setting')+'</li>' +
                    '</ul>'+
                    '<div id="eupchat-tab1">' +
                        '<div id="eupchat-setting-1" class="eupchat-tab-content active">' +
                        '   <fieldset><legend>'+EupChatLanguage.get('Avatar')+'</legend>' +
                        '       <form id="form-upload-avatar"><img src="'+user.Avatar+'">' +
                        '       <input type="file" name="file_avatar" accept="image/*">' +
                        '       <input type="button" name="upload_avatar" id="upload_avatar" value="'+EupChatLanguage.get('Save')+'"></form>' +
                        '   </fieldset>' +
                        '</div>' +
                        '<div id="eupchat-setting-2" class=" eupchat-tab-content">' +
                            '<fieldset>' +
                            '       <legend>'+EupChatLanguage.get('Sound setting')+'</legend>' +
                            '       <ul><li><input type="checkbox" id="eupchat_sound_newmessage" '+(user.setting.sound_new_message?'checked="checked"':'')+'><label for="eupchat_sound_newmessage">'+EupChatLanguage.get('Enable sound when have a new message')+'</label></li></ul>' +
                            '</fieldset>' +

                            '<fieldset>' +
                            '       <legend>'+EupChatLanguage.get('Messages template')+'</legend>' +
                            '       <ul id="list-messagetemplate">' +
                            '           <li><textarea>What do you want?</textarea><span class="btn-remove-messagetemplate"><img src="'+hostname+'public/images/icon-delete.png"></span></li>' +
                            '           <li><textarea>What is the hell?</textarea><span class="btn-remove-messagetemplate"><img src="'+hostname+'public/images/icon-delete.png"></span></li>' +
                            '           <li><textarea>Love is sad story?</textarea><span class="btn-remove-messagetemplate"><img src="'+hostname+'public/images/icon-delete.png"></span></li>' +
                            '           <li><textarea>Looking for a new job, that  is the best way to grow?</textarea><span class="btn-remove-messagetemplate"><img src="'+hostname+'public/images/icon-delete.png"></span></li>' +
                            '       </ul><button type="button" id="eupchat-btn-addmore-messagetempalte">'+EupChatLanguage.get('Add more message')+'</button>' +
                            '</fieldset>' +
                            '<div class="eupchat-form-setting-actions">' +
                            '       <button id="eupchat-setting-save" type="button">'+EupChatLanguage.get('Save')+'</button>' +
                            '       <button type="button" id="eupchat-setting-cancel"> '+EupChatLanguage.get('Cancel')+'</button>' +
                            '</div>'+
                        '</div>' +
                    '</div>' +
             '</div>';

            $('#eupchat-main-chat').append(html);


        },
        bindEvent: function () {
            $(document).off('click','#eupchat_btn_form_close');
            $(document).on('click','#eupchat_btn_form_close',function () {
                closeForm();
            });

            $(document).off('click','.btn-remove-messagetemplate');
            $(document).on('click','.btn-remove-messagetemplate',function () {
                $(this).closest('li').remove();
            });

            $(document).off('click','#eupchat-btn-addmore-messagetempalte');
            $(document).on('click','#eupchat-btn-addmore-messagetempalte',function () {
                $('#list-messagetemplate').append('<li><textarea></textarea><span class="btn-remove-messagetemplate"><img src="'+hostname+'public/images/icon-delete.png"></span></li>')
            });

            $(document).on('click','#eupchat-setting-save',function () {
                var setting = getSetting();
                $.ajax({
                    url: hostname+'save-setting',
                    type: 'POST',
                    data: {User_ID:user.User_ID,'token':localStorage.getItem('token'),'setting':JSON.stringify(setting)},
                    dataType:'json',
                    success:function (response) {
                        user.setting = setting;
                        alert(response.message);
                    }
                })
            })
            $(document).on('click','#eupchat-setting-cancel',function () {
                closeForm();
            })

            $(document).on('click','#eupchat',function (e) {
                if($(e.target).parents('.eupchat-auto-message').length == 0) {
                    $('#eupchat').find('.popup-message-template').remove();
                }
            });
            $(document).on('click','.eupchat-auto-message',function (e) {
                e.stopPropagation();
            });

            new eupchatTab({});

            uploadAvatar();
        }
    }
})()

var messageTemplate =(function () {
    var buildMessagesList = function () {
        var html = '<ul class="popup-message-template">';

        if(user.setting.messagetemplate){
            for(var i =0;i<user.setting.messagetemplate.length;i++){
                html+='<li>'+user.setting.messagetemplate[i]+'</li>';
            }
        }

        html += '</ul>';
        return html;
    }
    return {
        loadMessageTemplate:function () {
            $(document).on('click','#eupchat .message-template',function () {
                var html = buildMessagesList();
                $(this).closest('.eupchat-auto-message').append(html);
            });
            $(document).on('click','#eupchat .popup-message-template li',function () {
                var msg = $(this).html();
                $(this).closest('.chatbox').find('.message').val(msg);

                $(this).closest('.popup-message-template').remove();
            });
        }
    }
})();

var eupchatTab = function (option) {
    var config ={
        name:'eupchat-tabs',
    }
    $.extend(true,config,option)
    var init = function () {
        $(document).on('click','.'+config.name +' .eupchat-tab',function () {
            var id = $(this).closest('ul').attr('target');
            $(this).closest('ul').find('li').removeClass('active');
            $(this).addClass('active');
            $('#'+id).find('.eupchat-tab-content').removeClass('active');
            var targetId = $(this).attr('target');
            var x=  $(document).find('#'+targetId);
            x.addClass('active');
        })
    }
    init();
}
eupchatTab.prototype={

}

window[fnCallback].apply(null,[]);