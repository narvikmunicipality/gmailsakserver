describe('AttachmentsService', () => {
    const AttachmentsService = require('../../src/services/AttachmentsService')
    const GmailMessageTestData = require('../GmailMessageTestData')
    var service, gmailClientMock, fileTypeRegistryMock
    const EXPECTED_ID = "EXPECTED_ID", MAIL_CONTENT_ATTACHMENT_ID = "68dbdf13b423ade4121dd9466ebc4362" /* ID-en er lik teksten "Eposten" som MD5-hash. */, EXPECTED_MAIL_ATTACHMENT_SUBJECT = "<div>æøå</div>",
        EXPECTED_ATTACHMENT_NAME_2 = "minimal.html", EXPECTED_ATTACHMENT_NAME = "informasjon.txt", EXPECTED_INLINE_ATTACHMENT_NAME = "inline.bmp"

    function setupHtmlMessageWithInlineAttachmentAndAttachments() {
        gmailClientMock.getMessage.and.returnValue(Promise.resolve(GmailMessageTestData.htmlMessageWithInlineAttachmentAndAttachments))
    }

    function setupHtmlMessageWithoutAttachments() {
        gmailClientMock.getMessage.and.returnValue(Promise.resolve(GmailMessageTestData.htmlMessageWithoutAttachments))
    }

    function setupPlainTextMessageWithoutAttachments() {
        gmailClientMock.getMessage.and.returnValue(Promise.resolve(GmailMessageTestData.plainTextMessageWithoutAttachments))
    }

    beforeEach(() => {
        gmailClientMock = jasmine.createSpyObj('GmailClientService', ['getMessage'])
        fileTypeRegistryMock = jasmine.createSpyObj('FileTypeRegistryService', ['isValid'])
        fileTypeRegistryMock.isValid.and.callFake(extension => Promise.resolve(extension == 'html' || extension == 'txt'))

        service = new AttachmentsService(undefined, gmailClientMock, fileTypeRegistryMock)
    })

    it('calls gmail client with given message id', async () => {
        setupPlainTextMessageWithoutAttachments()

        await service.getAttachments(EXPECTED_ID)

        expect(gmailClientMock.getMessage).toHaveBeenCalledWith(EXPECTED_ID)
    })

    it('when email is plaintext without attachments it returns only mail', async () => {
        setupPlainTextMessageWithoutAttachments()

        let result = await service.getAttachments(EXPECTED_ID)

        expect(result.length).toBe(1)
        expect(result[0].id).toEqual(MAIL_CONTENT_ATTACHMENT_ID)
        expect(result[0].text).toEqual(EXPECTED_MAIL_ATTACHMENT_SUBJECT)
    })

    it('when email is multipartalternative without attachments it returns only Mail', async () => {
        setupHtmlMessageWithoutAttachments()

        let result = await service.getAttachments(EXPECTED_ID)
        expect(result.length).toBe(1)
        expect(result[0].id).toEqual(MAIL_CONTENT_ATTACHMENT_ID)
        expect(result[0].text).toEqual(EXPECTED_MAIL_ATTACHMENT_SUBJECT)
    })

    it('when email is multipartmixed with single attachment it returns mail and attachment', async () => {
        setupHtmlMessageWithInlineAttachmentAndAttachments()

        let result = await service.getAttachments(EXPECTED_ID)
        
        expect(result.length).toBe(4)
        expect(result[0].id).toEqual(MAIL_CONTENT_ATTACHMENT_ID)
        expect(result[0].text).toEqual(EXPECTED_MAIL_ATTACHMENT_SUBJECT)

        expect(result[1].id).toEqual("0.1")
        expect(result[1].text).toEqual(EXPECTED_INLINE_ATTACHMENT_NAME)

        expect(result[2].id).toEqual("1")
        expect(result[2].text).toEqual(EXPECTED_ATTACHMENT_NAME)

        expect(result[3].id).toEqual("2")
        expect(result[3].text).toEqual(EXPECTED_ATTACHMENT_NAME_2)
    })

    it('when email is multipartmixed with inline attachment it returns mail and attachment', async () => {
        setupHtmlMessageWithInlineAttachmentAndAttachments()

        let result = await service.getAttachments(EXPECTED_ID)
        expect(result.length).toBe(4)
        expect(result[0].id).toEqual(MAIL_CONTENT_ATTACHMENT_ID)
        expect(result[0].text).toEqual(EXPECTED_MAIL_ATTACHMENT_SUBJECT)

        expect(result[1].id).toEqual("0.1")
        expect(result[1].text).toEqual(EXPECTED_INLINE_ATTACHMENT_NAME)

        expect(result[2].id).toEqual("1")
        expect(result[2].text).toEqual(EXPECTED_ATTACHMENT_NAME)

        expect(result[3].id).toEqual("2")
        expect(result[3].text).toEqual(EXPECTED_ATTACHMENT_NAME_2)
    })

    it('when email is multipartmixed with inline and external attachment it teturns subjects and ids correctly', async () => {
        gmailClientMock.getMessage.and.returnValue(Promise.resolve(GmailMessageTestData.htmlMessageWithInlineAndExternalAttachmentsThatCausedTheInlineAttachmentIdToBeEmpty))

        let result = await service.getAttachments("1513992bf5325341")
        expect(result.length).toBe(9)
        expect(result[0].id).toEqual(MAIL_CONTENT_ATTACHMENT_ID)
        expect(result[0].text).toEqual("E-posttittel")

        expect(result[1].id).toEqual("0.1")
        expect(result[1].text).toEqual("image001.png")

        expect(result[2].id).toEqual("1")
        expect(result[2].text).toEqual("Pdffil1.pdf")

        expect(result[3].id).toEqual("2")
        expect(result[3].text).toEqual("Pdffil2.pdf")

        expect(result[4].id).toEqual("3")
        expect(result[4].text).toEqual("Pdffil3.pdf")

        expect(result[5].id).toEqual("4")
        expect(result[5].text).toEqual("Pdffil4.pdf")

        expect(result[6].id).toEqual("5")
        expect(result[6].text).toEqual("Pdffil5.pdf")

        expect(result[7].id).toEqual("6")
        expect(result[7].text).toEqual("Pdffil6.pdf")

        expect(result[8].id).toEqual("7")
        expect(result[8].text).toEqual("Pdffil7.pdf")
    })

    it('when email is multipartmixed with multipartrelated plaintext mail and attachment it returns mail and attachment', async () => {
        gmailClientMock.getMessage.and.returnValue(Promise.resolve(GmailMessageTestData.htmlMessageWithInlineAttachment))

        let result = await service.getAttachments(EXPECTED_ID)
        
        expect(result.length).toBe(2)
        expect(result[0].id).toEqual(MAIL_CONTENT_ATTACHMENT_ID)
        expect(result[0].text).toEqual(EXPECTED_MAIL_ATTACHMENT_SUBJECT)

        expect(result[1].id).toEqual("1")
        expect(result[1].text).toEqual(EXPECTED_INLINE_ATTACHMENT_NAME)
    })

    it('when email contains attachment that is not verified by filetype registry service it is not importable', async () => {
        gmailClientMock.getMessage.and.returnValue(Promise.resolve(GmailMessageTestData.plainTextMessageWithAttachments))
        fileTypeRegistryMock.isValid.and.callFake(extension => Promise.resolve(extension == 'html' || extension != 'txt'))

        let result = await service.getAttachments(EXPECTED_ID)

        expect(result[1].isImportable).toBe(false)
        expect(result[2].isImportable).toBe(true)
    })

    it('email attachment is always marked as importable', async () => {
        gmailClientMock.getMessage.and.returnValue(Promise.resolve(GmailMessageTestData.plainTextMessageWithAttachments))

        let result = await service.getAttachments(EXPECTED_ID)

        expect(result[0].isImportable).toBe(true)
    })

    it('email attachment that does not have extension is not importable', async () => {
        gmailClientMock.getMessage.and.returnValue(Promise.resolve(GmailMessageTestData.htmlMessageWithAttachmentWithoutExtension))

        let result = await service.getAttachments(EXPECTED_ID)

        expect(result[1].isImportable).toBe(false)
    })

    it('correctly returns every attachment from message in rfc822 format', async () => {
        gmailClientMock.getMessage.and.returnValue(Promise.resolve(GmailMessageTestData.htmlMessageWithInlineMessageRfc822AttachmentThatDoesNotShowAttachmentsUpInList))

        let result = await service.getAttachments("155e914c15c30cf3")
        
        expect(result.length).toBe(5)

        expect(result[0].id).toEqual(MAIL_CONTENT_ATTACHMENT_ID)
        expect(result[0].text).toEqual("VS: Tegning")

        expect(result[1].id).toEqual("0.1")
        expect(result[1].text).toEqual("image001.jpg")

        expect(result[2].id).toEqual("1.0.0.1")
        expect(result[2].text).toEqual("image002.png")

        expect(result[3].id).toEqual("1.0.0.2")
        expect(result[3].text).toEqual("image003.jpg")

        expect(result[4].id).toEqual("1.0.1")
        expect(result[4].text).toEqual("Narvik Storsenter 109.pdf")
    })
})