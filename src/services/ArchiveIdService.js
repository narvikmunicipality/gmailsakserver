function ArchiveIdService(log, sqlserver) {
    const archiveSql = 'SELECT Sas_ArkivSakID, Sas_Sakstittel, Sas_Status FROM Sas_ArkivSak WHERE Sas_Status IS NOT NULL AND Sas_ArkivSakID = @archiveid';
    return {
        getArchive: async (id) => {
            let request = sqlserver.request();
            let result = await request.input('archiveid', id).query(archiveSql);

            if (result.recordset.length === 1) {
                const record = result.recordset[0];
                const validImportStatus = /[BR]/; // B = Under behandling, R = reservert.

                if (!record.Sas_Status.match(validImportStatus)) {
                    return { searchError: 'Saken med oppgitt arkivsak-id må åpnes før import.' };
                } else {
                    return { archiveid: record.Sas_ArkivSakID, archivetitle: record.Sas_Sakstittel };
                }
            } else {
                return { searchError: 'Finner ikke sak med oppgitt arkivsak-id.' }
            }
        }
    };
}

module.exports = ArchiveIdService;