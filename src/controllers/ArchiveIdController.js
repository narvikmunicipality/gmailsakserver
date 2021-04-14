function ArchiveIdController(archiveIdService) {
    return {
        get: async function (req, res) {
            res.send(await archiveIdService.getArchive(req.query.id));
        }
    };
}

module.exports = ArchiveIdController;