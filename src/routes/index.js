function index(c) {
    let router = c.express.Router();

    router.get('/websakcheck', c.WebsakUserCheckController.get);
    router.get('/lastarchiveid', c.LastArchiveIdLookupController.get);
    router.get('/importlog', c.ImportLogLookupController.get);
    router.get('/archiveid', c.ArchiveIdController.get);
    router.get('/receivers', c.DepartmentUserRegistryController.receivers_get);
    router.get('/address', c.AddressRegistryController.get);
    router.get('/attachments', c.AttachmentsController.get);
    router.post('/import', c.AcosImportController.post);
    router.get('/departmentusers', c.DepartmentUsersChooseHandlerMiddleware, c.DepartmentUserRegistryController.departmentusers_get);

    return router;
}

module.exports = index;
