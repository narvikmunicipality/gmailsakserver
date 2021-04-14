function GmailClientService(log, httpclient) {
    return {
        getMessage: async mailId => {
            return (await httpclient.get('https://www.googleapis.com/gmail/v1/users/me/messages/' + mailId)).data
        },
        getAttachment: async (mailId, attachmentId) => {
            let result = await httpclient.get('https://www.googleapis.com/gmail/v1/users/me/messages/' + mailId + '/attachments/' + attachmentId)
            return result.data.data.toString().replace(/-/g, '+').replace(/_/g, '/')
        },
    }
}

module.exports = GmailClientService