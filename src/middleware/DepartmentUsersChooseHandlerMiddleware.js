/**
 * The "choose handler" feature is limited to validated email addresses only
 * and this middleware is put before that endpoint to prevent other users to
 * query it directly without being in that list.
 */
function DepartmentUsersChooseHandlerMiddleware(log, chooseHandlerEmailAddresses) {
    return async (req, res, next) => {
        var isValidEmailAddress = false;
        chooseHandlerEmailAddresses.forEach(address => {
            if (address === req.session.getUserEmail()) {
                isValidEmailAddress = true;
                return;
            }
        });
        
        if (isValidEmailAddress) {
            next();
        } else {
            res.status(403);
            res.json({ code: 403, message: 'Account is not authorized to use this feature.' });
        }
    };
}

module.exports = DepartmentUsersChooseHandlerMiddleware;