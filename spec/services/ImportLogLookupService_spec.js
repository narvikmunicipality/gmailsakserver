describe('ImportLogLookupService', () => {
    const ImportLogLookupService = require('../../src/services/ImportLogLookupService');
    var service, logMock, sqlMock, requestMock;
    const expectedMailId = '16fe5cd2e2a4b167';
    const recordsetWithResult = { recordsets: [[[{ JournalPostId: '2020000010' }]]], recordset: [{ JournalPostId: '2020000010' }], output: {}, rowsAffected: [1] };
    const recordsetWithResultButEmptyString = { recordsets: [[[{ JournalPostId: '' }]]], recordset: [{ JournalPostId: '' }], output: {}, rowsAffected: [1] };
    const recordsetWithoutResult = { recordsets: [[]], recordset: [], output: {}, rowsAffected: [0] };

    beforeEach(() => {
        logMock = jasmine.createSpyObj('log', ['debug']);
        requestMock = jasmine.createSpyObj('request', ['input', 'query']);
        requestMock.input.and.returnValue(requestMock);

        sqlMock = jasmine.createSpyObj('sqlserver', ['request']);
        sqlMock.request.and.returnValue(requestMock);

        service = new ImportLogLookupService(logMock, sqlMock);
    });

    describe('sets up and queries correctly', () => {
        it('requests new connection from sqlserver', () => {
            requestMock.query.and.returnValue(Promise.resolve(recordsetWithResult));

            service.lookup(expectedMailId);

            expect(sqlMock.request).toHaveBeenCalled();
        });

        it('calls input with given mailid', async () => {
            requestMock.query.and.returnValue(Promise.resolve(recordsetWithResult));

            service.lookup(expectedMailId);

            expect(requestMock.input).toHaveBeenCalledWith('mailid', expectedMailId);
        });

        it('calls query with correct query', async () => {
            requestMock.query.and.returnValue(Promise.resolve(recordsetWithResult));

            service.lookup(expectedMailId);

            expect(requestMock.query).toHaveBeenCalledWith('SELECT JournalPostId FROM Gmailsak.dbo.Log WHERE MailId=@mailid ORDER BY ImportTime DESC');
        });

        it('returns retrieved value correct', async () => {
            requestMock.query.and.returnValue(Promise.resolve(recordsetWithResult));

            let result = await service.lookup(expectedMailId);

            expect(result).toEqual({ imported: '2020000010' });
        });

        it('returns retrieved value correct', async () => {
            requestMock.query.and.returnValue(Promise.resolve(recordsetWithResultButEmptyString));

            let result = await service.lookup(expectedMailId);

            expect(result).toEqual({ imported: '0' });
        });

        it('returns zero when nothing is returned', async () => {
            requestMock.query.and.returnValue(Promise.resolve(recordsetWithoutResult));

            let result = await service.lookup(expectedMailId);

            expect(result).toEqual({ imported: '0' });
        });
    });
});