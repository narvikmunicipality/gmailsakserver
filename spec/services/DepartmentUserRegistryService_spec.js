describe('DepartmentUserRegistryService', () => {
    const DepartmentUserRegistryService = require('../../src/services/DepartmentUserRegistryService');
    var service, logMock, sqlMock, requestMock;
    const TEST_INVALID_USER_CODE = "INVALIDUSER";
    const TEST_EXISTING_USER_CODE = "USER";
    const EMPTY_KEYWORD = "";
    const TEST_CODE_SEARCH_STRING = "SEARCH";
    const EXPECTED_SEARCH_STRING = "%SEARCH%";
    const expectedDepartmentUserStatement = "SELECT DISTINCT Soa_AvdelingKode, Soa_Navn, Gid_GidKode, Sbr_Navn FROM gid_identitet, sbr_bruker, soa_Avdeling, Gbr_BrukerRolle WHERE Sbr_AvdelingID = Soa_AvdelingID AND sbr_brukerid = gid_gidid AND (sbr_type = 'B' OR sbr_type IS NULL) AND CAST(Gbr_GrmID as int) <= 5 AND Gbr_BrukerID = Sbr_BrukerID AND (sbr_fradato is null OR sbr_fradato <= GETDATE()) AND (sbr_tildato is null OR sbr_tildato >= DATEADD(DAY, -1 , GETDATE())) AND (soa_fradato is null OR soa_fradato <= GETDATE()) AND (soa_tildato is null OR soa_tildato >= DATEADD(DAY, -1 , GETDATE())) ORDER BY Soa_Navn, Sbr_Navn";
    const expectedUserStatement = "SELECT Gid_GidKode, Sbr_Navn FROM gid_identitet, sbr_bruker WHERE sbr_brukerid = gid_gidid AND (sbr_type = 'B' OR sbr_type IS NULL) AND (sbr_fradato is null OR sbr_fradato <= GETDATE()) AND (sbr_tildato is null OR sbr_tildato >= DATEADD(DAY, -1 , GETDATE())) AND Gid_GidKode = @username";
    const expectedUserSearchStatement = "SELECT DISTINCT Gid_GidKode, Sbr_Navn, (Sbr_Navn + ' [' + Soa_AvdelingKode + ' - ' + Soa_Navn + ']') AS DeptNameCode FROM gid_identitet, sbr_bruker, soa_Avdeling, Gbr_BrukerRolle WHERE Sbr_AvdelingID = Soa_AvdelingID AND sbr_brukerid = gid_gidid AND (sbr_type = 'B' OR sbr_type IS NULL) AND CAST(Gbr_GrmID as int) <= 5 AND Gbr_BrukerID = Sbr_BrukerID AND (sbr_fradato is null OR sbr_fradato <= GETDATE()) AND (sbr_tildato is null OR sbr_tildato >= DATEADD(DAY, -1 , GETDATE())) AND (soa_fradato is null OR soa_fradato <= GETDATE()) AND (soa_tildato is null OR soa_tildato >= DATEADD(DAY, -1 , GETDATE())) AND (Soa_AvdelingKode LIKE @keyword OR Soa_Navn LIKE @keyword OR Gid_GidKode LIKE @keyword OR Sbr_Navn LIKE @keyword) ORDER BY Gid_GidKode";
    const expectedDepartmentName = "Google";
    const expectedDepartmentCode = "GOGL";
    const expectedUserName = "Sak, Gmail";
    const expectedUserCode = "GMAILSAK";
    const expectedDepartmentNameAndCode = "Sak, Gmail [GOGL - Google]";
    const departmentUserRecordsetWithOneDepartmentOneUser = { recordsets: [[[{ Soa_AvdelingKode: expectedDepartmentCode, Soa_Navn: expectedDepartmentName, Gid_GidKode: expectedUserCode, Sbr_Navn: expectedUserName }]]], recordset: [{ Soa_AvdelingKode: expectedDepartmentCode, Soa_Navn: expectedDepartmentName, Gid_GidKode: expectedUserCode, Sbr_Navn: expectedUserName }], output: {}, rowsAffected: [1] };
    const departmentUserRecordsetWithTwoDepartmentsOneUserEach = { recordsets: [[[{ Soa_AvdelingKode: expectedDepartmentCode, Soa_Navn: expectedDepartmentName, Gid_GidKode: expectedUserCode, Sbr_Navn: expectedUserName }, { Soa_AvdelingKode: expectedDepartmentCode + '2', Soa_Navn: expectedDepartmentName + '2', Gid_GidKode: expectedUserCode + '2', Sbr_Navn: expectedUserName + '2' }]]], recordset: [{ Soa_AvdelingKode: expectedDepartmentCode, Soa_Navn: expectedDepartmentName, Gid_GidKode: expectedUserCode, Sbr_Navn: expectedUserName }, { Soa_AvdelingKode: expectedDepartmentCode + '2', Soa_Navn: expectedDepartmentName + '2', Gid_GidKode: expectedUserCode + '2', Sbr_Navn: expectedUserName + '2' },], output: {}, rowsAffected: [2] };
    const departmentUserRecordsetWithTwoUsersOneDepartment = { recordsets: [[[{ Soa_AvdelingKode: expectedDepartmentCode, Soa_Navn: expectedDepartmentName, Gid_GidKode: expectedUserCode, Sbr_Navn: expectedUserName }, { Soa_AvdelingKode: expectedDepartmentCode, Soa_Navn: expectedDepartmentName, Gid_GidKode: expectedUserCode + '2', Sbr_Navn: expectedUserName + '2' }]]], recordset: [{ Soa_AvdelingKode: expectedDepartmentCode, Soa_Navn: expectedDepartmentName, Gid_GidKode: expectedUserCode, Sbr_Navn: expectedUserName }, { Soa_AvdelingKode: expectedDepartmentCode, Soa_Navn: expectedDepartmentName, Gid_GidKode: expectedUserCode + '2', Sbr_Navn: expectedUserName + '2' },], output: {}, rowsAffected: [2] };
    const departmentUserRecordsetWithFourUsersTwoDepartment = { recordsets: [[[{ Soa_AvdelingKode: expectedDepartmentCode, Soa_Navn: expectedDepartmentName, Gid_GidKode: expectedUserCode, Sbr_Navn: expectedUserName }, { Soa_AvdelingKode: expectedDepartmentCode, Soa_Navn: expectedDepartmentName, Gid_GidKode: expectedUserCode + '2', Sbr_Navn: expectedUserName + '2' }, { Soa_AvdelingKode: expectedDepartmentCode + '2', Soa_Navn: expectedDepartmentName + '2', Gid_GidKode: expectedUserCode + '3', Sbr_Navn: expectedUserName + '3' }, { Soa_AvdelingKode: expectedDepartmentCode + '2', Soa_Navn: expectedDepartmentName + '2', Gid_GidKode: expectedUserCode + '4', Sbr_Navn: expectedUserName + '4' },]]], recordset: [{ Soa_AvdelingKode: expectedDepartmentCode, Soa_Navn: expectedDepartmentName, Gid_GidKode: expectedUserCode, Sbr_Navn: expectedUserName }, { Soa_AvdelingKode: expectedDepartmentCode, Soa_Navn: expectedDepartmentName, Gid_GidKode: expectedUserCode + '2', Sbr_Navn: expectedUserName + '2' }, { Soa_AvdelingKode: expectedDepartmentCode + '2', Soa_Navn: expectedDepartmentName + '2', Gid_GidKode: expectedUserCode + '3', Sbr_Navn: expectedUserName + '3' }, { Soa_AvdelingKode: expectedDepartmentCode + '2', Soa_Navn: expectedDepartmentName + '2', Gid_GidKode: expectedUserCode + '4', Sbr_Navn: expectedUserName + '4' },], output: {}, rowsAffected: [4] };
    const lookupUserRecordsetResult = { recordsets: [[{ Gid_GidKode: 'USER', Sbr_Navn: 'Lastname, Firstname' }]], recordset: [{ Gid_GidKode: 'USER', Sbr_Navn: 'Lastname, Firstname' }], output: {}, rowsAffected: [1] };
    const recordsetWithoutResult = { recordsets: [[]], recordset: [], output: {}, rowsAffected: [0] };
    const searchUsersMatchingKeywordRecordsetOneResult = { recordsets: [[{ Gid_GidKode: expectedUserCode, Sbr_Navn: expectedUserName, DeptNameCode: expectedDepartmentNameAndCode }]], recordset: [{ Gid_GidKode: expectedUserCode, Sbr_Navn: expectedUserName, DeptNameCode: expectedDepartmentNameAndCode }], output: {}, rowsAffected: [1] };
    const searchUsersMatchingKeywordRecordsetTwoResults = { recordsets: [[{ Gid_GidKode: expectedUserCode, Sbr_Navn: expectedUserName, DeptNameCode: expectedDepartmentNameAndCode }, { Gid_GidKode: expectedUserCode + '2', Sbr_Navn: expectedUserName + '2', DeptNameCode: expectedDepartmentNameAndCode + '2' }]], recordset: [{ Gid_GidKode: expectedUserCode, Sbr_Navn: expectedUserName, DeptNameCode: expectedDepartmentNameAndCode }, { Gid_GidKode: expectedUserCode + '2', Sbr_Navn: expectedUserName + '2', DeptNameCode: expectedDepartmentNameAndCode + '2' }], output: {}, rowsAffected: [2] };

    beforeEach(() => {
        logMock = jasmine.createSpyObj('log', ['debug']);
        requestMock = jasmine.createSpyObj('request', ['input', 'query']);
        requestMock.input.and.returnValue(requestMock);

        sqlMock = jasmine.createSpyObj('sqlserver', ['request']);
        sqlMock.request.and.returnValue(requestMock);

        service = new DepartmentUserRegistryService(logMock, sqlMock);
    });

    describe('sets up and queries correctly', () => {
        describe('getDepartmentUserList', () => {
            it('requests new connection from sqlserver', () => {
                requestMock.query.and.returnValue(recordsetWithoutResult);

                service.getDepartmentUserList();

                expect(sqlMock.request).toHaveBeenCalled();
            });

            it('calls query with correct query', async () => {
                requestMock.query.and.returnValue(recordsetWithoutResult);

                service.getDepartmentUserList();

                expect(requestMock.query).toHaveBeenCalledWith(expectedDepartmentUserStatement);
            });

            it('returns an empty array when nothing is found', async () => {
                requestMock.query.and.returnValue(recordsetWithoutResult);

                let result = await service.getDepartmentUserList();

                expect(result).toEqual([]);
            });

            it('maps result correctly when single department with single user is returned by query', async () => {
                requestMock.query.and.returnValue(departmentUserRecordsetWithOneDepartmentOneUser);

                let result = await service.getDepartmentUserList();

                expect(result).toEqual([{ departmentCode: expectedDepartmentCode, departmentName: expectedDepartmentName, users: [{ userCode: expectedUserCode, userName: expectedUserName }] }]);
            });

            it('maps result correctly when two departments with a user each is returned by query', async () => {
                requestMock.query.and.returnValue(departmentUserRecordsetWithTwoDepartmentsOneUserEach);

                let result = await service.getDepartmentUserList();

                expect(result).toEqual([
                    { departmentCode: expectedDepartmentCode, departmentName: expectedDepartmentName, users: [{ userCode: expectedUserCode, userName: expectedUserName }] },
                    { departmentCode: expectedDepartmentCode + '2', departmentName: expectedDepartmentName + '2', users: [{ userCode: expectedUserCode + '2', userName: expectedUserName + '2' }] }
                ]);
            });

            it('maps result correctly when one departments with two users is returned by query', async () => {
                requestMock.query.and.returnValue(departmentUserRecordsetWithTwoUsersOneDepartment);

                let result = await service.getDepartmentUserList();

                expect(result).toEqual([
                    { departmentCode: expectedDepartmentCode, departmentName: expectedDepartmentName, users: [{ userCode: expectedUserCode, userName: expectedUserName }, { userCode: expectedUserCode + '2', userName: expectedUserName + '2' }] },
                ]);
            });

            it('maps result correctly when two departments with two users each is returned by query', async () => {
                requestMock.query.and.returnValue(departmentUserRecordsetWithFourUsersTwoDepartment);

                let result = await service.getDepartmentUserList();

                expect(result).toEqual([
                    {
                        departmentCode: expectedDepartmentCode, departmentName: expectedDepartmentName, users: [
                            { userCode: expectedUserCode, userName: expectedUserName },
                            { userCode: expectedUserCode + '2', userName: expectedUserName + '2' }
                        ]
                    },
                    {
                        departmentCode: expectedDepartmentCode + '2', departmentName: expectedDepartmentName + '2', users: [
                            { userCode: expectedUserCode + '3', userName: expectedUserName + '3' },
                            { userCode: expectedUserCode + '4', userName: expectedUserName + '4' }
                        ]
                    }
                ]);
            });
        });

        describe('lookupUser', () => {
            it('requests new connection from sqlserver', () => {
                requestMock.query.and.returnValue(recordsetWithoutResult);

                service.lookupUser(TEST_INVALID_USER_CODE);

                expect(sqlMock.request).toHaveBeenCalled();
            });

            it('calls input with given archive id', async () => {
                requestMock.query.and.returnValue(recordsetWithoutResult);

                service.lookupUser(TEST_INVALID_USER_CODE);

                expect(requestMock.input).toHaveBeenCalledWith('username', TEST_INVALID_USER_CODE);
            });

            it('calls query with correct query', async () => {
                requestMock.query.and.returnValue(recordsetWithoutResult);

                service.lookupUser(TEST_INVALID_USER_CODE);

                expect(requestMock.query).toHaveBeenCalledWith(expectedUserStatement);
            });

            it('returns empty result when no matches found', async () => {
                requestMock.query.and.returnValue(recordsetWithoutResult);

                let result = await service.lookupUser(TEST_INVALID_USER_CODE);

                expect(result).toEqual({ code: '', name: '' });
            });

            it('returns correct result when match is found', async () => {
                requestMock.query.and.returnValue(lookupUserRecordsetResult);

                let result = await service.lookupUser(TEST_EXISTING_USER_CODE);

                expect(result).toEqual({ code: 'USER', name: 'Lastname, Firstname' });
            });
        });

        describe('searchUsersMatchingKeyword', () => {
            it('requests new connection from sqlserver', () => {
                requestMock.query.and.returnValue(recordsetWithoutResult);

                service.searchUsersMatchingKeyword(EMPTY_KEYWORD);

                expect(sqlMock.request).toHaveBeenCalled();
            });

            it('calls input with given archive id', async () => {
                requestMock.query.and.returnValue(recordsetWithoutResult);

                service.searchUsersMatchingKeyword(TEST_CODE_SEARCH_STRING);

                expect(requestMock.input).toHaveBeenCalledWith('keyword', EXPECTED_SEARCH_STRING);
            });

            it('calls query with correct query', async () => {
                requestMock.query.and.returnValue(recordsetWithoutResult);

                service.searchUsersMatchingKeyword(EMPTY_KEYWORD);

                expect(requestMock.query).toHaveBeenCalledWith(expectedUserSearchStatement);
            });

            it('returns empty result when no matches found', async () => {
                requestMock.query.and.returnValue(recordsetWithoutResult);

                let result = await service.searchUsersMatchingKeyword(EMPTY_KEYWORD);

                expect(result).toEqual([]);
            });

            it('maps result correctly to when match is found', async () => {
                requestMock.query.and.returnValue(searchUsersMatchingKeywordRecordsetOneResult);

                let result = await service.searchUsersMatchingKeyword(TEST_CODE_SEARCH_STRING);

                expect(result).toEqual([{ name: expectedUserName, userCode: expectedUserCode, nameAndDepartment: expectedDepartmentNameAndCode }]);
            });
            
            it('maps result correctly to when multiple matches is found', async () => {
                requestMock.query.and.returnValue(searchUsersMatchingKeywordRecordsetTwoResults);

                let result = await service.searchUsersMatchingKeyword(TEST_CODE_SEARCH_STRING);

                expect(result).toEqual([
                    { name: expectedUserName, userCode: expectedUserCode, nameAndDepartment: expectedDepartmentNameAndCode },
                    { name: expectedUserName + '2', userCode: expectedUserCode + '2', nameAndDepartment: expectedDepartmentNameAndCode + '2' }]);
            });
        });
    });
});