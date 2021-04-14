function ImportLogLookupController(acosImportService) {
    return {
        post: async function (req, res) {
            res.send(await acosImportService(req.headers.authorization).importJournalPost(req.session, req.body))
        }
    }
}

module.exports = ImportLogLookupController