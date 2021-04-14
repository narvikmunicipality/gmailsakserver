function AttachmentsController(attachmentsService) {
    return {
        get: async function (req, res) {
            res.send(await attachmentsService(req.headers.authorization).getAttachments(req.query.mailId));
        }
    };
}

module.exports = AttachmentsController;