describe('ArchiveIdService', () => {
    const ArchiveIdService = require('../../src/services/ArchiveIdService');
    var service, logMock, sqlMock, requestMock;
    const expectedArchiveId = '2020000001';
    const ARCHIVE_OK_STATUS_RESERVED = "R";
    const ARCHIVE_OK_STATUS_OPEN = "B";
    const ARCHIVE_INVALID_STATUS_CLOSED = "A";
    const ARCHIVE_INVALID_STATUS_NO_FOLLOWUP = "X";
    const ARCHIVE_INVALID_STATUS_EXPIRED = "U";
    function recordsetWithResultStatus(status){ return { recordsets: [[[{ Sas_ArkivSakID: '2020000001', Sas_Sakstittel: 'Archive title', Sas_Status: status }]]], recordset: [{ Sas_ArkivSakID: '2020000001', Sas_Sakstittel: 'Archive title', Sas_Status: status }], output: {}, rowsAffected: [1] } };
    const recordsetWithoutResult = { recordsets: [[]], recordset: [], output: {}, rowsAffected: [0] };

    beforeEach(() => {
        logMock = jasmine.createSpyObj('log', ['debug']);
        requestMock = jasmine.createSpyObj('request', ['input', 'query']);
        requestMock.input.and.returnValue(requestMock);
        requestMock.query.and.returnValue();

        sqlMock = jasmine.createSpyObj('sqlserver', ['request']);
        sqlMock.request.and.returnValue(requestMock);

        service = new ArchiveIdService(logMock, sqlMock);
    });

    describe('sets up and queries correctly', () => {
        it('requests new connection from sqlserver', () => {
            requestMock.query.and.returnValue(recordsetWithResultStatus(ARCHIVE_OK_STATUS_OPEN));

            service.getArchive(expectedArchiveId);

            expect(sqlMock.request).toHaveBeenCalled();
        });

        it('calls input with given archive id', async () => {
            requestMock.query.and.returnValue(recordsetWithResultStatus(ARCHIVE_OK_STATUS_OPEN));

            service.getArchive(expectedArchiveId);

            expect(requestMock.input).toHaveBeenCalledWith('archiveid', expectedArchiveId);
        });

        it('calls query with correct query', async () => {
            requestMock.query.and.returnValue(recordsetWithResultStatus(ARCHIVE_OK_STATUS_OPEN));

            service.getArchive(expectedArchiveId);

            expect(requestMock.query).toHaveBeenCalledWith('SELECT Sas_ArkivSakID, Sas_Sakstittel, Sas_Status FROM Sas_ArkivSak WHERE Sas_Status IS NOT NULL AND Sas_ArkivSakID = @archiveid');
        });

        it('when status is open archive it returns archive', async () => {
            requestMock.query.and.returnValue(recordsetWithResultStatus(ARCHIVE_OK_STATUS_OPEN));

            let result = await service.getArchive(expectedArchiveId);

            expect(result).toEqual({ archiveid: '2020000001', archivetitle: 'Archive title' });
        });

        it('when status is reserverd archive it returns archive', async () => {
            requestMock.query.and.returnValue(recordsetWithResultStatus(ARCHIVE_OK_STATUS_RESERVED));

            let result = await service.getArchive(expectedArchiveId);

            expect(result).toEqual({ archiveid: '2020000001', archivetitle: 'Archive title' });
        });

        it('returns searchError string values when archive status is closed', async () => {
            requestMock.query.and.returnValue(recordsetWithResultStatus(ARCHIVE_INVALID_STATUS_CLOSED));

            let result = await service.getArchive(expectedArchiveId);

            expect(result).toEqual({ searchError: 'Saken med oppgitt arkivsak-id må åpnes før import.' });
        });

        it('returns searchError string values when archive status is expired', async () => {
            requestMock.query.and.returnValue(recordsetWithResultStatus(ARCHIVE_INVALID_STATUS_EXPIRED));

            let result = await service.getArchive(expectedArchiveId);

            expect(result).toEqual({ searchError: 'Saken med oppgitt arkivsak-id må åpnes før import.' });
        });

        it('returns searchError string values when archive status is no followup', async () => {
            requestMock.query.and.returnValue(recordsetWithResultStatus(ARCHIVE_INVALID_STATUS_NO_FOLLOWUP));

            let result = await service.getArchive(expectedArchiveId);

            expect(result).toEqual({ searchError: 'Saken med oppgitt arkivsak-id må åpnes før import.' });
        });

        it('returns searchError string values when archive id is not found', async () => {
            requestMock.query.and.returnValue(recordsetWithoutResult);

            let result = await service.getArchive(expectedArchiveId);

            expect(result).toEqual({ searchError: 'Finner ikke sak med oppgitt arkivsak-id.' });
        });
    });
});