function AddressRegistryService(log, sqlserver) {
    const emailSearchSql = "SELECT gid1.Gid_GidID, gid1.Gid_GidKode, gid1.Gid_Navn, gid1.Gid_Adr, gid1.Gid_PostNr, gid1.Gid_Poststed, gid1.Gid_EmailAdr, (SELECT CASE WHEN COUNT(gid2.Gid_GidKode) > 1 THEN '1' ELSE '0' END FROM Gid_Identitet gid2 WHERE gid2.Gid_GidKode=gid1.Gid_GidKode) AS DuplikatGid FROM Gid_Identitet gid1 WHERE (gid1.gid_emailadr like @email) AND ((gid1.gid_tildato >= CURRENT_TIMESTAMP OR gid1.gid_tildato IS NULL OR gid1.gid_tildato = '') AND (gid1.gid_fradato <= CURRENT_TIMESTAMP OR gid1.gid_fradato is null OR gid1.gid_fradato = '')) ORDER BY gid1.Gid_GidKode"
    const codeSearchSql = "SELECT gid1.Gid_GidID, gid1.Gid_GidKode, gid1.Gid_Navn, gid1.Gid_Adr, gid1.Gid_PostNr, gid1.Gid_Poststed, gid1.Gid_EmailAdr, (SELECT CASE WHEN COUNT(gid2.Gid_GidKode) > 1 THEN '1' ELSE '0' END FROM Gid_Identitet gid2 WHERE gid2.Gid_GidKode=gid1.Gid_GidKode) AS DuplikatGid FROM Gid_Identitet gid1 WHERE (gid1.gid_gidkode like @code) AND ((gid1.gid_tildato >= CURRENT_TIMESTAMP OR gid1.gid_tildato IS NULL OR gid1.gid_tildato = '') AND (gid1.gid_fradato <= CURRENT_TIMESTAMP OR gid1.gid_fradato is null OR gid1.gid_fradato = '')) ORDER BY gid1.Gid_GidKode"
    function convertRecordsToAddresses(records) {
        let addresses = []

        records.forEach(record => {
            addresses.push({
                id: record.Gid_GidID,
                code: record.Gid_GidKode,
                name: record.Gid_Navn,
                address1: record.Gid_Adr,
                zipcode: record.Gid_PostNr,
                city: record.Gid_Poststed,
                mail: record.Gid_EmailAdr,
                duplicate: record.DuplikatGid !== '0'
            })
        })

        return addresses
    }
    
    return {
        lookupEmail: async (mail) => {
            let request = sqlserver.request()
            let result = await request.input('email', mail + '%').query(emailSearchSql)
            return convertRecordsToAddresses(result.recordset)
        },
        lookupCode: async (code) => {
            let request = sqlserver.request()
            let result = await request.input('code', code + '%').query(codeSearchSql)
            return convertRecordsToAddresses(result.recordset)
        }
    };
}

module.exports = AddressRegistryService;