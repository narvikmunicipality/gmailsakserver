describe('AttachmentsController', () => {
    const AttachmentsController = require('../../src/controllers/AttachmentsController')
    const expectedControllerValue = { id: '1', text: 'a', isImportable: true }
    const TEST_MAIL_ID = 'test mail id', TEST_AUTHORIZATION_TOKEN = 'Bearer token'
    var controller, attachmentsServiceMock, resultMock, requestStub, attachmentsServiceInitializer

    beforeEach(() => {
        attachmentsServiceMock = jasmine.createSpyObj('AttachmentsService', ['getAttachments'])
        attachmentsServiceMock.getAttachments.and.returnValue(Promise.resolve(expectedControllerValue))
        attachmentsServiceInitializer = jasmine.createSpy('attachmentsServiceInitializer')
        attachmentsServiceInitializer.and.returnValue(attachmentsServiceMock)
        resultMock = jasmine.createSpyObj('result', ['send'])
        requestStub = { query: { mailId: TEST_MAIL_ID }, headers: { authorization: TEST_AUTHORIZATION_TOKEN } }

        controller = AttachmentsController(attachmentsServiceInitializer)
    })

    it('passes authorization token tok attachments service initializer', async () => {
        await controller.get(requestStub, resultMock)

        expect(attachmentsServiceInitializer).toHaveBeenCalledWith(TEST_AUTHORIZATION_TOKEN)
    })

    it('passes mailid from query to  attachments service', async () => {
        await controller.get(requestStub, resultMock)

        expect(attachmentsServiceMock.getAttachments).toHaveBeenCalledWith(TEST_MAIL_ID)
    })

    it('sends result from attachments service as result to query', async () => {
        await controller.get(requestStub, resultMock)

        expect(resultMock.send).toHaveBeenCalledWith(expectedControllerValue)
    })
})