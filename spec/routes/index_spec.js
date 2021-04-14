describe('routes-index', () => {
    var routes, containerMock, routerMock;

    beforeEach(() => {
        routerMock = jasmine.createSpyObj('Router', ['get', 'post']);
    
        containerMock = jasmine.createSpy('container');
        containerMock.WebsakUserCheckController = jasmine.createSpyObj('WebsakUserCheckController', ['get']);
        containerMock.LastArchiveIdLookupController = jasmine.createSpyObj('LastArchiveIdLookupController', ['get']);
        containerMock.ImportLogLookupController = jasmine.createSpyObj('ImportLogLookupController', ['get']);
        containerMock.ArchiveIdController = jasmine.createSpyObj('ArchivedIdController', ['get']);
        containerMock.AddressRegistryController = jasmine.createSpyObj('AddressRegistryController', ['get']);
        containerMock.AttachmentsController = jasmine.createSpyObj('AttachmentsController', ['get']);
        containerMock.AcosImportController = jasmine.createSpyObj('AcosImportController', ['post']);
        containerMock.DepartmentUserRegistryController = jasmine.createSpyObj('DepartmentUserRegistryController', ['departmentusers_get', 'receivers_get']);
        containerMock.DepartmentUsersChooseHandlerMiddleware = jasmine.createSpy('DepartmentUsersChooseHandlerMiddleware');
        containerMock.express = jasmine.createSpy('express');
        containerMock.express.Router = () => { return routerMock; };

        routes = require('../../src/routes/index');
    });

    it('returns router from container', () => {
        var result = routes(containerMock);
        
        expect(result).toBe(routerMock);
    });

    describe('maps', () => {
        it('/websakcheck to WebsakUserCheckController', () => {
            routes(containerMock);

            expect(routerMock.get).toHaveBeenCalledWith('/websakcheck', containerMock.WebsakUserCheckController.get);
        });

        it('/lastarchiveid to LastArchiveIdLookupController', () => {
            routes(containerMock);

            expect(routerMock.get).toHaveBeenCalledWith('/lastarchiveid', containerMock.LastArchiveIdLookupController.get);
        });

        it('/importlog to ImportLogLookupController', () => {
            routes(containerMock);

            expect(routerMock.get).toHaveBeenCalledWith('/importlog', containerMock.ImportLogLookupController.get);
        });
        
        it('/archiveid to ArchiveIdController', () => {
            routes(containerMock);

            expect(routerMock.get).toHaveBeenCalledWith('/archiveid', containerMock.ArchiveIdController.get);
        });

        it('/receivers to DepartmentUserRegistryController-receivers_get', () => {
            routes(containerMock);

            expect(routerMock.get).toHaveBeenCalledWith('/receivers', containerMock.DepartmentUserRegistryController.receivers_get);
        });

        it('/departmentusers to DepartmentUserRegistryController-departmentusers_get', () => {
            routes(containerMock);

            expect(routerMock.get).toHaveBeenCalledWith('/departmentusers', containerMock.DepartmentUsersChooseHandlerMiddleware, containerMock.DepartmentUserRegistryController.departmentusers_get);
        });

        it('/address to AddressRegistryController-get', () => {
            routes(containerMock);

            expect(routerMock.get).toHaveBeenCalledWith('/address', containerMock.AddressRegistryController.get);
        });

        it('/attachments to AttachmentsController-get', () => {
            routes(containerMock);

            expect(routerMock.get).toHaveBeenCalledWith('/attachments', containerMock.AttachmentsController.get);
        });

        it('/import to AcosImportController-post', () => {
            routes(containerMock);

            expect(routerMock.post).toHaveBeenCalledWith('/import', containerMock.AcosImportController.post);
        });
    });
});