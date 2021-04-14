function WebsakUserCheckController(websakUserCheckService) {
    return {
        get: async function(req, res) {
            res.send(await websakUserCheckService.getUserStatus(req.session));
        }
    };
}

module.exports = WebsakUserCheckController;