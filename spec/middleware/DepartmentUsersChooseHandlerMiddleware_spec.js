describe('DepartmentUsersChooseHandlerMiddleware', () => {
    const DepartmentUsersChooseHandlerMiddleware = require('../../src/middleware/DepartmentUsersChooseHandlerMiddleware');
    var mw, requestStub, responseMock, nextMock, chooseHandlerAddresses;

    beforeEach(() => {
        expectedSessionService = jasmine.createSpyObj('SessionService', ['getUserEmail']);
        requestStub = { session: expectedSessionService };
        responseMock = jasmine.createSpyObj('response', ['status', 'json']);
        nextMock = jasmine.createSpy('next');
        chooseHandlerAddresses = ['gmailsak@example.com'];
        mw = new DepartmentUsersChooseHandlerMiddleware(undefined, chooseHandlerAddresses);
    });

    describe('when email address is in valid list', () => {
        beforeEach(() => {
            expectedSessionService.getUserEmail.and.returnValue('gmailsak@example.com');
        });

        it('does not set status code', async () => {
            await mw(requestStub, responseMock, nextMock);

            expect(responseMock.status).not.toHaveBeenCalled();
        });

        it('does not call json', async () => {
            await mw(requestStub, responseMock, nextMock);

            expect(responseMock.json).not.toHaveBeenCalled();
        });

        it('calls next', async () => {
            await mw(requestStub, responseMock, nextMock);

            expect(nextMock).toHaveBeenCalled();
        });
    });

    describe('when email address is not eligible for choose handler', () => {
        beforeEach(() => {
            expectedSessionService.getUserEmail.and.returnValue('another@example.com');
        });

        it('sets status code to 403 forbidden', async () => {
            await mw(requestStub, responseMock, nextMock);

            expect(responseMock.status).toHaveBeenCalledWith(403);
        });

        it('calls json with description', async () => {
            await mw(requestStub, responseMock, nextMock);

            expect(responseMock.json).toHaveBeenCalledWith({ code: 403, message: 'Account is not authorized to use this feature.' });
        });

        it('does not call next', async () => {
            await mw(requestStub, responseMock, nextMock);

            expect(nextMock).not.toHaveBeenCalled();
        });
    });
});