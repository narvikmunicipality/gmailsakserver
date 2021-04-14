describe('ImportLogService', () => {
    const ImportLogService = require('../../src/services/ImportLogService')
    const GmailMessageTestData = require('../GmailMessageTestData')
    var service, sqlMock, requestMock, queryResult, gmailMock
    const EXPECTED_JOURNALPOSTID = 'test-journalpost-id', EXPECTED_MAIL_ID = 'test-mail-id', EXPECTED_EMAIL_ADDRESS = 'gmailsak@example.com'
    const TEST_JOURNALPOSTDRAFT = { mailId: EXPECTED_MAIL_ID, archiveId: "2020000001", title: "Some test title", documentType: "X", attachments: [{ attachmentId: 'aaaaaaaaaaaaaaa', mainDocument: true }, { attachmentId: '123456', mainDocument: false }], senderCode: "CODE" }
    const insertResult = { recordsets: [], recordset: undefined, output: {}, rowsAffected: [1] }

    beforeEach(() => {
        requestMock = jasmine.createSpyObj('request', ['input', 'query'])
        requestMock.query.and.returnValue(Promise.resolve(queryResult))
        requestMock.input.and.returnValue(requestMock)
        gmailMock = jasmine.createSpyObj('GmailClientService', ['getMessage'])
        gmailMock.getMessage.and.returnValue(Promise.resolve(GmailMessageTestData.plainTextMessageWithoutAttachments))

        sqlMock = jasmine.createSpyObj('sqlserver', ['request'])
        sqlMock.request.and.returnValue(requestMock)

        service = new ImportLogService(undefined, sqlMock, gmailMock)
    })

    it('requests new connection from sqlserver', async () => {
        await service.logImport(EXPECTED_EMAIL_ADDRESS, EXPECTED_JOURNALPOSTID, TEST_JOURNALPOSTDRAFT, undefined)

        expect(sqlMock.request).toHaveBeenCalled()
    })

    it('calls query with correct query', async () => {
        await service.logImport(EXPECTED_EMAIL_ADDRESS, EXPECTED_JOURNALPOSTID, TEST_JOURNALPOSTDRAFT, undefined)

        expect(requestMock.query).toHaveBeenCalledWith('INSERT INTO Gmailsak.dbo.Log (ImportTime, MailId, MailAddress, JournalPostId, JournalPostDraft, ExceptionMessage, MailMetadata) VALUES (GetDate(), @mailid, @emailaddress, @journalpostid, @draft, @error ,@metadata)')
    })

    it('calls input with draft mailid', async () => {
        await service.logImport(EXPECTED_EMAIL_ADDRESS, EXPECTED_JOURNALPOSTID, TEST_JOURNALPOSTDRAFT, undefined)

        expect(requestMock.input).toHaveBeenCalledWith('mailid', EXPECTED_MAIL_ID)
    })

    it('calls input with empty mailid when draft does not contain one', async () => {
        await service.logImport(EXPECTED_EMAIL_ADDRESS, EXPECTED_JOURNALPOSTID, {}, undefined)

        expect(requestMock.input).toHaveBeenCalledWith('mailid', '')
    })

    it('calls input with given email address', async () => {
        await service.logImport(EXPECTED_EMAIL_ADDRESS, EXPECTED_JOURNALPOSTID, {}, undefined)

        expect(requestMock.input).toHaveBeenCalledWith('emailaddress', EXPECTED_EMAIL_ADDRESS)
    })

    it('calls input with given journal post id', async () => {
        await service.logImport(EXPECTED_EMAIL_ADDRESS, EXPECTED_JOURNALPOSTID, {}, undefined)

        expect(requestMock.input).toHaveBeenCalledWith('journalpostid', EXPECTED_JOURNALPOSTID)
    })

    it('calls input with empty journal post id when it is undefined', async () => {
        await service.logImport(EXPECTED_EMAIL_ADDRESS, undefined, {}, undefined)

        expect(requestMock.input).toHaveBeenCalledWith('journalpostid', '')
    })

    it('calls input with draft as json string', async () => {
        await service.logImport(EXPECTED_EMAIL_ADDRESS, EXPECTED_JOURNALPOSTID, TEST_JOURNALPOSTDRAFT, undefined)

        expect(requestMock.input).toHaveBeenCalledWith('draft', JSON.stringify(TEST_JOURNALPOSTDRAFT))
    })

    it('calls input with exception as json string', async () => {
        try {
            throw new Error("Some error")
        } catch (error) {
            await service.logImport(EXPECTED_EMAIL_ADDRESS, EXPECTED_JOURNALPOSTID, TEST_JOURNALPOSTDRAFT, error)
            expect(requestMock.input).toHaveBeenCalledWith('error', error.stack)
        }
    })

    it('calls input with empty exception when it is undefined', async () => {
        await service.logImport(EXPECTED_EMAIL_ADDRESS, EXPECTED_JOURNALPOSTID, TEST_JOURNALPOSTDRAFT, undefined)

        expect(requestMock.input).toHaveBeenCalledWith('error', '')
    })

    it('calls input with mail metadata', async () => {
        await service.logImport(EXPECTED_EMAIL_ADDRESS, EXPECTED_JOURNALPOSTID, TEST_JOURNALPOSTDRAFT, undefined)

        expect(requestMock.input).toHaveBeenCalledWith('metadata', JSON.stringify(GmailMessageTestData.plainTextMessageWithoutAttachments))
        expect(gmailMock.getMessage).toHaveBeenCalledWith(EXPECTED_MAIL_ID)
    })

    it('calls input with mail metadata failure message if it fails for any reason', async () => {
        let error = Error('Generic test error')
        gmailMock.getMessage.and.returnValue(Promise.reject(error))

        await service.logImport(EXPECTED_EMAIL_ADDRESS, EXPECTED_JOURNALPOSTID, TEST_JOURNALPOSTDRAFT, undefined)

        expect(requestMock.input).toHaveBeenCalledWith('metadata', error.stack)
        expect(gmailMock.getMessage).toHaveBeenCalledWith(EXPECTED_MAIL_ID)
    })
})