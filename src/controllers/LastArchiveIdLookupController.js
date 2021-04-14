function LastArchiveIdLookupController(activeDirectoryService, archiveIdService, lastArchiveIdLookupService) {
    return {
        get: async function (req, res) {
            let username = (await activeDirectoryService.lookupEmail(req.session.getUserEmail())).username;
            let lastArchiveId = await lastArchiveIdLookupService.getLastArchiveId(username);
            let archiveId = await archiveIdService.getArchive(lastArchiveId);

            if (archiveId.archiveid) {
                res.send(archiveId);
            } else {
                res.send({ archiveid: '', archivetitle: '' });
            }
        }
    };
}

module.exports = LastArchiveIdLookupController;