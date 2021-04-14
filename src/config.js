const dotenv = require('dotenv');
dotenv.config();
module.exports = {
    server: {
        address: process.env.ADDRESS,
        port: process.env.PORT,
    },
    url: {
        google: {
            user_profile: 'https://www.googleapis.com/gmail/v1/users/me/profile',
        }
    },
    authorization: {
        valid_domains: JSON.parse(process.env.AUTHORIZATION_VALID_DOMAINS),
        choose_handler_addresses: JSON.parse(process.env.AUTHORIZATION_CHOOSE_HANDLER_ADDRESSES),
    },
    database: {
        config: {
            user: process.env.WEBSAK_DATABASE_USER,
            password: process.env.WEBSAK_DATABASE_PASSWORD,
            server: process.env.WEBSAK_DATABASE_SERVER,
            database: process.env.WEBSAK_DATABASE_DATABASE,
            options: {
                enableArithAbort: true
            }
        }
    },
    ldap: {
        config: {
            user: process.env.ACTIVE_DIRECTORY_LOOKUP_USER,
            password: process.env.ACTIVE_DIRECTORY_LOOKUP_PASSWORD,
            timeout: process.env.ACTIVE_DIRECTORY_LOOKUP_CONNECT_TIMEOUT,
            serverUrl: process.env.ACTIVE_DIRECTORY_LOOKUP_SERVER_URL,
            basedn: process.env.ACTIVE_DIRECTORY_LOOKUP_BASEDN,
        }
    },
    n4ws: {
        incoming: process.env.N4WS_INCOMING_URL,
        outgoing: process.env.N4WS_OUTGOING_URL,
    },
};