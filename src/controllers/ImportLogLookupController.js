function ImportLogLookupController(importLogLookupService) {
    return {
        get: async function (req, res) {
            res.send(await importLogLookupService.lookup(req.query.mailId));
        }
    };
}

module.exports = ImportLogLookupController;