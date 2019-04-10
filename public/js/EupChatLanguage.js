var eupChatLanguageDefinded ={
    VN:{
        "Send":"gửi",
        "Type your message here":"Nội dung tin nhắn",
        "Search":"Tìm kiếm",
        "Setting":"Cài đặt"
    },
    EN:{
        "Send":"Send",
        "Type your message here":"Type your message here",
        "Search":"Search",
        "Setting":"Setting"
    },
    TW:{
        "Send":"Send TW",
        "Type your message here":"Type your message here TW",
        "Search":"搜索",
        "Setting":"Setting"
    }

}

var EupChatLanguage=(function () {
    var currentLange = 'EN';
    return{
        setDefaultLang: function (code) {
            if(!eupChatLanguageDefinded.hasOwnProperty(code)){
                currentLange = 'EN'
            }else {
                currentLange = code;
            }
        },
        get: function (text) {
            var translated = eupChatLanguageDefinded[currentLange];
            if(translated.hasOwnProperty(text)){
                return translated[text];
            }else {
                return text;
            }
        }
    }
})()