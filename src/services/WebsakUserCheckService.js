function WebsakUserCheckService(log, chooseHandlerList, departmentService, adService) {
    function canMailChooseHandler(emailAddress) {
        let canChooseHandler = false;
        chooseHandlerList.forEach(chooseHandlerEmail => {
            if (emailAddress === chooseHandlerEmail) {
                canChooseHandler = true;
                return;
            }
        });

        return canChooseHandler;
    }

    return {
        getUserStatus: async (session) => {
            var username = (await adService.lookupEmail(session.getUserEmail())).username;
            var departmentInfo = await departmentService.getDepartmentForUser(username);

            return { chooseHandler: canMailChooseHandler(session.getUserEmail()), valid: departmentInfo.journalUnit.length > 0 && departmentInfo.departmentCode.length > 0 };
        }
    };
}

module.exports = WebsakUserCheckService;