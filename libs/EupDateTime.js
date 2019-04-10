var moment = require('moment');
//EupDateTime
module.exports = (function () {
    return {
        format:function (timestamp,offset,format="L HH:mm:ss") {
            if(!offset){
                offset = moment().utcOffset();
            }
            return moment(timestamp).utcOffset(offset).format(format)
        }
    }
})();