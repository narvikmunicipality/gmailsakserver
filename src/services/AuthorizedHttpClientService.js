function AuthorizedHttpClientService(log, httpclient, token) {
    return {
        get: async (url) => {
            return httpclient.get(url, { headers: { Authorization: token } });
        }
    }
}

module.exports = AuthorizedHttpClientService;