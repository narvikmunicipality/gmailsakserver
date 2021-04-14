/**
 * 
 */
function DepartmentUserRegistryService(log, sqlserver) {
    const getDepartmentUserSql = "SELECT DISTINCT Soa_AvdelingKode, Soa_Navn, Gid_GidKode, Sbr_Navn FROM gid_identitet, sbr_bruker, soa_Avdeling, Gbr_BrukerRolle WHERE Sbr_AvdelingID = Soa_AvdelingID AND sbr_brukerid = gid_gidid AND (sbr_type = 'B' OR sbr_type IS NULL) AND CAST(Gbr_GrmID as int) <= 5 AND Gbr_BrukerID = Sbr_BrukerID AND (sbr_fradato is null OR sbr_fradato <= GETDATE()) AND (sbr_tildato is null OR sbr_tildato >= DATEADD(DAY, -1 , GETDATE())) AND (soa_fradato is null OR soa_fradato <= GETDATE()) AND (soa_tildato is null OR soa_tildato >= DATEADD(DAY, -1 , GETDATE())) ORDER BY Soa_Navn, Sbr_Navn";
    const lookupUserSql = "SELECT Gid_GidKode, Sbr_Navn FROM gid_identitet, sbr_bruker WHERE sbr_brukerid = gid_gidid AND (sbr_type = 'B' OR sbr_type IS NULL) AND (sbr_fradato is null OR sbr_fradato <= GETDATE()) AND (sbr_tildato is null OR sbr_tildato >= DATEADD(DAY, -1 , GETDATE())) AND Gid_GidKode = @username";
    const searchUsersMatchingKeywordSql = "SELECT DISTINCT Gid_GidKode, Sbr_Navn, (Sbr_Navn + ' [' + Soa_AvdelingKode + ' - ' + Soa_Navn + ']') AS DeptNameCode FROM gid_identitet, sbr_bruker, soa_Avdeling, Gbr_BrukerRolle WHERE Sbr_AvdelingID = Soa_AvdelingID AND sbr_brukerid = gid_gidid AND (sbr_type = 'B' OR sbr_type IS NULL) AND CAST(Gbr_GrmID as int) <= 5 AND Gbr_BrukerID = Sbr_BrukerID AND (sbr_fradato is null OR sbr_fradato <= GETDATE()) AND (sbr_tildato is null OR sbr_tildato >= DATEADD(DAY, -1 , GETDATE())) AND (soa_fradato is null OR soa_fradato <= GETDATE()) AND (soa_tildato is null OR soa_tildato >= DATEADD(DAY, -1 , GETDATE())) AND (Soa_AvdelingKode LIKE @keyword OR Soa_Navn LIKE @keyword OR Gid_GidKode LIKE @keyword OR Sbr_Navn LIKE @keyword) ORDER BY Gid_GidKode"
    return {
        getDepartmentUserList: async (id) => {
            /**
             * This endpoint should be rewritten so the client does not have to convert the output to "suggestion-style" results.
             */
            let request = sqlserver.request();
            let result = await request.query(getDepartmentUserSql);

            var departmentUserList = [];
            var departmentUser, users = [];
            result.recordset.forEach(record => {
                if (departmentUser === undefined) {
                    departmentUser = { departmentCode: record.Soa_AvdelingKode, departmentName: record.Soa_Navn };
                } else if (departmentUser.departmentCode !== record.Soa_AvdelingKode) {
                    departmentUser.users = users;
                    departmentUserList.push(departmentUser);
                    departmentUser = { departmentCode: record.Soa_AvdelingKode, departmentName: record.Soa_Navn };
                    users = [];
                }

                users.push({ userCode: record.Gid_GidKode, userName: record.Sbr_Navn, });
            });
            if (departmentUser !== undefined) {
                departmentUser.users = users;
                departmentUserList.push(departmentUser);
            }

            return departmentUserList;
        },
        lookupUser: async (username) => {
            let request = sqlserver.request();
            let result = await request.input('username', username).query(lookupUserSql);

            if (result.recordset.length === 1) {
                return {
                    code: result.recordset[0].Gid_GidKode,
                    name: result.recordset[0].Sbr_Navn
                };
            } else {
                return { code: '', name: '' };
            }
        },
        searchUsersMatchingKeyword: async (keyword) => {
            let request = sqlserver.request();
            let result = await request.input('keyword', `%${keyword}%`).query(searchUsersMatchingKeywordSql);
            var matches = [];

            result.recordset.forEach(record => {
                matches.push({ name: record.Sbr_Navn, userCode: record.Gid_GidKode, nameAndDepartment: record.DeptNameCode });
            });

            return matches;
        }
    };
}

module.exports = DepartmentUserRegistryService;