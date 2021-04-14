/**
 * GoogleAuthenticationMiddleware verifies every incoming request that the 
 * given OAuth2 token is valid by looking up the user profile and checking
 * that the email address domain is in the valid domain list specified in
 * config.js
 */
function GoogleAuthenticationMiddleware(log, config, httpclient, newSession) {
    return async (req, res, next) => {
        function failRequest(code, message) {
            res.status(code);
            res.json({ code: code, message: message });
        }

        function isMailDomainIsValid(emailAddress) {
            let isValidDomain = false;
            config.authorization.valid_domains.forEach(validDomain => {
                if (emailAddress.endsWith('@' + validDomain)) {
                    isValidDomain = true;
                    return;
                }
            });

            return isValidDomain;
        }

        if (!req.headers.authorization) {
            failRequest(400, 'Authorization token not provided.');
        } else {
            let authroization = req.headers.authorization;
            if (!authroization.startsWith('Bearer ')) {
                failRequest(400, 'Authorization token not properly formatted. Expecting "Authorization: Bearer <tokendata>".');
            } else {
                try {
                    let result = await httpclient.get(config.url.google.user_profile, { headers: { Authorization: req.headers.authorization } });
                    if (result.data.emailAddress) {
                        if (isMailDomainIsValid(result.data.emailAddress)) {
                            req.session = newSession();
                            req.session.setUserEmail(result.data.emailAddress);
                            next();
                        } else {
                            failRequest(403, 'Account domain is not authorized to use this service.');
                        }
                    } else {
                        failRequest(500, 'Unexpected data received while trying to verify token.');
                    }
                } catch (error) {
                    if (error.response.status === 401) {
                        failRequest(401, 'Authorization token is invalid or expired.');
                    } else {
                        failRequest(500, 'Unexpected error while trying to authorize token.');
                    }
                }
            }
        }
    };
}

module.exports = GoogleAuthenticationMiddleware;