function DepartmentUserRegistryController(departmentUserRegistryService) {
    return {
        departmentusers_get: async function (req, res) {
            res.send(await departmentUserRegistryService.getDepartmentUserList());
        },
        receivers_get: async function (req, res) {
            res.send(await departmentUserRegistryService.searchUsersMatchingKeyword(req.query.keyword));
        }        
    };
}

module.exports = DepartmentUserRegistryController;