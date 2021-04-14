/**
 * LastArchiveIdLookupService connects to the Websak database and retrieves
 * the id for the given user last viewed archive, if any.
 */
function LastArchiveIdLookupService(log, sqlserver) {
    const userLastArchiveSql = 'SELECT TOP 1 CONVERT(nvarchar(10), brh.Gbh_Sas_id) AS LastArchiveId FROM gbh_brukerhandling brh, Gid_Identitet bid WHERE brh.Gbh_sdo_id IS NULL AND brh.Gbh_gidid IS NOT NULL AND bid.Gid_GidID = brh.Gbh_gidid AND UPPER(bid.Gid_GidKode) = UPPER(@username) ORDER BY brh.Gbh_SistLest DESC';
    return {
        getLastArchiveId: async (samaccountname) => {
            let request = sqlserver.request();
            let result = await request.input('username', samaccountname).query(userLastArchiveSql);

            if (result.recordset.length === 1) {
                return result.recordset[0].LastArchiveId;
            } else {
                return '';
            }
        }
    };
}

module.exports = LastArchiveIdLookupService;