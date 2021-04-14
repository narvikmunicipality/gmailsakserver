describe('WebsakDepartmentService', () => {
    const WebsakDepartmentService = require('../../src/services/WebsakDepartmentService');
    var service, logMock, sqlMock, requestMock;
    const expectedUsername = 'TEST_USER';
    const recordsetWithResult = { recordsets: [[[{ Nje_JEnhet: 'JU', Soa_AdmKort: 'DEP' }]]], recordset: [{ Nje_JEnhet: 'JU', Soa_AdmKort: 'DEP' }], output: {}, rowsAffected: [1] };
    const recordsetWithoutResult = { recordsets: [[]], recordset: [], output: {}, rowsAffected: [0] };

    beforeEach(() => {
        logMock = jasmine.createSpyObj('log', ['debug']);
        requestMock = jasmine.createSpyObj('request', ['input', 'query']);
        requestMock.input.and.returnValue(requestMock);

        sqlMock = jasmine.createSpyObj('sqlserver', ['request']);
        sqlMock.request.and.returnValue(requestMock);

        service = new WebsakDepartmentService(logMock, sqlMock);
    });

    describe('sets up and queries correctly', () => {
        it('requests new connection from sqlserver', () => {
            requestMock.query.and.returnValue(Promise.resolve(recordsetWithResult));

            service.getDepartmentForUser(expectedUsername);

            expect(sqlMock.request).toHaveBeenCalled();
        });

        it('calls input with given username', async () => {
            requestMock.query.and.returnValue(Promise.resolve(recordsetWithResult));

            service.getDepartmentForUser(expectedUsername);

            expect(requestMock.input).toHaveBeenCalledWith('username', expectedUsername);
        });

        it('calls query with correct query', async () => {
            requestMock.query.and.returnValue(Promise.resolve(recordsetWithResult));

            service.getDepartmentForUser(expectedUsername);

            expect(requestMock.query).toHaveBeenCalledWith('SELECT jrn.Nje_JEnhet, avd.Soa_AdmKort FROM Gid_Identitet bid, Soa_Avdeling avd, Nje_JournEnhet jrn, Sbr_Bruker brk WHERE bid.Gid_GidID = brk.Sbr_BrukerID AND avd.Soa_AvdelingID = brk.Sbr_AvdelingID AND avd.Soa_JournalEnhetID = jrn.Nje_JEnhet AND bid.Gid_Loginn = @username');
        });

        it('returns retrieved values correct', async () => {
            requestMock.query.and.returnValue(Promise.resolve(recordsetWithResult));

            let result = await service.getDepartmentForUser(expectedUsername);

            expect(result).toEqual({ journalUnit: 'JU', departmentCode: 'DEP' });
        });

        it('returns empty string values when nothing is returned', async () => {
            requestMock.query.and.returnValue(recordsetWithoutResult);

            let result = await service.getDepartmentForUser(expectedUsername);

            expect(result).toEqual({ journalUnit: '', departmentCode: '' });
        });
    });
});