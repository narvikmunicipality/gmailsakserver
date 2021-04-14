describe('FileTypeRegistryService', () => {
    const FileTypeRegistryService = require('../../src/services/FileTypeRegistryService');
    const TEST_EXTENSION = 'txt';
    var service, logMock, requestMock;
    const recordsetWithResult = { recordset: [{ nlf_filtype: 'txt' }], output: {}, rowsAffected: [1] };
    const recordsetWithoutResult = { recordset: [], output: {}, rowsAffected: [0] };

    beforeEach(() => {
        requestMock = jasmine.createSpyObj('request', ['input', 'query']);
        requestMock.input.and.returnValue(requestMock);

        sqlMock = jasmine.createSpyObj('sqlserver', ['request']);
        sqlMock.request.and.returnValue(requestMock);

        service = new FileTypeRegistryService(logMock, sqlMock);
    });

    describe('sets up and queries correctly', () => {
        it('requests new connection from sqlserver', () => {
            requestMock.query.and.returnValue(recordsetWithoutResult);

            service.isValid(TEST_EXTENSION);

            expect(sqlMock.request).toHaveBeenCalled();
        });

        it('calls input with correct parameter on request', () => {
            requestMock.query.and.returnValue(recordsetWithoutResult);

            service.isValid(TEST_EXTENSION);

            expect(requestMock.input).toHaveBeenCalledWith('extension', TEST_EXTENSION);
        });

        it('calls query with correct query', async () => {
            requestMock.query.and.returnValue(recordsetWithoutResult);

            service.isValid(TEST_EXTENSION);

            expect(requestMock.query).toHaveBeenCalledWith('select nlf_filtype from nlf_lagrformat where lower(nlf_filtype) = lower(@extension)');
        });

        it('returns correct result when query returns result', async () => {
            requestMock.query.and.returnValue(recordsetWithResult);

            let result = await service.isValid(TEST_EXTENSION);

            expect(result).toEqual(true);
        });

        it('when no extensions are found returns false', async () => {
            requestMock.query.and.returnValue(recordsetWithoutResult);

            let result = await service.isValid(TEST_EXTENSION);

            expect(result).toEqual(false);
        });
    });
});