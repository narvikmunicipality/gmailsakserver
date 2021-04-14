describe('LastArchiveIdLookupService', () => {
    const LastArchiveIdLookupService = require('../../src/services/LastArchiveIdLookupService');
    var service, logMock, sqlMock, requestMock;
    const expectedUsername = 'TEST_USER';
    const recordsetWithResult = { recordsets: [[[{ LastArchiveId: '2020000001' }]]], recordset: [{ LastArchiveId: '2020000001' }], output: {}, rowsAffected: [1] };
    const recordsetWithoutResult = { recordsets: [[]], recordset: [], output: {}, rowsAffected: [0] };

    beforeEach(() => {
        logMock = jasmine.createSpyObj('log', ['debug']);
        requestMock = jasmine.createSpyObj('request', ['input', 'query']);
        requestMock.input.and.returnValue(requestMock);

        sqlMock = jasmine.createSpyObj('sqlserver', ['request']);
        sqlMock.request.and.returnValue(requestMock);

        service = new LastArchiveIdLookupService(logMock, sqlMock);
    });

    describe('sets up and queries correctly', () => {
        it('requests new connection from sqlserver', () => {
            requestMock.query.and.returnValue(Promise.resolve(recordsetWithResult));

            service.getLastArchiveId(expectedUsername);

            expect(sqlMock.request).toHaveBeenCalled();
        });

        it('calls input with given username', async () => {
            requestMock.query.and.returnValue(Promise.resolve(recordsetWithResult));

            service.getLastArchiveId(expectedUsername);

            expect(requestMock.input).toHaveBeenCalledWith('username', expectedUsername);
        });

        it('calls query with correct query', async () => {
            requestMock.query.and.returnValue(Promise.resolve(recordsetWithResult));

            service.getLastArchiveId(expectedUsername);

            expect(requestMock.query).toHaveBeenCalledWith('SELECT TOP 1 CONVERT(nvarchar(10), brh.Gbh_Sas_id) AS LastArchiveId FROM gbh_brukerhandling brh, Gid_Identitet bid WHERE brh.Gbh_sdo_id IS NULL AND brh.Gbh_gidid IS NOT NULL AND bid.Gid_GidID = brh.Gbh_gidid AND UPPER(bid.Gid_GidKode) = UPPER(@username) ORDER BY brh.Gbh_SistLest DESC');
        });

        it('returns retrieved values correct', async () => {
            requestMock.query.and.returnValue(Promise.resolve(recordsetWithResult));

            let result = await service.getLastArchiveId(expectedUsername);

            expect(result).toEqual('2020000001');
        });

        it('returns empty string values when nothing is returned', async () => {
            requestMock.query.and.returnValue(Promise.resolve(recordsetWithoutResult));

            let result = await service.getLastArchiveId(expectedUsername);

            expect(result).toEqual('');
        });
    });
});