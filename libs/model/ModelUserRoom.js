const sql = require('./mssql');

module.exports = {
    checkUserRoomExist: function(userRoom, callback) {
        sql.connect(function() {
            sql.query(`SELECT * FROM [dbo].[User_Room] WHERE User_Room_ID = '${userRoom.User_Room_ID}'`, result => {
                if (result.recordset.length !== 0) {
                    console.log('User_Room existed');
                    sql.close(() => callback(true));
                } else {
                    sql.close(() => callback(false));
                }
            })
        })
    },
    createUserRoom: function(newUserRoom, callback) {
        sql.connect(function() {
            sql.query(`INSERT INTO [dbo].[User_Room] VALUES (
                '${newUserRoom.User_Room_ID}',
                '${newUserRoom.User_ID}',
                '${newUserRoom.Room_ID}',
                '${newUserRoom.Status}'
            )`, result => sql.close(() => callback(newUserRoom)));
        })
    },
    deleteUserRoom: function(User_Room_ID, callback) {
        sql.connect(function() {
            sql.query(`DELETE FROM [dbo].[User_Room] WHERE User_Room_ID = '${User_Room_ID}'`, result => {
                sql.close(() => callback());
            })
        })
    }
}