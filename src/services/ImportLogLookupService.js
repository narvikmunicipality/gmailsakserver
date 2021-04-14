/**
 * ImportLogLookupService connects to the Gmailsak database and retrieves
 * the archive id it was last imported to, if any.
 */
function ImportLogLookupService(log, sqlserver) {
    const importLogLookupSql = 'SELECT JournalPostId FROM Gmailsak.dbo.Log WHERE MailId=@mailid ORDER BY ImportTime DESC';
    return {
        lookup: async (mailId) => {
            let request = sqlserver.request();
            let result = await request.input('mailid', mailId).query(importLogLookupSql);

            if (result.recordset.length === 1 && result.recordset[0].JournalPostId !== '') {
                return { imported: result.recordset[0].JournalPostId };
            } else {
                return { imported: '0' };
            }
        }
    };
}

module.exports = ImportLogLookupService;