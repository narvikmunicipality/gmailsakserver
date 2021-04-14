describe('GoogleAuthenticationMiddleware', () => {
    const GoogleAuthenticationMiddleware = require('../../src/middleware/GoogleAuthenticationMiddleware');
    var mw, httpclientMock, requestMock, responseMock, nextMock, configMock, newSessionMock;

    beforeEach(() => {
        requestMock = jasmine.createSpyObj('request', ['headers']);
        responseMock = jasmine.createSpyObj('response', ['status', 'json']);
        nextMock = jasmine.createSpy('next');
        configMock = { url: { google: { user_profile: 'expected user profile url' } }, authorization: { valid_domains: ['valid.example.com'] } };
        httpclientMock = jasmine.createSpyObj('httpclient', ['get']);
        expectedSessionService = jasmine.createSpyObj('SessionService', ['setUserEmail']);
        newSessionMock = () => expectedSessionService;
        mw = new GoogleAuthenticationMiddleware(undefined, configMock, httpclientMock, newSessionMock);
    });

    describe('when token is not provided', () => {
        it('returns status code 400', async () => {
            await mw(requestMock, responseMock, nextMock);

            expect(responseMock.status).toHaveBeenCalledWith(400);
        });

        it('returns json with correct message', async () => {
            let expectedJson = { code: 400, message: 'Authorization token not provided.' };

            await mw(requestMock, responseMock, nextMock);

            expect(responseMock.json).toHaveBeenCalledWith(expectedJson);
        });

        it('does not call next', async () => {
            await mw(requestMock, responseMock, nextMock);

            expect(nextMock).not.toHaveBeenCalled();
        });
    });

    describe('when invalid token data is provided', () => {
        beforeEach(() => {
            requestMock.headers = { authorization: 'Not valid token' };
        });

        it('returns status code 400', async () => {
            await mw(requestMock, responseMock, nextMock);

            expect(responseMock.status).toHaveBeenCalledWith(400);
        });

        it('returns json with correct message', async () => {
            let expectedJson = { code: 400, message: 'Authorization token not properly formatted. Expecting "Authorization: Bearer <tokendata>".' };

            await mw(requestMock, responseMock, nextMock);

            expect(responseMock.json).toHaveBeenCalledWith(expectedJson);
        });

        it('does not call next', async () => {
            await mw(requestMock, responseMock, nextMock);

            expect(nextMock).not.toHaveBeenCalled();
        });
    });

    describe('when valid token is provided but invalid on verification', () => {
        const GoogleExpiredTokenMessage = { "error": { "errors": [{ "domain": "global", "reason": "authError", "message": "Invalid Credentials", "locationType": "header", "location": "Authorization" }], "code": 401, "message": "Invalid Credentials" } };
        beforeEach(() => {
            requestMock.headers = { authorization: 'Bearer valid_but_invalid' };
            httpclientMock.get.and.returnValue(Promise.reject({ response: { status: 401 }, data: GoogleExpiredTokenMessage }));
        });

        it('returns status code 401', async () => {
            await mw(requestMock, responseMock, nextMock);

            expect(responseMock.status).toHaveBeenCalledWith(401);
        });

        it('returns json with correct message', async () => {
            let expectedJson = { code: 401, message: 'Authorization token is invalid or expired.' };

            await mw(requestMock, responseMock, nextMock);

            expect(responseMock.json).toHaveBeenCalledWith(expectedJson);
        });

        it('does not call next', async () => {
            await mw(requestMock, responseMock, nextMock);

            expect(nextMock).not.toHaveBeenCalled();
        });
    });

    describe('when returned status code is not 401', () => {
        beforeEach(() => {
            requestMock.headers = { authorization: 'Bearer valid_but_invalid' };
            httpclientMock.get.and.returnValue(Promise.reject({ response: { status: 500 }, data: {} }));
        });

        it('returns status code 500', async () => {
            await mw(requestMock, responseMock, nextMock);

            expect(responseMock.status).toHaveBeenCalledWith(500);
        });

        it('returns json with correct message', async () => {
            let expectedJson = { code: 500, message: 'Unexpected error while trying to authorize token.' };

            await mw(requestMock, responseMock, nextMock);

            expect(responseMock.json).toHaveBeenCalledWith(expectedJson);
        });

        it('does not call next', async () => {
            await mw(requestMock, responseMock, nextMock);

            expect(nextMock).not.toHaveBeenCalled();
        });
    });

    describe('when valid token is provided', () => {
        beforeEach(() => {
            requestMock.headers = { authorization: 'Bearer valid_token' };
        });
        
        it('httpclient is called correctly', async () => {
            httpclientMock.get.and.returnValue(Promise.reject({ response: { status: 500 } } ));

            await mw(requestMock, responseMock, nextMock);

            expect(httpclientMock.get).toHaveBeenCalledWith('expected user profile url', { headers: { Authorization: 'Bearer valid_token' } });
        });

        describe('when mail is in valid domain list', () => {
            beforeEach(() => {
                httpclientMock.get.and.returnValue(Promise.resolve({ status: 200, data: { "emailAddress": "gmailsak@valid.example.com", "messagesTotal": 1337, "threadsTotal": 42, "historyId": "683161028" } }));
            });

            it('does not set status code', async () => {
                await mw(requestMock, responseMock, nextMock);

                expect(responseMock.status).not.toHaveBeenCalled();
            });

            it('does not call json', async () => {
                await mw(requestMock, responseMock, nextMock);

                expect(responseMock.json).not.toHaveBeenCalled();
            });

            it('calls next', async () => {
                await mw(requestMock, responseMock, nextMock);

                expect(nextMock).toHaveBeenCalled();
            });

            it('creates a session in the request object', async () => {
                await mw(requestMock, responseMock, nextMock);

                expect(requestMock.session).toBe(expectedSessionService);
            });

            it('puts email address of the user in the session', async () => {
                await mw(requestMock, responseMock, nextMock);

                expect(expectedSessionService.setUserEmail).toHaveBeenCalledWith('gmailsak@valid.example.com');
            });
        });

        describe('when mail is not in valid domain list', () => {
            beforeEach(() => {
                httpclientMock.get.and.returnValue(Promise.resolve({ status: 200, data: { "emailAddress": "gmailsak@invalid.example.com", "messagesTotal": 1337, "threadsTotal": 42, "historyId": "683161028" } }));
            });

            it('returns status code 403', async () => {
                await mw(requestMock, responseMock, nextMock);

                expect(responseMock.status).toHaveBeenCalledWith(403);
            });

            it('returns json with correct message', async () => {
                let expectedJson = { code: 403, message: 'Account domain is not authorized to use this service.' };

                await mw(requestMock, responseMock, nextMock);

                expect(responseMock.json).toHaveBeenCalledWith(expectedJson);
            });

            it('does not calls next', async () => {
                await mw(requestMock, responseMock, nextMock);

                expect(nextMock).not.toHaveBeenCalled();
            });
        });

        describe('when result does not contain emailAddress attribute', () => {
            beforeEach(() => {
                httpclientMock.get.and.returnValue(Promise.resolve({ status: 200, data: {} }));
            });

            it('returns status code 500', async () => {
                await mw(requestMock, responseMock, nextMock);

                expect(responseMock.status).toHaveBeenCalledWith(500);
            });

            it('returns json with correct message', async () => {
                let expectedJson = { code: 500, message: 'Unexpected data received while trying to verify token.' };

                await mw(requestMock, responseMock, nextMock);

                expect(responseMock.json).toHaveBeenCalledWith(expectedJson);
            });

            it('does not calls next', async () => {
                await mw(requestMock, responseMock, nextMock);

                expect(nextMock).not.toHaveBeenCalled();
            });
        });
    });
});