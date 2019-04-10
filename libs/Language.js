var config = require('../config/configuration');
var fs = require('fs');
module.exports=(function () {
    var lng = 'vn';
    var translated = {};

    var loadResource= function () {

        let lang_codes = Object.keys(config.languages);
        for(var i=0;i<lang_codes.length;i++){
            let CODE = lang_codes[i];
            let file = global.ROOT_DIR + '/config/translations/'+CODE+'.json';
            fs.readFile(file,'utf-8', function(err, data) {
                if (!err) {
                    translated[CODE]=JSON.parse(data);
                }

            });
        }
    }
    return {
        set: function (myLng) {
            lng = myLng;
        },
        get: function () {
            return lng;
        },
        getDefaultLang: function (req) {
            let key = config.languages[req.query.lang];
            if(key && config.languages[req.query.lang]){
                return {code: key,name: config.languages[req.query.lang]}
            }
            return {code: 'EN',name: config.languages['EN']}
        },
        loadResource:loadResource,

        getText:function (text,language_code='EN') {
            if(translated[language_code]){
                if(translated[language_code][text]) return translated[language_code][text];
            }
            return text;
        }
    }
})()