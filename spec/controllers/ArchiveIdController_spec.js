describe('ArchiveIdController', () => {
    const ArchiveIdController = require('../../src/controllers/ArchiveIdController');
    const expectedControllerValue = { archiveid: '2020000001', archivetitle: 'Archive Title' };
    const expectedArchiveId = '2020000001';
    var controller, archiveIdService, resultMock, requestStub;

    beforeEach(() => {
        archiveIdService = jasmine.createSpyObj('ArchiveIdService', ['getArchive']);
        archiveIdService.getArchive.and.returnValue(Promise.resolve(expectedControllerValue));
        resultMock = jasmine.createSpyObj('result', ['send']);
        requestStub = { query: { id: expectedArchiveId }};

        controller = ArchiveIdController(archiveIdService);
    });
    
    it('queries archive id service with id in query string', async () => {
        await controller.get(requestStub, resultMock);

        expect(archiveIdService.getArchive).toHaveBeenCalledWith(expectedArchiveId);
    });

    it('sends result from archive id service as result to query', async () => {
        await controller.get(requestStub, resultMock);

        expect(resultMock.send).toHaveBeenCalledWith(expectedControllerValue);
    });
});