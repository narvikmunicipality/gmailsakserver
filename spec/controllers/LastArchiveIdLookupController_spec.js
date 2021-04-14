describe('LastArchiveIdLookupController', () => {
    const LastArchiveIdLookupController = require('../../src/controllers/LastArchiveIdLookupController');
    const expectedControllerValue = { archiveid: '2020000002', archivetitle: 'Archive title' };
    var controller, activeDirectoryServiceMock, archiveIdServiceMock, lastArchiveIdLookupServiceMock, sessionServiceMock, resultMock, requestStub;

    beforeEach(() => {
        activeDirectoryServiceMock = jasmine.createSpyObj('ActiveDirectoryService', ['lookupEmail']);
        activeDirectoryServiceMock.lookupEmail.and.returnValue({ username: 'user', displayname: 'User Name' });
        archiveIdServiceMock = jasmine.createSpyObj('ArchiveIdService', ['getArchive']);
        lastArchiveIdLookupServiceMock = jasmine.createSpyObj('LastArchiveIdLookupService', ['getLastArchiveId']);
        lastArchiveIdLookupServiceMock.getLastArchiveId.and.returnValue('2020000002');
        resultMock = jasmine.createSpyObj('result', ['send']);
        sessionServiceMock = jasmine.createSpyObj('SessionService', ['getUserEmail']);
        sessionServiceMock.getUserEmail.and.returnValue('gmailsak@example.com');
        requestStub = { session: sessionServiceMock };

        controller = LastArchiveIdLookupController(activeDirectoryServiceMock, archiveIdServiceMock, lastArchiveIdLookupServiceMock);
    });

    it('passes result from archive id service as result when archive was found', async () => {
        archiveIdServiceMock.getArchive.and.returnValue(expectedControllerValue);

        await controller.get(requestStub, resultMock);

        expect(resultMock.send).toHaveBeenCalledWith(expectedControllerValue);
    });

    it('passes result from archive id service as result when archive was found', async () => {
        archiveIdServiceMock.getArchive.and.returnValue({ searchError: 'some error' });

        await controller.get(requestStub, resultMock);

        expect(resultMock.send).toHaveBeenCalledWith({ archiveid: '', archivetitle: '' });
    });

    it('passes user email address to active directory service', async () => {
        archiveIdServiceMock.getArchive.and.returnValue(expectedControllerValue);

        await controller.get(requestStub, resultMock);

        expect(activeDirectoryServiceMock.lookupEmail).toHaveBeenCalledWith('gmailsak@example.com');
    });

    it('passes username to lastarchiveidlookup service', async () => {
        archiveIdServiceMock.getArchive.and.returnValue(expectedControllerValue);

        await controller.get(requestStub, resultMock);

        expect(lastArchiveIdLookupServiceMock.getLastArchiveId).toHaveBeenCalledWith('user');
    });

    it('passes last archive id to archive id service', async () => {
        archiveIdServiceMock.getArchive.and.returnValue(expectedControllerValue);

        await controller.get(requestStub, resultMock);

        expect(archiveIdServiceMock.getArchive).toHaveBeenCalledWith('2020000002');
    });
});