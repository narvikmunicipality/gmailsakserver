/**
 * WebsakDepartmentService connects to the Websak database and retrieves
 * "adm.enhet" and "journal enhet" for the given username.
 */
function WebsakDepartmentService(log, sqlserver) {
    const departmentSql = 'SELECT jrn.Nje_JEnhet, avd.Soa_AdmKort FROM Gid_Identitet bid, Soa_Avdeling avd, Nje_JournEnhet jrn, Sbr_Bruker brk WHERE bid.Gid_GidID = brk.Sbr_BrukerID AND avd.Soa_AvdelingID = brk.Sbr_AvdelingID AND avd.Soa_JournalEnhetID = jrn.Nje_JEnhet AND bid.Gid_Loginn = @username';
    return {
        getDepartmentForUser: async (samaccountname) => {
            let request = sqlserver.request();
            let result = await request.input('username', samaccountname).query(departmentSql);

            let data = { journalUnit: '', departmentCode: ''};
            if (result.recordset.length === 1) {
                const record = result.recordset[0];
                data.journalUnit = record.Nje_JEnhet;
                data.departmentCode = record.Soa_AdmKort;
            }

            return data;
        }
    };
}

module.exports = WebsakDepartmentService;