describe('ImportLogLookupController', () => {
    const ImportLogLookupController = require('../../src/controllers/ImportLogLookupController');
    const expectedControllerValue = { imported: '2020000002' };
    const expectMailId = 'testMailId';
    var controller, importLogLookupService, resultMock, requestStub;

    beforeEach(() => {
        importLogLookupService = jasmine.createSpyObj('ImportLogLookupService', ['lookup']);
        importLogLookupService.lookup.and.returnValue(Promise.resolve({ imported: '2020000002' }));
        resultMock = jasmine.createSpyObj('result', ['send']);
        requestStub = { query: { mailId: expectMailId }};

        controller = ImportLogLookupController(importLogLookupService);
    });
    
    it('queries import log lookup service with mail id in query string', async () => {
        await controller.get(requestStub, resultMock);

        expect(importLogLookupService.lookup).toHaveBeenCalledWith(expectMailId);
    });

    it('sends result from import log lookup service as result to query', async () => {
        await controller.get(requestStub, resultMock);

        expect(resultMock.send).toHaveBeenCalledWith(expectedControllerValue);
    });
});