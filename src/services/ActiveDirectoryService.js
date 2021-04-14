function ActiveDirectoryService(log, ldap, clientConfig) {
    function bindToActiveDirectory(client) {
        return new Promise((resolve, reject) => {
            client.bind(clientConfig.user, clientConfig.password, (err) => {
                if (err) { reject(err); }
                else { resolve(); }
            });
        });
    }

    function createSearchFilterOptions(emailAddress) {
        return {
            filter: "(&(objectClass=user)(mail=" + emailAddress + "))",
            scope: 'sub',
            attributes: ['samaccountname', 'displayname']
        };
    }

    function searchActiveDirectoryForUserWithEmailAddress(emailAddress, client) {
        return new Promise((resolve, reject) => {
            client.search(clientConfig.basedn, createSearchFilterOptions(emailAddress), (error, event) => {
                var userResult = { username: '', displayname: '' };
                if (error) { reject(error); }
                else {
                    event.on('searchEntry', function (entry) {
                        userResult.username = entry.object.sAMAccountName;
                        userResult.displayname = entry.object.displayName;
                    });
                    event.on('error', function (err) { reject(err); });
                    event.on('end', function (result) {
                        if (result.status !== 0) { reject(new Error('LDAP error encountered: ' + result.status)); }
                        else {
                            client.unbind(() => { });
                            resolve(userResult);
                        }
                    });
                }
            });
        });
    }

    return {
        lookupEmail: async (emailAddress) => {
            let client = ldap.createClient({ url: clientConfig.serverUrl, timeout: clientConfig.timeout });
            await bindToActiveDirectory(client);
            return searchActiveDirectoryForUserWithEmailAddress(emailAddress, client);
        }
    };
}

module.exports = ActiveDirectoryService;