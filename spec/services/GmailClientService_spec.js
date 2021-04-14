describe('GmailClientService', () => {
    const GmailClientService = require('../../src/services/GmailClientService'), GmailMessageTestData = require('../GmailMessageTestData')
    const TEST_MAIL_ID = 'TEST-MAIL-ID', EXPECTED_MESSAGE_RESULT = GmailMessageTestData.plainTextMessageWithNameInToHeader, TEST_ATTACHMENT_ID = 'TEST-ATTACHMENT-ID', EXPECTED_ATTACHMENT_RESULT = 'abc=='
    var service, httpClientMock

    beforeEach(() => {
        httpClientMock = jasmine.createSpyObj('AuthorizedHttpClient', ['get'])
        service = new GmailClientService(undefined, httpClientMock)
    })

    describe('getMessage', () => {
        beforeEach(() => {
            httpClientMock.get.and.returnValue(Promise.resolve({ data: EXPECTED_MESSAGE_RESULT }))
        })

        it('retrieves message using correct url', async () => {
            await service.getMessage(TEST_MAIL_ID)

            expect(httpClientMock.get).toHaveBeenCalledWith('https://www.googleapis.com/gmail/v1/users/me/messages/TEST-MAIL-ID')
        })

        it('returns result from httpclient', async () => {
            let result = await service.getMessage(TEST_MAIL_ID)

            expect(result).toEqual(EXPECTED_MESSAGE_RESULT)
        })
    })

    describe('getAttachment', () => {
        beforeEach(() => {
            httpClientMock.get.and.returnValue(Promise.resolve({ data: { data: EXPECTED_ATTACHMENT_RESULT } }))
        })

        it('retrieves message using correct url', async () => {
            await service.getAttachment(TEST_MAIL_ID, TEST_ATTACHMENT_ID)

            expect(httpClientMock.get).toHaveBeenCalledWith('https://www.googleapis.com/gmail/v1/users/me/messages/TEST-MAIL-ID/attachments/TEST-ATTACHMENT-ID')
        })

        it('returns result from httpclient', async () => {
            let result = await service.getAttachment(TEST_MAIL_ID, TEST_ATTACHMENT_ID)

            expect(result).toEqual(EXPECTED_ATTACHMENT_RESULT)
        })

        it('converts characters from base64 url encoding to regular', async () => {
            httpClientMock.get.and.returnValue(Promise.resolve({ data: { data: 'GvH-W9-VVa_At_Ew==' } }))

            let result = await service.getAttachment(TEST_MAIL_ID, TEST_ATTACHMENT_ID)

            expect(result).toEqual('GvH+W9+VVa/At/Ew==')
        })
    })
})