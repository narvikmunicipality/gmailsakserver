function AddressRegistryController(addressRegistryService) {
    return {
        get: async function (req, res) {
            if (req.query["code"] !== undefined) {
                res.send(await addressRegistryService.lookupCode(req.query.code));
            } else if (req.query["mail"] !== undefined) {
                res.send(await addressRegistryService.lookupEmail(req.query.mail));
            } else {
                res.send([]);
            }
        }
    };
}

module.exports = AddressRegistryController;