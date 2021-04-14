describe('WebsakUserCheckController', () => {
    const WebsakUserCheckController = require('../../src/controllers/WebsakUserCheckController');
    var controller, websakUserCheckServiceMock, resultMock, requestStub;
    var EXPECTED_CONTROLLER_VALUE = 'TEST_VALUE';

    beforeEach(() => {
        websakUserCheckServiceMock = jasmine.createSpyObj('WebsakUserCheckService', ['getUserStatus']);
        websakUserCheckServiceMock.getUserStatus.and.returnValue(EXPECTED_CONTROLLER_VALUE);
        resultMock = jasmine.createSpyObj('result', ['send']);
        requestStub = { session: jasmine.createSpy('session') };

        controller = WebsakUserCheckController(websakUserCheckServiceMock);
    });

    it('passes result from service as result', async () => {
        await controller.get(requestStub, resultMock);

        expect(resultMock.send).toHaveBeenCalledWith(EXPECTED_CONTROLLER_VALUE);
    });

    it('passes request session to service', async () => {
        await controller.get(requestStub, resultMock);

        expect(websakUserCheckServiceMock.getUserStatus).toHaveBeenCalledWith(requestStub.session);
    });
});