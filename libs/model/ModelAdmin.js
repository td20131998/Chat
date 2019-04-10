const sql = require('./mssql');

module.exports = {
    checkUserAdminExist: function(admin, callback) {
        sql.connect(function() {
            sql.query(`SELECT * FROM [dbo].[User] WHERE User_ID = '${admin.User_ID}'`, (err, result) => {
                if (err) {
                    console.log(err);
                    sql.close(() => callback(err));
                } else {
                    if (result.recordset.length === 0) {
                        sql.close(() => callback(false));
                    } else {
                        sql.query(`SELECT * FROM [dbo].[User_Admin] WHERE Admin_ID = '${admin.Admin_ID}'`, result => {
                            if (result.recordset.length !== 0) {
                                sql.close(() => callback(true));
                            } else {
                                sql.close(() => callback(false));
                            }
                        });
                    };
                }
            })
        })
    },
    createAdmin: function(newAdmin, callback) {
        sql.connect(function() {
            sql.connect(`INSERT INTO [dbo].[User_Admin] VALUES (
                '${newAdmin.Admin_ID}',
                '${newAdmin.User_ID}'
            )`, result => sql.close(() => callback(newAdmin)))
        });
    },
    deleteAdmin: function(Admin_ID, callback) {
        sql.connect(function() {
            sql.query(`DELETE FROM [dbo].[User_Admin] WHERE Admin_ID = '${Admin_ID}'`, err => {
                if (err) {
                    console.log(err);
                    sql.close();
                } else {
                    sql.close(() => callback());
                    // sql.close();
                } 
            })
        })
    }
}