function ImportLogService(log, sqlserver, gmail) {
    const importLogSql = 'INSERT INTO Gmailsak.dbo.Log (ImportTime, MailId, MailAddress, JournalPostId, JournalPostDraft, ExceptionMessage, MailMetadata) VALUES (GetDate(), @mailid, @emailaddress, @journalpostid, @draft, @error ,@metadata)'


    return {
        logImport: async (emailAddress, journalPostId, draft, exception) => {
            async function getMetadata(mailId) {
                try {
                    let metadata = await gmail.getMessage(mailId)
                    metadata = JSON.stringify(metadata)
                    return metadata
                } catch (error) {
                    return error.stack || error
                }
            }

            let request = sqlserver.request()
            let metadata = await getMetadata(draft.mailId)
            await request.input('mailid', draft.mailId || '')
                .input('emailaddress', emailAddress)
                .input('journalpostid', journalPostId || '')
                .input('draft', JSON.stringify(draft))
                .input('error', exception && exception.stack || exception || '')
                .input('metadata', metadata)
                .query(importLogSql)
        }
    }
}

module.exports = ImportLogService