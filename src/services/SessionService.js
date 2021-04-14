/**
 * Common session service that can be used to store and share information between services.
 */
function SessionService(log) {
    var data = {
        userEmail: ''
    }
    
    return {
        setUserEmail: userEmail => data.userEmail = userEmail,
        getUserEmail: () => data.userEmail,
    };
}

module.exports = SessionService;