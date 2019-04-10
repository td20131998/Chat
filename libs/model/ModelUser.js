const sql = require('./mssql');
const ModelUserRoom = require('./ModelUserRoom');
const ModelAdmin = require('./ModelAdmin');
const ChatroomManager = require('../ChatroomManager')();
const config = require('../../config/configuration');

module.exports = {
    validate: function(newUser, callback) {
        let result = newUser;
        result.Username = result.Username.trim()
        if (result.Username !== '') {
            //username only incluses alphabet and numbers
            if (/^[a-zA-Z0-9]+$/.test(result.Username)) {
                callback(result);
            } else {
                console.log('Invalid username');
            }
        } else {
            console.log("Invalid username");
        };
    },

    login: function(newUser, callback) {
        sql.connect(function() {
            sql.query(`SELECT * FROM [dbo].[User] WHERE Username = '${newUser.Username}'`, result => {
                if (result.recordset.length === 1) {
                    let user = result.recordset[0];
                    //Get all client[User_Admin]]
                    var User_ID = user.User_ID;
                    user.Avatar =config.hostname+user.Avatar;
                    let condition = ` WHERE [dbo].[User].User_ID IN (
                        SELECT [dbo].[User_Admin].User_ID FROM [dbo].[User_Admin] WHERE [dbo].[User_Admin].Admin_ID ='${User_ID}'
                    )`;
                    if(user.type == 1){
                        condition = ` WHERE [dbo].[User].User_ID IN (
                            SELECT [dbo].[User_Admin].Admin_ID FROM [dbo].[User_Admin] WHERE [dbo].[User_Admin].User_ID ='${User_ID}'
                        )`;
                    }
                    let sqlQuery =  `SELECT 
                        [dbo].[User].User_ID,
                        [dbo].[User].Username,
                        [dbo].[User].Avatar,
                        [dbo].[User].name,
                        [dbo].[User].type,                     
                        [dbo].[User].Device_Type,                     
                        [dbo].[User].Device_Id                     
                        FROM [dbo].[User] ${condition}`;
                    sql.query(sqlQuery, (result1) => {
                        let clients = [];
                        for(let i=0;i<result1.recordset.length;i++){
                            let client = result1.recordset[i];
                            client.Room_Name=ChatroomManager.renderRoomName(User_ID,client.User_ID);
                            client.Avatar = config.hostname+client.Avatar;
                            clients.push(client);
                        }
                        user.clients = clients;
                        sql.close(() => callback(user));
                    })
                } else {
                    sql.close(() => callback(false));
                };
            })
        })
    },
    saveSetting: function(User_ID,Settings, callback) {
        sql.connect(function() {
            sql.query(`UPDATE [dbo].[User] SET [dbo].[User].setting='${Settings}' WHERE [dbo].[User].User_ID ='${User_ID}'`, (error,result) => {
                sql.close(() => callback(true));
            })
        })
    },
    saveDeviceToken: function(User_ID,Device_Type,Device_Id, callback) {
        sql.connect(function() {
            sql.query(`UPDATE [dbo].[User] SET [dbo].[User].Device_Type='${Device_Type}',[dbo].[User].Device_Id='${Device_Id}'  WHERE [dbo].[User].User_ID ='${User_ID}'`, (error,result) => {
                sql.close(() => callback(true));
            })
        })
    },
    saveAvatar: function(User_ID,Avatar, callback) {
        sql.connect(function() {
            var x = `UPDATE [dbo].[User] SET [dbo].[User].Avatar='${Avatar}' WHERE [dbo].[User].User_ID ='${User_ID}'`;
            console.log(x);
            sql.query(`UPDATE [dbo].[User] SET [dbo].[User].Avatar='${Avatar}' WHERE [dbo].[User].User_ID ='${User_ID}'`, (error,result) => {
                sql.close(() => callback(true));
            })
        })
    },
    checkUserExist: function(newUser, callback) {
        sql.connect(function() {
            sql.query(`SELECT * FROM [dbo].[User] WHERE Username = '${newUser.Username}'`, result => {
                if (result.recordset.length !== 0) {
                    // console.log('Username existed');
                    sql.close(() => callback(true));
                } else {
                    sql.close(() => callback(false));
                };
            });
        });
    },
    createUser: function(newUser, callback) {
        sql.connect(function() {
            sql.query(`INSERT INTO [dbo].[User] VALUES (
                '${newUser.User_ID}',
                '${newUser.Username}',
                '${newUser.Password}',
                '${newUser.Avatar}',
                '${newUser.Status}'
            )`, result => sql.close(() => callback(newUser)));
        });
    },
    deleteUser: function(User_ID, callback) {
        sql.connect(function() {
            sql.query(`DELETE FROM [dbo].[User] WHERE User_ID = '${User_ID}'`, result => {
                //Delete User_Room user joined
                sql.query(`SELECT * FROM [dbo].[User_Room] WHERE User_ID = '${User_ID}'`, result => {
                    let userRooms = result.recordset;
                    for(let userRoom of userRooms) {
                        ModelUserRoom.deleteUserRoom(userRoom.User_Room_ID, () => console.log(`Delete User_Room ${userRoom.User_Room_ID} success`));
                    };
                })

                //Delete User_Admin is user
                sql.query(`SELECT * FROM [dbo].[User_Admin] WHERE User_ID = '${User_ID}'`, result => {
                    let admins = result.recordset;
                    for(let admin of admins) {
                        ModelAdmin.deleteAdmin(admin.Admin_ID, () => console.log(`Delete admin ${admin.Admin_ID} success`));
                    }
                })
                sql.close(() => callback());
            })
        });
    },
}