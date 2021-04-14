describe('AcosImportController', () => {
    const AcosImportController = require('../../src/controllers/AcosImportController')
    const EXPECTED_RETURN_VALUE = { status: "jp.id", message: "2020000001" }
    const TEST_BODY_VALUE = { some: 'body value' }, EXPECTED_AUTHORIZATION_VALUE = 'Bearer token'
    var controller, acosImportServiceMock, resultMock, requestStub, sessionMock, acosImportServiceInitializer

    beforeEach(() => {
        acosImportServiceMock = jasmine.createSpyObj('AcosImportService', ['importJournalPost'])
        acosImportServiceMock.importJournalPost.and.returnValue(Promise.resolve(EXPECTED_RETURN_VALUE))
        acosImportServiceInitializer = jasmine.createSpy('acosImportServiceInitializer')
        acosImportServiceInitializer.and.returnValue(acosImportServiceMock)
        sessionMock = jasmine.createSpy('Session');
        resultMock = jasmine.createSpyObj('result', ['send'])
        requestStub = { body: TEST_BODY_VALUE, session: sessionMock, headers: { authorization: EXPECTED_AUTHORIZATION_VALUE } }

        controller = AcosImportController(acosImportServiceInitializer)
    })

    it('creates acos import service with with correct token', async () => {
        await controller.post(requestStub, resultMock)

        expect(acosImportServiceInitializer).toHaveBeenCalledWith(EXPECTED_AUTHORIZATION_VALUE)
    })

    it('queries import log lookup service with mail id in query string', async () => {
        await controller.post(requestStub, resultMock)

        expect(acosImportServiceMock.importJournalPost).toHaveBeenCalledWith(sessionMock, TEST_BODY_VALUE)
    })

    it('sends result from import log lookup service as result to query', async () => {
        await controller.post(requestStub, resultMock)

        expect(resultMock.send).toHaveBeenCalledWith(EXPECTED_RETURN_VALUE)
    })
})