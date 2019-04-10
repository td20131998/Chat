module.exports = {
    hostname: 'http://192.168.1.51:3000/',
    languages: {
        EN : 'English',
        VN : 'Tiếng việt',
    },
    sql : {
        user: 'sa',
        password: 'root',
        server: "192.168.1.114",
        database: 'ChatEDriver',
        options: {
            encrypt: false // Use this if you're on Windows Azure
        }
    }
};