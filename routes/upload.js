const uuidv4 = require('uuid/v4');
var path = require('path');
var fs = require('fs');
var appDir = path.dirname(require.main.filename)+'/';
const isImage = require('is-image');
var moment = require('moment');
var config = require('../config/configuration');


function getNewFileName(name) {
    let file_ext = name.substr((Math.max(0, name.lastIndexOf(".")) || Infinity) + 1);
    var filename = uuidv4();
    let newName = filename + '.' + file_ext;
    return 'public/uploads/' + newName;
}

module.exports = {
    uploadImage: (req, res) => {
        if (Object.keys(req.files).length == 0) {
            return res.status(400).send('No files were uploaded.');
        }

        let sampleFile = req.files.eupchat_file;
        let newFileName = getNewFileName(sampleFile.name);
        sampleFile.mv(appDir + newFileName, function (err) {
            if (err)
                return res.status(500).send(err);
            if (isImage(newFileName))
                messageContent = '<img src="' + config.hostname + newFileName + '">';
            else
                messageContent = '<a href="' + config.hostname + newFileName + '">' + sampleFile.name + '</a>';
            let currentTimestamp = moment().valueOf();
            res.json({
                status: 1,
                data: {
                    message: messageContent,
                    image: config.hostname + newFileName
                }
            });
        });
    },
    uploadImageBase64: (req, res) => {
        var imageData = req.body.image_data;
        if (typeof imageData === "undefined") {
            return res.status(404).send("Missing image data");
        } else {
            var base64Data, binaryData;
            base64Data = imageData.replace(/^data:image\/png;base64,/, "");
            base64Data += base64Data.replace('+', ' ');
            binaryData = new Buffer(base64Data, 'base64').toString('binary');
            let newFileName = getNewFileName(moment().valueOf() + ".jpg");
            fs.writeFile(appDir + newFileName, binaryData, "binary", function (err) {
                if (err)
                    return res.status(500).send(err);
                let messageContent = '<img src="' + config.hostname + newFileName + '">';
                res.json({
                    status: 1,
                    data: {
                        message: messageContent,
                        image: config.hostname + newFileName
                    }
                });
            });
        }
    }
}
