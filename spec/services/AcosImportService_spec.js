describe('AcosImportService', () => {
    const he = require('he')
    const AcosImportService = require('../../src/services/AcosImportService')
    const GmailMessageTestData = require('../GmailMessageTestData')
    var service, n4wsBridgeMock, noarkIncomingMock, noarkOutgoingMock, sessionMock, gmailMock, departmentMock, adMock, logMock,
        addressRegistryMock, departmentUserRegistryMock, attachmentServiceMock, importLogMock, websakUserCheckMock, archiveIdMock,
        resultAddress, selectedAttachment2, selectedAttachment, selectedMailAttachment,
        twoAttachments, mailAttachment, attachment, attachment2, noAttachments, draft,
        result, incomingJournpost, outgoingJourpost

    const TEST_RESPONSE_OK_JOURNAL_POST_ID = "2016100001", DLTYPE_HOVEDDOKUMENT = "H", DLTYPE_VEDLEGG = "V", DB_STATUS_B_UNDERBEHANDLING = "B", DB_CATEGORY_EP_EPOST = "EP", VE_VARIANT_P_PRODUCTION_FORMAT = "P",
        JOURNALPOST_STATUS_S = "S", ARCHIVE_ID_ID_PART_NO_ZERO = "1", ARCHIVE_ID_ID_PART_FULL = "313373", ARCHIVE_ID_YEAR_PART = "2016", MESSAGE_INVALID_ARCHIVE_TITLE = "ArkivsakTittel er ugyldig.",
        MESSAGE_INVALID_ARCHIVE_ID = "ArkivsakId er ugyldig.", MESSAGE_INVALID_ARCHIVE_DOCUMENTTYPE = "ArkivsakDokumentType er ugyldig.", MESSAGE_INVALID_DEPARTMENT_FOR_USER = "Brukeren er ikke satt opp riktig i Websak.",
        MESSAGE_INVALID_USER = "Ugyldig e-postadresse, er ikke koblet opp mot bruker.", MESSAGE_INVALID_SENDER_NAME = "Navnet til avsender er ugyldig.", MESSAGE_INVALID_MULTIPLE_MAIN_DOCUMENT = "Det er valgt flere enn ett hoveddokument.",
        MESSAGE_INVALID_NO_MAIN_DOCUMENT = "Det er ikke valgt hoveddokument.", INVALID_TOO_LONG_ARCHIVE_ID = "20160000001", INVALID_NON_NUMERIC_ARCHIVE_ID = "abcdefghij", INCOMING_DOCUMENTTYPE_ID = "I",
        OUTGOING_DOCUMENTTYPE_ID = "U", NOTE_WITHOUT_FOLLOWUP_DOCUMENTTYPE_ID = "X", VALID_ARCHIVE_TITLE = "Test tittel", VALID_ARCHIVE_ID_WITH_ZERO = "2016000001", VALID_ARCHIVE_ID_WITHOUT_ZERO = "2016313373",
        TEST_MAIL_ADDRESS = "gmailsak@example.com", TEST_DRAFT_SENDER_NAME = "SENDER_NAME", TEST_JOURNAL_UNIT = "IT", TEST_ADMIN_UNIT = "PM", TEST_USERNAME = "GSAK", TEST_DRAFT_SENDER_ADDRESS = "Testveien 3",
        TEST_DRAFT_SENDER_ZIPCODE = "8516", TEST_DRAFT_SENDER_CITY = "NARVIK", TEST_DRAFT_SENDER_MAIL_ADDRESS = "websaksender@example.com", TEST_NAME = "Gmail Sak", TEST_CODE_SENDER_GID_ID = "7771",
        TEST_CODE_SENDER_CODE = "SENDCODE", TEST_CODE_SENDER_NAME = "Sender Sendersen", TEST_CODE_SENDER_ADDRESS = "Sendveien 42", TEST_CODE_SENDER_ZIPCODE = "8517", TEST_CODE_SENDER_CITY = "SENDVIK",
        TEST_CODE_SENDER_MAIL_ADDRESS = "sender@example.com", TEST_MAIL_ID = "15307bf8d93b04ec", TEST_MAIL_ATTACHMENT_ID = "2", TEST_MAIL_ATTACHMENT_FILENAME = "minimal.html", TEST_MAIL_ATTACHMENT_ID_2 = "1",
        TEST_MAIL_ATTACHMENT_FILENAME_2 = "informasjon.txt", TEST_MAIL_ATTACHMENT_CONTENT = "QXR0YWNobWVudDE=", TEST_MAIL_ATTACHMENT_CONTENT_2 = "QXR0YWNobWVudDI=", TEST_MAIL_ATTACHMENT_CONTENT_3 = "QXR0YWNobWVudDM=",
        TEST_MAIL_MAILMESSAGE_ID = "68dbdf13b423ade4121dd9466ebc4362", TEST_MAIL_MAILMESSAGE_SUBJECT = "RE: Testmail", TEST_RESPONSE_ERROR_MESSAGE = "Testbeskjed",
        TEST_RESPONSE_EXCEPTION_MESSAGE = "Det oppstod en uhåndtert feil under import.", MESSAGE_INVALID_ATTACHMENTS = "Vedleggslisten er tom.", TEST_RESPONSE_ERROR_CODE = "ERROR",
        JOURNALPOST_STATUS_R = "R", TEST_CODE_INVALID_CODE = "IVLD", MESSAGE_INVALID_SENDER_CODE = "Avsenderkoden er ikke gyldig.", TEST_HANDLER_CODE = "HCODE", TEST_HANDLER_USERNAME = "HCODE",
        MESSAGE_INVALID_HANDLER_CODE = "Saksbehandlerkoden er ikke gyldig.", TEST_HANDLER_NAME = "Saksbehandler", MESSAGE_INVALID_HANDLER_USER = "Du har ikke tilgang til å importere som en annen saksbehandler.",
        MESSAGE_ARCHIVE_ID_SERVICE_ERROR = "ArchiveIdService error", MESSAGE_DUPLICATE_SENDER_CODE = "Kan ikke importere journalpost med kontakt som har duplikate koder.", AMIHTYPE_FOR_HANDLER = "0",
        AMIHTYPE_FOR_RECEIVER = "1", AMBEHANSV_FOR_HANDLER = "1", TEST_RECEIVER_ADMIN_UNIT = "RECEIVER_ADMIN_UNIT", TEST_RECEIVER_JOURNAL_UNIT = "RECEIVER_JOURNAL_UNIT", TEST_RECEIVER_USERNAME = "sendcode",
        MESSAGE_INVALID_DEPARTMENT_FOR_RECEIVER = "Oppgitt mottaker tilhører ikke en enhet.", MESSAGE_INVALID_USERNAME_FOR_RECEIVER = "Oppgitt mottaker er ikke en gyldig saksbehandler.",
        TEST_MAIL_INLINE_ATTACHMENT_TOKEN_1 = "ANGjdJ9smr-IjltI5tpTDr5VAPQ54hPo95IGs2Ey50Xk5Sg7XmeWtD4x5_67Cfnuj3XZzq0P8WCuss1kSfmQv4qODOiXqntYM_-aFUCAyYN-asTp_EUWXdvQKvF9TDMeTNo86ns6MXGrQuqv6uOp6QjPN_pAJO7Whq2Ir_O1UYjYD41aFfSdbbqED8kyFAnJSKQoW7UeQA7NUrjwj4-6Ti3dUFU_TKyzhT95gLEnl8SWE-un7euQhbXIKzyAQJAmXAhCE5IYkUQYkXAwduvhvRA5FLcWE2DoH0ngwIBB-g5OXilVZk8-ejdR8Ppd_AA",
        TEST_MAIL_INLINE_ATTACHMENT_TOKEN_2 = "ANGjdJ9Jd7IyjecF0i2iz_J16wscEJSa4c_AmbL2JFnVoWcrOxJOLhuO-ghBuvB-OCHEWBPfE9apN5l8vCTD3y8iSagPHYtSg9zXpZv80eDUNkzDPllPfbQMQpmBs7RqSWC55mn-gA9yQNAIFsB6sgSoT-InEdfSA0c50Y3R7gCvmZgawAlP--2qD473MjhKhaRaO3hJTV5LmAt2_96iwqDXchmzfAt5mxR4Blf3qoKG7BIaYa3-h-Iqr-Rn4l7Emc-wLbXwiHyuy2SzL9HoHfukwQUi2IY4bpEEqkFpO-HMR8syLpbOfvnGqSbV0G4",
        TEST_MAIL_INLINE_ATTACHMENT_CONTENT = "Qk1CAAAAAAAAAD4AAAAoAAAAAQAAAAEAAAABAAEAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP///wCAAAAA",
        TEST_MAIL_ATTACHMENT_TOKEN_1 = "ANGjdJ9JYM7THfklGi85oft8rtxnPxGhry0R7OUbRtBoRxn17HJysx4-PFe3faDi7fDEUFcur5D8XwiLmq3G6HNis_lvBalUzcNlU-iqxXAngYA1V7CtlIqCHnrKZSkBQnUBNVKmtL3tdBlPhEB42N_FIUtKYSHjKMIaP7jpyY1rDp98-L7PYu5DCC7xGPT89y-U9R2mDh-HxFUmCeKUfd0vkualdFaIKlJ4lX_z88BkSnAO9Q_QpoQ-1Pj1P52NsyG20kc_S_CVayOhBC9CnPFTCcwwE9kgrmb2RT7DXtqF7y8ODjA0ZcfU110ADJ8",
        TEST_MAIL_ATTACHMENT_TOKEN_2 = "ANGjdJ_QwiRTiLf-7Q4fb2N_OmwqRZxA_4EAbueBGrGjhuiKB6_fIQPuoHfYLKm39YZShNnqfbe4UbIMddCOPbM0EoH7TXafVTgjdEXYzS8nqJ17OA3VlVtH8Jj836SfnHIn0drAGN-bSUwoNU3cTbw-LCV9F4Gbe01voPnQUQEVdTVWb0ZTcDi19mvsdwwstijl8PGKxxLBPnA2doeQ6uzGJVPtl-tmLzuKg9kGow",
        TEST_MAIL_ATTACHMENT_TOKEN_3 = "ANGjdJ8alie166uRn7miiGaFnrQJmcxJRLFM43ImnD6BSvSp8Fll8jj323lGo4_3cauI0PAKSooA7eoDFbb8n9YhUDG5E3QqyWfYVIPBHukW94Ewq6SCXLQxLT6QME5GYzKOzsO4-bPrmCAckrqjQ44M5zjcDl1IEh6zQtn1l1K4Xeupc-IuSuIR9wIpLaAr-PCg38IE3TVkECNJUfc8Soe4XiaF8tVBoxB-GH1d7UEKIbDc16D6wWO8QZmkZoH42b8L4JGn9ePy80kPjpUtLxfRbC9Htd-owvoHzRhU9wyBmwaq-crJpRdGhOGATgM",
        TEST_MAIL_ATTACHMENT_TOKEN_4 = "ANGjdJ8X7-BdDOjN_BndiWEAsd1xenSSyWe4CePIGGRtW9h0xtV7agqTibWPlXxjumcsJMQKrmEeP3vteyNdCbPAdV5hmLTsAnKhGa-drLgv3pLuudLLqsZBcYvAOz5xO5VRb10ebvJF_fVewLY_1hvySJST7flyKOGxyLDB6bFnsUA8ntf-EkgdEVp9br0vdxmbWBS-5qtXKGHohppDIqrLTHdLFMXoFU0DQ_eaPkFQ912Z9Xo-mWCac8SywZemkwuQJ8pU11bxBnUpmZ-yV_8htudBC5NQQoUtQaNbIBh4I2uxyjAnfxYWre9zUKA",
        TEST_MAIL_TEMPLATE = createFormatMailTemplate`${0}${1}${2}${3}${4}${5}${6}`

    function createFormatMailTemplate(strings, ...keys) {
        return (function (...values) {
            let dict = values[values.length - 1] || {};
            let result = [strings[0]];
            keys.forEach(function (key, i) {
                let value = Number.isInteger(key) ? values[key] : dict[key];
                result.push(value, strings[i + 1]);
            });
            return result.join('');
        });
    }

    beforeEach(() => {
        incomingJournpost = undefined
        outgoingJourpost = undefined

        logMock = jasmine.createSpyObj('log', ['error'])

        noarkIncomingMock = jasmine.createSpyObj('NoarkIncoming', ['putJournpost'])
        noarkIncomingMock.putJournpost.and.callFake(journPost => {
            incomingJournpost = journPost
            return Promise.resolve({ message: TEST_RESPONSE_OK_JOURNAL_POST_ID, status: "jp.id" })
        })
        noarkOutgoingMock = jasmine.createSpyObj('NoarkOutgoing', ['putJournpost'])
        noarkOutgoingMock.putJournpost.and.callFake(journPost => { outgoingJourpost = journPost })

        n4wsBridgeMock = jasmine.createSpyObj('N4wsBridgeService', ['createJournpostTypeBaseObject', 'createDokumentTypeBaseObject', 'createAvsMotTypeBaseObject', 'createIncomingNoarkService', 'createOutgoingNoarkService'])
        n4wsBridgeMock.createJournpostTypeBaseObject.and.callFake(() => { return Object.assign({}, { jpJdato: '', dokument: [], avsmot: [], jpStatus: '', jpForfdato: '', jpDokdato: '', jpNdoktype: '', jpInnhold: '', jpOffinnhold: '', jpSaar: '', jpSaseknr: '' }) })
        n4wsBridgeMock.createDokumentTypeBaseObject.and.callFake(() => { return Object.assign({}, { dlRnr: '', veVariant: '', dbKategori: '', dbStatus: '', dlType: '', dlType: '', dbTittel: '', veDokformat: '', fil: { base64: '' } }) })
        n4wsBridgeMock.createAvsMotTypeBaseObject.and.callFake(() => { return Object.assign({}, { amIhtype: '', amKortnavn: '', amAdmkort: '', amJenhet: '', amIhtype: '', amBehansv: '', amSbhinit: '', amSbhnavn: '', amKortnavn: '', amNavn: '', amAdresse: '', amPostnr: '', amPoststed: '', amEpostadr: '', amNavn: '', amAdresse: '', amPostnr: '', amPoststed: '', amEpostadr: '', amAdmkort: '', amJenhet: '' }) })
        n4wsBridgeMock.createIncomingNoarkService.and.returnValue(noarkIncomingMock)
        n4wsBridgeMock.createOutgoingNoarkService.and.returnValue(noarkOutgoingMock)

        sessionMock = jasmine.createSpyObj('Session', ['getUserEmail'])
        sessionMock.getUserEmail.and.returnValue(TEST_MAIL_ADDRESS)

        gmailMock = jasmine.createSpyObj('GmailClientService', ['getMessage', 'getAttachment'])
        gmailMock.getMessage.and.callFake(mailId => { if (mailId == TEST_MAIL_ID) return Promise.resolve(GmailMessageTestData.plainTextMessageWithoutAttachments) })
        gmailMock.getAttachment.and.callFake((mailId, attachmentId) => {
            if (mailId === TEST_MAIL_ID && attachmentId === TEST_MAIL_ATTACHMENT_TOKEN_1) return Promise.resolve(TEST_MAIL_ATTACHMENT_CONTENT)
            else if (mailId === TEST_MAIL_ID && attachmentId === TEST_MAIL_ATTACHMENT_TOKEN_3) return Promise.resolve(TEST_MAIL_ATTACHMENT_CONTENT_3)
            else if (mailId === TEST_MAIL_ID && attachmentId === TEST_MAIL_ATTACHMENT_TOKEN_4) return Promise.resolve(TEST_MAIL_ATTACHMENT_CONTENT_2)
            else if (mailId === TEST_MAIL_ID && attachmentId === TEST_MAIL_ATTACHMENT_TOKEN_2) return Promise.resolve(TEST_MAIL_ATTACHMENT_CONTENT_2)
            else if (mailId === TEST_MAIL_ID && attachmentId === TEST_MAIL_INLINE_ATTACHMENT_TOKEN_1) return Promise.resolve(TEST_MAIL_INLINE_ATTACHMENT_CONTENT)
            else if (mailId === TEST_MAIL_ID && attachmentId === TEST_MAIL_INLINE_ATTACHMENT_TOKEN_2) return Promise.resolve(TEST_MAIL_INLINE_ATTACHMENT_CONTENT)
        })

        adMock = jasmine.createSpyObj('ActiveDirectoryService', ['lookupEmail'])
        adMock.lookupEmail.and.callFake(mail => { if (mail === TEST_MAIL_ADDRESS) return Promise.resolve({ username: TEST_USERNAME, displayname: TEST_NAME }) })

        departmentMock = jasmine.createSpyObj('WebsakDepartmentService', ['getDepartmentForUser'])
        departmentMock.getDepartmentForUser.and.callFake(samAccountName => {
            if (samAccountName === TEST_USERNAME) return Promise.resolve({ journalUnit: TEST_JOURNAL_UNIT, departmentCode: TEST_ADMIN_UNIT })
            else if (samAccountName === TEST_HANDLER_CODE) return Promise.resolve({ journalUnit: TEST_JOURNAL_UNIT, departmentCode: TEST_ADMIN_UNIT })
            else if (samAccountName === TEST_RECEIVER_USERNAME) return Promise.resolve({ journalUnit: TEST_RECEIVER_JOURNAL_UNIT, departmentCode: TEST_RECEIVER_ADMIN_UNIT })
        })

        departmentUserRegistryMock = jasmine.createSpyObj('DepartmentUserRegistryService', ['lookupUser'])
        departmentUserRegistryMock.lookupUser.and.callFake(username => {
            if (username === TEST_HANDLER_CODE) return Promise.resolve({ code: TEST_HANDLER_CODE, name: TEST_HANDLER_NAME })
            else if (username === "invalid") return Promise.resolve({ code: '', name: '' })
            else if (username === TEST_RECEIVER_USERNAME) return Promise.resolve({ code: TEST_RECEIVER_USERNAME, name: '' })
        })

        websakUserCheckMock = jasmine.createSpyObj('WebsakUserCheckService', ['getUserStatus'])
        websakUserCheckMock.getUserStatus.and.returnValue(Promise.resolve({ chooseHandler: false, valid: false }))

        resultAddress = { id: TEST_CODE_SENDER_GID_ID, code: TEST_CODE_SENDER_CODE, name: TEST_CODE_SENDER_NAME, address1: TEST_CODE_SENDER_ADDRESS, zipcode: TEST_CODE_SENDER_ZIPCODE, city: TEST_CODE_SENDER_CITY, mail: TEST_CODE_SENDER_MAIL_ADDRESS, duplicate: false }

        addressRegistryMock = jasmine.createSpyObj('AddressRegistryService', ['lookupCode'])
        addressRegistryMock.lookupCode.and.callFake(code => { if (code === TEST_CODE_SENDER_CODE) return Promise.resolve([resultAddress]) })

        mailAttachment = { id: TEST_MAIL_MAILMESSAGE_ID, text: TEST_MAIL_MAILMESSAGE_SUBJECT, isImportable: false }
        attachment = { id: TEST_MAIL_ATTACHMENT_ID, text: TEST_MAIL_ATTACHMENT_FILENAME, isImportable: false }
        attachment2 = { id: TEST_MAIL_ATTACHMENT_ID_2, text: TEST_MAIL_ATTACHMENT_FILENAME_2, isImportable: false }
        noAttachments = [mailAttachment]
        twoAttachments = [mailAttachment, attachment, attachment2]

        attachmentServiceMock = jasmine.createSpyObj('AttachmentsService', ['getAttachments'])
        attachmentServiceMock.getAttachments.and.callFake(mailId => { if (mailId === TEST_MAIL_ID) { return Promise.resolve(noAttachments) } })

        importLogMock = jasmine.createSpyObj('ImportLogService', ['logImport'])

        archiveIdMock = jasmine.createSpyObj('ArchiveIdService', ['getArchive'])

        selectedMailAttachment = { attachmentId: TEST_MAIL_MAILMESSAGE_ID, mainDocument: true }
        selectedAttachment = { attachmentId: TEST_MAIL_ATTACHMENT_ID, mainDocument: false }
        selectedAttachment2 = { attachmentId: TEST_MAIL_ATTACHMENT_ID_2, mainDocument: false }

        draft = { mailId: TEST_MAIL_ID, archiveId: VALID_ARCHIVE_ID_WITH_ZERO, title: VALID_ARCHIVE_TITLE, documentType: INCOMING_DOCUMENTTYPE_ID, attachments: [selectedMailAttachment, selectedAttachment, selectedAttachment2], senderName: TEST_DRAFT_SENDER_NAME, senderAddress: TEST_DRAFT_SENDER_ADDRESS, senderMail: TEST_DRAFT_SENDER_MAIL_ADDRESS, senderZipCode: TEST_DRAFT_SENDER_ZIPCODE, senderCity: TEST_DRAFT_SENDER_CITY }

        service = new AcosImportService(logMock, n4wsBridgeMock, gmailMock, departmentMock, adMock,
            addressRegistryMock, departmentUserRegistryMock, attachmentServiceMock, importLogMock, websakUserCheckMock, archiveIdMock, he, TEST_MAIL_TEMPLATE)
    })

    function extractAttachmentFromJournalPost(rnr) {
        for (var i = 0; i < result.dokument.length; ++i) {
            var attachment = result.dokument[i]
            if (attachment.dlRnr === rnr) {
                return attachment
            }
        }

        return undefined
    }

    function getJournPostRequestTypeOutgoing() {
        return outgoingJourpost
    }

    function getJournPostRequestTypeIncoming() {
        return incomingJournpost
    }

    it('sets arkivSakId correctlyb ased on archiveId given in request when caseId contains leading zeroes', async () => {
        await service.importJournalPost(sessionMock, draft)

        result = getJournPostRequestTypeIncoming()

        expect(result.jpSaar).toEqual(ARCHIVE_ID_YEAR_PART)
        expect(result.jpSaseknr).toEqual(ARCHIVE_ID_ID_PART_NO_ZERO)
    })

    it('sets arkivSakId correctly based on archiveId given in request when caseId contains no leading zeroes', async () => {
        draft.archiveId = VALID_ARCHIVE_ID_WITHOUT_ZERO

        await service.importJournalPost(sessionMock, draft)

        result = getJournPostRequestTypeIncoming()

        expect(result.jpSaar).toEqual(ARCHIVE_ID_YEAR_PART)
        expect(result.jpSaseknr).toEqual(ARCHIVE_ID_ID_PART_FULL)
    })

    it('sets arkivSakId correctly based on archiveId given in request when type of archiveId is number', async () => {
        draft.archiveId = 2016313373

        await service.importJournalPost(sessionMock, draft)

        result = getJournPostRequestTypeIncoming()

        expect(result.jpSaar).toEqual(ARCHIVE_ID_YEAR_PART)
        expect(result.jpSaseknr).toEqual(ARCHIVE_ID_ID_PART_FULL)
    })

    it('throwsExceptionIfLengthOfArchiveIdIsTooShort', async () => {
        draft.archiveId = '1'

        let importResult = await service.importJournalPost(sessionMock, draft)

        expect(importResult).toEqual({ status: TEST_RESPONSE_ERROR_CODE, message: MESSAGE_INVALID_ARCHIVE_ID })
        expect(logMock.error).toHaveBeenCalledWith(new Error(MESSAGE_INVALID_ARCHIVE_ID))
    })

    it('throwsExceptionIfLengthOfArchiveIdIsTooLong', async () => {
        draft.archiveId = INVALID_TOO_LONG_ARCHIVE_ID

        let importResult = await service.importJournalPost(sessionMock, draft)

        expect(importResult).toEqual({ status: TEST_RESPONSE_ERROR_CODE, message: MESSAGE_INVALID_ARCHIVE_ID })
        expect(logMock.error).toHaveBeenCalledWith(new Error(MESSAGE_INVALID_ARCHIVE_ID))
    })

    it('throwsExceptionArchiveIdServiceThrowsException', async () => {
        archiveIdMock.getArchive.and.callFake(archiveId => { if (archiveId === VALID_ARCHIVE_ID_WITH_ZERO) { return Promise.reject(Error(MESSAGE_ARCHIVE_ID_SERVICE_ERROR)) } })
        draft.archiveId = VALID_ARCHIVE_ID_WITH_ZERO

        let importResult = await service.importJournalPost(sessionMock, draft)

        expect(importResult).toEqual({ status: TEST_RESPONSE_ERROR_CODE, message: MESSAGE_ARCHIVE_ID_SERVICE_ERROR })
        expect(logMock.error).toHaveBeenCalledWith(new Error(MESSAGE_ARCHIVE_ID_SERVICE_ERROR))
    })

    it('throwsExceptionIfArchiveIdContainsNonNumericCharacters', async () => {
        draft.archiveId = INVALID_NON_NUMERIC_ARCHIVE_ID

        let importResult = await service.importJournalPost(sessionMock, draft)

        expect(importResult).toEqual({ status: TEST_RESPONSE_ERROR_CODE, message: MESSAGE_INVALID_ARCHIVE_ID })
        expect(logMock.error).toHaveBeenCalledWith(new Error(MESSAGE_INVALID_ARCHIVE_ID))
    })

    it('setsArkivSakTittelCorrectlyBasedOnTitleGivenInRequest', async () => {
        await service.importJournalPost(sessionMock, draft)

        result = getJournPostRequestTypeIncoming()

        expect(result.jpInnhold).toEqual('')
        expect(result.jpOffinnhold).toEqual(VALID_ARCHIVE_TITLE)
    })

    it('throwsExceptionIfTitleIsEmpty', async () => {
        draft.title = ''

        let importResult = await service.importJournalPost(sessionMock, draft)

        expect(importResult).toEqual({ status: TEST_RESPONSE_ERROR_CODE, message: MESSAGE_INVALID_ARCHIVE_TITLE })
        expect(logMock.error).toHaveBeenCalledWith(new Error(MESSAGE_INVALID_ARCHIVE_TITLE))
    })

    it('throwsExceptionIfTitleIsNull', async () => {
        draft.title = undefined

        let importResult = await service.importJournalPost(sessionMock, draft)

        expect(importResult).toEqual({ status: TEST_RESPONSE_ERROR_CODE, message: MESSAGE_INVALID_ARCHIVE_TITLE })
        expect(logMock.error).toHaveBeenCalledWith(new Error(MESSAGE_INVALID_ARCHIVE_TITLE))
    })

    it('setsArkivSakDokumentTypeCorrectlyBasedOnDocumentTypeGivenInRequest', async () => {
        await service.importJournalPost(sessionMock, draft)

        result = getJournPostRequestTypeIncoming()

        expect(result.jpNdoktype).toEqual(INCOMING_DOCUMENTTYPE_ID)
    })

    it('throwsExceptionIfDocumentTypeIsEmpty', async () => {
        draft.documentType = ''

        let importResult = await service.importJournalPost(sessionMock, draft)

        expect(importResult).toEqual({ status: TEST_RESPONSE_ERROR_CODE, message: MESSAGE_INVALID_ARCHIVE_DOCUMENTTYPE })
        expect(logMock.error).toHaveBeenCalledWith(new Error(MESSAGE_INVALID_ARCHIVE_DOCUMENTTYPE))
    })

    it('throwsExceptionIfDocumentTypeIsNull', async () => {
        draft.documentType = undefined

        let importResult = await service.importJournalPost(sessionMock, draft)

        expect(importResult).toEqual({ status: TEST_RESPONSE_ERROR_CODE, message: MESSAGE_INVALID_ARCHIVE_DOCUMENTTYPE })
        expect(logMock.error).toHaveBeenCalledWith(new Error(MESSAGE_INVALID_ARCHIVE_DOCUMENTTYPE))
    })

    it('throwsExceptionIfDocumentTypeIsTooLong', async () => {
        draft.documentType = 'IU'

        let importResult = await service.importJournalPost(sessionMock, draft)

        expect(importResult).toEqual({ status: TEST_RESPONSE_ERROR_CODE, message: MESSAGE_INVALID_ARCHIVE_DOCUMENTTYPE })
        expect(logMock.error).toHaveBeenCalledWith(new Error(MESSAGE_INVALID_ARCHIVE_DOCUMENTTYPE))
    })

    it('throwsExceptionIfDocumentTypeIsNotValid', async () => {
        draft.documentType = 'A'

        let importResult = await service.importJournalPost(sessionMock, draft)

        expect(importResult).toEqual({ status: TEST_RESPONSE_ERROR_CODE, message: MESSAGE_INVALID_ARCHIVE_DOCUMENTTYPE })
        expect(logMock.error).toHaveBeenCalledWith(new Error(MESSAGE_INVALID_ARCHIVE_DOCUMENTTYPE))
    })

    it('setsJournalStatusToMAsDefaultValueForIncomingDocuments', async () => {
        draft.documentType = 'I'

        await service.importJournalPost(sessionMock, draft)

        result = getJournPostRequestTypeIncoming()

        expect(result.jpStatus).toEqual(JOURNALPOST_STATUS_S)
    })

    it('setsJournalStatusToRAsDefaultValueForOutgoingDocuments', async () => {
        draft.documentType = 'U'

        await service.importJournalPost(sessionMock, draft)

        result = getJournPostRequestTypeOutgoing()

        expect(result.jpStatus).toEqual(JOURNALPOST_STATUS_R)
    })

    it('setsJournalStatusToRAsDefaultValueForNoteWithoutFollowup', async () => {
        draft.documentType = NOTE_WITHOUT_FOLLOWUP_DOCUMENTTYPE_ID

        await service.importJournalPost(sessionMock, draft)

        result = getJournPostRequestTypeOutgoing()

        expect(result.jpStatus).toEqual(JOURNALPOST_STATUS_R)
    })

    it('doesNotSetSenderDetailsForNoteWithoutFollowupSinceItOnlyShouldNotContainThis', async () => {
        draft.documentType = NOTE_WITHOUT_FOLLOWUP_DOCUMENTTYPE_ID

        await service.importJournalPost(sessionMock, draft)

        result = getJournPostRequestTypeOutgoing()

        // Dette er informasjon som Websak fjerner hvis den importerte oppføringen endres på noen måte etter import.  
        expect(result.avsmot[0].amNavn).toEqual('')
        expect(result.avsmot[0].amAdresse).toEqual('')
        expect(result.avsmot[0].amPostnr).toEqual('')
        expect(result.avsmot[0].amPoststed).toEqual('')
        expect(result.avsmot[0].amEpostadr).toEqual('')
    })

    it('setsCorrectValuesForAvsmotObjectForNoteWithoutFollowupWithoutSenderCode', async () => {
        draft.documentType = NOTE_WITHOUT_FOLLOWUP_DOCUMENTTYPE_ID
        draft.senderCode = undefined

        await service.importJournalPost(sessionMock, draft)

        result = getJournPostRequestTypeOutgoing()

        expect(result.avsmot[0].amIhtype).toEqual(AMIHTYPE_FOR_HANDLER)
        expect(result.avsmot[0].amBehansv).toEqual(AMBEHANSV_FOR_HANDLER)
        expect(result.avsmot[0].amAdmkort).toEqual(TEST_ADMIN_UNIT)
        expect(result.avsmot[0].amJenhet).toEqual(TEST_JOURNAL_UNIT)
        expect(result.avsmot[0].amSbhinit).toEqual(TEST_USERNAME.toUpperCase())
        expect(result.avsmot[0].amSbhnavn).toEqual(TEST_NAME)
    })

    it('setsCorrectValuesForHandlerAvsmotObjectForNoteWithoutFollowupWithSenderCode', async () => {
        draft.documentType = NOTE_WITHOUT_FOLLOWUP_DOCUMENTTYPE_ID
        draft.senderCode = TEST_RECEIVER_USERNAME

        await service.importJournalPost(sessionMock, draft)

        result = getJournPostRequestTypeOutgoing()

        // Saksbehandler må være siste Avsmot-objekt, ellers blir ikke eier av journalposten satt riktig.
        expect(result.avsmot[1].amIhtype).toEqual(AMIHTYPE_FOR_HANDLER)
        expect(result.avsmot[1].amBehansv).toEqual(AMBEHANSV_FOR_HANDLER)
        expect(result.avsmot[1].amAdmkort).toEqual(TEST_ADMIN_UNIT)
        expect(result.avsmot[1].amJenhet).toEqual(TEST_JOURNAL_UNIT)
        expect(result.avsmot[1].amSbhinit).toEqual(TEST_USERNAME.toUpperCase())
        expect(result.avsmot[1].amSbhnavn).toEqual(TEST_NAME)
    })

    it('setsCorrectValuesForReceiverAvsmotObjectForNoteWithoutFollowupWithSenderCode', async () => {
        draft.documentType = NOTE_WITHOUT_FOLLOWUP_DOCUMENTTYPE_ID
        draft.senderCode = TEST_RECEIVER_USERNAME

        await service.importJournalPost(sessionMock, draft)

        result = getJournPostRequestTypeOutgoing()

        expect(result.avsmot[0].amIhtype).toEqual(AMIHTYPE_FOR_RECEIVER)
        expect(result.avsmot[0].amKortnavn).toEqual(TEST_RECEIVER_USERNAME.toUpperCase())
        expect(result.avsmot[0].amAdmkort).toEqual(TEST_RECEIVER_ADMIN_UNIT)
        expect(result.avsmot[0].amJenhet).toEqual(TEST_RECEIVER_JOURNAL_UNIT)
    })

    it('throwsExceptionWhenDepartmentIsEmptyForGivenNoteWithoutFollowUpReceiver', async () => {
        draft.documentType = NOTE_WITHOUT_FOLLOWUP_DOCUMENTTYPE_ID
        draft.senderCode = TEST_RECEIVER_USERNAME
        departmentMock.getDepartmentForUser.and.callFake(samaccountname => {
            if (samaccountname === TEST_RECEIVER_USERNAME) { return Promise.resolve({ journalUnit: '', departmentCode: '' }) }
            else if (samaccountname === TEST_USERNAME) return Promise.resolve({ journalUnit: TEST_JOURNAL_UNIT, departmentCode: TEST_ADMIN_UNIT })
        })

        let importResult = await service.importJournalPost(sessionMock, draft)

        expect(importResult).toEqual({ status: TEST_RESPONSE_ERROR_CODE, message: MESSAGE_INVALID_DEPARTMENT_FOR_RECEIVER })
        expect(logMock.error).toHaveBeenCalledWith(new Error(MESSAGE_INVALID_DEPARTMENT_FOR_RECEIVER))
    })

    it('throwsExceptionWhenUserIsNotFoundForGivenNoteWithoutFollowUpReceiver', async () => {
        draft.documentType = NOTE_WITHOUT_FOLLOWUP_DOCUMENTTYPE_ID
        draft.senderCode = 'invalid'

        let importResult = await service.importJournalPost(sessionMock, draft)

        expect(importResult).toEqual({ status: TEST_RESPONSE_ERROR_CODE, message: MESSAGE_INVALID_USERNAME_FOR_RECEIVER })
        expect(logMock.error).toHaveBeenCalledWith(new Error(MESSAGE_INVALID_USERNAME_FOR_RECEIVER))
    })

    it('whenImportingAndAxisFaultGetsThrownBecauseOfSubqueryReturningMoreThanOneResultItGivesCustomMessageWithMoreInformation', async () => {
        // Exceptionclass: AxisFault
        // getMessage(): "e.getMessage()"	Server was unable to process request. ---> Error saving Journalpost 31.03.2017 00:00:00 ---> Subquery returned more than 1 value. This is not permitted when the subquery follows =, !=, <, <= , >, >= or when the subquery is used as an expression.
        // Det må sjekkes hvis addresseregisterservicen returnerer flere treff på oppgitt mottaker, ved å lage et nytt kall f.eks., som gir en bedre feilmelding enn dette det skal også tas høyde for dette i GUI.
        noarkIncomingMock.putJournpost.and.callFake(journpost => { return Promise.reject(Error("Server was unable to process request. ---> Error saving Journalpost 31.03.2017 00:00:00 ---> Subquery returned more than 1 value. This is not permitted when the subquery follows =, !=, <, <= , >, >= or when the subquery is used as an expression.")) })

        let importResult = await service.importJournalPost(sessionMock, draft)

        expect(importResult).toEqual({ status: TEST_RESPONSE_ERROR_CODE, message: MESSAGE_DUPLICATE_SENDER_CODE })
        expect(logMock.error).not.toHaveBeenCalled()
    })

    it('setsJournalPostBDatoToDateReceivedFromDateHeader', async () => {
        await service.importJournalPost(sessionMock, draft)

        result = getJournPostRequestTypeIncoming()

        expect(result.jpDokdato).toEqual('20160224')
    })

    it('whenDateReceivedFromDateHeaderContainsSingleDigitItDoesNotThrowFormattingExcetion', async () => {
        gmailMock.getMessage.and.callFake(mailId => { if (mailId === TEST_MAIL_ID) { return Promise.resolve(GmailMessageTestData.htmlMessageWithSingleDigitDate) } })

        try {
            await service.importJournalPost(sessionMock, draft)
        } catch (e) {
            fail("Should not fail on dates with single digit.")
        }
    })

    it('setsJournalPostJournalFoertDatoToCurrentDayTimestamp', async () => {
        await service.importJournalPost(sessionMock, draft)

        result = getJournPostRequestTypeIncoming()

        expect(result.jpJdato).toEqual(new Date().toISOString().slice(0, 10).replace(/-/g, ''))
    })

    it('setsJournalPostForfallsDatoToOneMonthInTheFuture', async () => {
        let date = new Date()
        date.setMonth(date.getMonth() + 1)

        await service.importJournalPost(sessionMock, draft)

        result = getJournPostRequestTypeIncoming()

        expect(result.jpForfdato).toEqual(date.toISOString().slice(0, 10).replace(/-/g, ''))
    })

    it('setsAvsenderMottakerAdminEnhetKortNavnFromDepartmentServiceBasedOnMailAddressFromGoogle', async () => {
        await service.importJournalPost(sessionMock, draft)

        result = getJournPostRequestTypeIncoming()

        expect(result.avsmot[0].amAdmkort).toEqual(TEST_ADMIN_UNIT)
    })

    it('setsAvsenderMottakerJournalEnhetFromDepartmentServiceBasedOnMailAddressFromGoogle', async () => {
        await service.importJournalPost(sessionMock, draft)

        result = getJournPostRequestTypeIncoming()

        expect(result.avsmot[0].amJenhet).toEqual(TEST_JOURNAL_UNIT)
    })

    it('throwsExceptionWhenDepartmentIsEmptyForGivenUser', async () => {
        departmentMock.getDepartmentForUser.and.callFake(samaccountname => { if (samaccountname === TEST_USERNAME) { return Promise.resolve({ journalUnit: '', departmentCode: '' }) } })

        let importResult = await service.importJournalPost(sessionMock, draft)

        expect(importResult).toEqual({ status: TEST_RESPONSE_ERROR_CODE, message: MESSAGE_INVALID_DEPARTMENT_FOR_USER })
        expect(logMock.error).toHaveBeenCalledWith(new Error(MESSAGE_INVALID_DEPARTMENT_FOR_USER))
    })

    it('throwsExceptionWhenUserIsNotMappedInActiveDirectory', async () => {
        adMock.lookupEmail.and.callFake(mail => { if (mail === TEST_MAIL_ADDRESS) { return Promise.resolve({ username: '', displayname: '' }) } })

        let importResult = await service.importJournalPost(sessionMock, draft)

        expect(importResult).toEqual({ status: TEST_RESPONSE_ERROR_CODE, message: MESSAGE_INVALID_USER })
        expect(logMock.error).toHaveBeenCalledWith(new Error(MESSAGE_INVALID_USER))
    })

    it('doesNotSetTgKodeOnJournalPostBecauseTheArchiveCaseControlsWhetherOrNotItIsGraded', async () => {
        await service.importJournalPost(sessionMock, draft)

        result = getJournPostRequestTypeIncoming()

        expect(undefined, result.jpTgkode)
    })

    it('setsAvsenderMottakerAmNavnToNameGivenInRequest', async () => {
        await service.importJournalPost(sessionMock, draft)

        result = getJournPostRequestTypeIncoming()

        expect(result.avsmot[0].amNavn).toEqual(TEST_DRAFT_SENDER_NAME)
    })

    it('setsAvsenderMottakerAmAdresseToAddressGivenInRequest', async () => {
        await service.importJournalPost(sessionMock, draft)

        result = getJournPostRequestTypeIncoming()

        expect(result.avsmot[0].amAdresse).toEqual(TEST_DRAFT_SENDER_ADDRESS)
    })

    it('setsAvsenderMottakerAmPostnrToZipCodeGivenInRequest', async () => {
        await service.importJournalPost(sessionMock, draft)

        result = getJournPostRequestTypeIncoming()

        expect(result.avsmot[0].amPostnr).toEqual(TEST_DRAFT_SENDER_ZIPCODE)
    })

    it('setsAvsenderMottakerAmPoststedToCityGivenInRequest', async () => {
        await service.importJournalPost(sessionMock, draft)

        result = getJournPostRequestTypeIncoming()

        expect(result.avsmot[0].amPoststed).toEqual(TEST_DRAFT_SENDER_CITY)
    })

    it('setsAvsenderMottakerAmEpostToMailAddressGivenInRequest', async () => {
        await service.importJournalPost(sessionMock, draft)

        result = getJournPostRequestTypeIncoming()

        expect(result.avsmot[0].amEpostadr).toEqual(TEST_DRAFT_SENDER_MAIL_ADDRESS)
    })

    it('throwsExceptionWhenSenderNameIsEmpty', async () => {
        draft.senderName = ''

        let importResult = await service.importJournalPost(sessionMock, draft)

        expect(importResult).toEqual({ status: TEST_RESPONSE_ERROR_CODE, message: MESSAGE_INVALID_SENDER_NAME })
        expect(logMock.error).toHaveBeenCalledWith(new Error(MESSAGE_INVALID_SENDER_NAME))
    })

    it('throwsExceptionWhenSenderNameIsNull', async () => {
        draft.senderName = undefined

        let importResult = await service.importJournalPost(sessionMock, draft)

        expect(importResult).toEqual({ status: TEST_RESPONSE_ERROR_CODE, message: MESSAGE_INVALID_SENDER_NAME })
        expect(logMock.error).toHaveBeenCalledWith(new Error(MESSAGE_INVALID_SENDER_NAME))
    })

    it('whenSenderCodeIsSetSenderValuesFromDraftAreDiscardedAndInformationGetsRetrievedFromService', async () => {
        draft.senderCode = TEST_CODE_SENDER_CODE

        await service.importJournalPost(sessionMock, draft)

        result = getJournPostRequestTypeIncoming()

        expect(result.avsmot[0].amNavn).not.toEqual(TEST_DRAFT_SENDER_NAME)
        expect(result.avsmot[0].amAdresse).not.toEqual(TEST_DRAFT_SENDER_ADDRESS)
        expect(result.avsmot[0].amPostnr).not.toEqual(TEST_DRAFT_SENDER_ZIPCODE)
        expect(result.avsmot[0].amPoststed).not.toEqual(TEST_DRAFT_SENDER_CITY)
        expect(result.avsmot[0].amEpostadr).not.toEqual(TEST_DRAFT_SENDER_MAIL_ADDRESS)
    })

    it('whenSenderCodeIsSetItLooksUpGivenCodeInAddressRegistry', async () => {
        draft.senderCode = TEST_CODE_SENDER_CODE

        await service.importJournalPost(sessionMock, draft)

        result = getJournPostRequestTypeIncoming()

        expect(addressRegistryMock.lookupCode).toHaveBeenCalledWith(TEST_CODE_SENDER_CODE)
    })

    it('whenSenderCodeIsSetSenderValuesFromServiceAreSetToJournalPost', async () => {
        draft.senderCode = TEST_CODE_SENDER_CODE

        await service.importJournalPost(sessionMock, draft)

        result = getJournPostRequestTypeIncoming()

        expect(result.avsmot[0].amKortnavn).toEqual(TEST_CODE_SENDER_CODE)
        expect(result.avsmot[0].amNavn).toEqual(TEST_CODE_SENDER_NAME)
        expect(result.avsmot[0].amAdresse).toEqual(TEST_CODE_SENDER_ADDRESS)
        expect(result.avsmot[0].amPostnr).toEqual(TEST_CODE_SENDER_ZIPCODE)
        expect(result.avsmot[0].amPoststed).toEqual(TEST_CODE_SENDER_CITY)
        expect(result.avsmot[0].amEpostadr).toEqual(TEST_CODE_SENDER_MAIL_ADDRESS)
    })

    it('whenSenderCodeFromAddressRegistryServiceMatchesMultipleAddressesItPicksTheCorrectOne', async () => {
        draft.senderCode = TEST_CODE_SENDER_CODE
        addressRegistryMock.lookupCode.and.callFake(code => { if (code === TEST_CODE_SENDER_CODE) { return Promise.resolve([{ code: TEST_CODE_SENDER_CODE + "_TEST" }, resultAddress]) } })

        await service.importJournalPost(sessionMock, draft)

        result = getJournPostRequestTypeIncoming()

        expect(result.avsmot[0].amKortnavn).toEqual(TEST_CODE_SENDER_CODE)
        expect(result.avsmot[0].amNavn).toEqual(TEST_CODE_SENDER_NAME)
        expect(result.avsmot[0].amAdresse).toEqual(TEST_CODE_SENDER_ADDRESS)
        expect(result.avsmot[0].amPostnr).toEqual(TEST_CODE_SENDER_ZIPCODE)
        expect(result.avsmot[0].amPoststed).toEqual(TEST_CODE_SENDER_CITY)
        expect(result.avsmot[0].amEpostadr).toEqual(TEST_CODE_SENDER_MAIL_ADDRESS)
    })

    it('throwsExceptionWhenSenderCodeIsInvalid', async () => {
        draft.senderCode = TEST_CODE_INVALID_CODE
        addressRegistryMock.lookupCode.and.returnValue(Promise.resolve([]))

        let importResult = await service.importJournalPost(sessionMock, draft)

        expect(importResult).toEqual({ status: TEST_RESPONSE_ERROR_CODE, message: MESSAGE_INVALID_SENDER_CODE })
        expect(logMock.error).toHaveBeenCalledWith(new Error(MESSAGE_INVALID_SENDER_CODE))
    })

    it('throwsExceptionWhenSenderCodeDoesNotMatchExactly', async () => {
        draft.senderCode = TEST_CODE_SENDER_CODE
        addressRegistryMock.lookupCode.and.callFake(code => { if (code === TEST_CODE_SENDER_CODE) { return Promise.resolve([{ code: TEST_CODE_SENDER_CODE + "_TEST" }]) } })

        let importResult = await service.importJournalPost(sessionMock, draft)

        expect(importResult).toEqual({ status: TEST_RESPONSE_ERROR_CODE, message: MESSAGE_INVALID_SENDER_CODE })
        expect(logMock.error).toHaveBeenCalledWith(new Error(MESSAGE_INVALID_SENDER_CODE))
    })

    it('setsAmSbinitToUpperCasedVersionOfAdUserName', async () => {
        await service.importJournalPost(sessionMock, draft)

        result = getJournPostRequestTypeIncoming()

        expect(result.avsmot[0].amSbhinit).toEqual(TEST_USERNAME.toUpperCase())
    })

    it('setsAmSbhnavnToNameOfUserFromAd', async () => {
        await service.importJournalPost(sessionMock, draft)

        result = getJournPostRequestTypeIncoming()

        expect(result.avsmot[0].amSbhnavn).toEqual(TEST_NAME)
    })

    it('whenHandlerIsSetInJournalDraftItLooksUpUserCodeAndSetItInAmSbinit', async () => {
        websakUserCheckMock.getUserStatus.and.returnValue(Promise.resolve({ chooseHandler: true, valid: false }))
        draft.handler = TEST_HANDLER_CODE
        await service.importJournalPost(sessionMock, draft)

        result = getJournPostRequestTypeIncoming()

        expect(result.avsmot[0].amSbhinit).toEqual(TEST_HANDLER_USERNAME)
    })

    it('whenHandlerIsSetInJournalDraftItLooksUpUserCodeAndSetNamenAmSbhnavn', async () => {
        websakUserCheckMock.getUserStatus.and.returnValue(Promise.resolve({ chooseHandler: true, valid: false }))
        draft.handler = TEST_HANDLER_CODE

        await service.importJournalPost(sessionMock, draft)

        result = getJournPostRequestTypeIncoming()

        expect(result.avsmot[0].amSbhnavn).toEqual(TEST_HANDLER_NAME)
    })

    it('whenHandlerIsInvalidItReturnsErrorMessage', async () => {
        websakUserCheckMock.getUserStatus.and.returnValue(Promise.resolve({ chooseHandler: true, valid: false }))
        draft.handler = "invalid"

        let importResult = await service.importJournalPost(sessionMock, draft)

        expect(importResult).toEqual({ status: TEST_RESPONSE_ERROR_CODE, message: MESSAGE_INVALID_HANDLER_CODE })
        expect(logMock.error).toHaveBeenCalledWith(new Error(MESSAGE_INVALID_HANDLER_CODE))
    })

    it('whenHandlerIsNullItReturnsErrorMessage', async () => {
        websakUserCheckMock.getUserStatus.and.returnValue(Promise.resolve({ chooseHandler: true, valid: false }))
        draft.handler = undefined

        let importResult = await service.importJournalPost(sessionMock, draft)

        expect(importResult).toEqual({ status: TEST_RESPONSE_ERROR_CODE, message: MESSAGE_INVALID_HANDLER_CODE })
        expect(logMock.error).toHaveBeenCalledWith(new Error(MESSAGE_INVALID_HANDLER_CODE))
    })

    it('whenHandlerIsValidButUserCannotProvideHandlerItReturnsErrorMessage', async () => {
        draft.handler = TEST_HANDLER_CODE

        let importResult = await service.importJournalPost(sessionMock, draft)

        expect(importResult).toEqual({ status: TEST_RESPONSE_ERROR_CODE, message: MESSAGE_INVALID_HANDLER_USER })
        expect(logMock.error).toHaveBeenCalledWith(new Error(MESSAGE_INVALID_HANDLER_USER))
    })

    it('retrievesAttachmentListWithCorrectMailId', async () => {
        await service.importJournalPost(sessionMock, draft)

        expect(attachmentServiceMock.getAttachments).toHaveBeenCalledWith(TEST_MAIL_ID)
    })

    it('throwsExceptionWhenAttachmentListIsNull', async () => {
        draft.attachments = []

        let importResult = await service.importJournalPost(sessionMock, draft)

        expect(importResult).toEqual({ status: TEST_RESPONSE_ERROR_CODE, message: MESSAGE_INVALID_ATTACHMENTS })
        expect(logMock.error).toHaveBeenCalledWith(new Error(MESSAGE_INVALID_ATTACHMENTS))
    })

    it('addedAttachmentsGetsCorrectRnrNumber', async () => {
        attachmentServiceMock.getAttachments.and.callFake(mailId => { if (mailId === TEST_MAIL_ID) { return Promise.resolve(twoAttachments) } })
        await service.importJournalPost(sessionMock, draft)

        result = getJournPostRequestTypeIncoming()

        expect(extractAttachmentFromJournalPost("1")).not.toBeUndefined()
        expect(extractAttachmentFromJournalPost("2")).not.toBeUndefined()
        expect(extractAttachmentFromJournalPost("3")).not.toBeUndefined()
    })

    it('attachmentsGetsVariantSetToPForProduksjonsFormat', async () => {
        attachmentServiceMock.getAttachments.and.callFake(mailId => { if (mailId === TEST_MAIL_ID) { return Promise.resolve(twoAttachments) } })
        // Varianter ligger i NVF_VARIANTFORMAT
        await service.importJournalPost(sessionMock, draft)

        result = getJournPostRequestTypeIncoming()

        expect(extractAttachmentFromJournalPost("1").veVariant).toEqual(VE_VARIANT_P_PRODUCTION_FORMAT)
        expect(extractAttachmentFromJournalPost("2").veVariant).toEqual(VE_VARIANT_P_PRODUCTION_FORMAT)
        expect(extractAttachmentFromJournalPost("3").veVariant).toEqual(VE_VARIANT_P_PRODUCTION_FORMAT)
    })

    it('attachmentsGetsKategoriSetToEPForEpost', async () => {
        attachmentServiceMock.getAttachments.and.callFake(mailId => { if (mailId === TEST_MAIL_ID) { return Promise.resolve(twoAttachments) } })
        // Kategorier ligger i NDK_DOKKATEGORI
        await service.importJournalPost(sessionMock, draft)

        result = getJournPostRequestTypeIncoming()

        expect(extractAttachmentFromJournalPost("1").dbKategori).toEqual(DB_CATEGORY_EP_EPOST)
        expect(extractAttachmentFromJournalPost("2").dbKategori).toEqual(DB_CATEGORY_EP_EPOST)
        expect(extractAttachmentFromJournalPost("3").dbKategori).toEqual(DB_CATEGORY_EP_EPOST)
    })

    it('attachmentsGetsStatusSetToBForUnderBehandling', async () => {
        attachmentServiceMock.getAttachments.and.callFake(mailId => { if (mailId === TEST_MAIL_ID) { return Promise.resolve(twoAttachments) } })
        // Statuser ligger i NDS_DOKSTATUS
        await service.importJournalPost(sessionMock, draft)

        result = getJournPostRequestTypeIncoming()

        expect(extractAttachmentFromJournalPost("1").dbStatus).toEqual(DB_STATUS_B_UNDERBEHANDLING)
        expect(extractAttachmentFromJournalPost("2").dbStatus).toEqual(DB_STATUS_B_UNDERBEHANDLING)
        expect(extractAttachmentFromJournalPost("3").dbStatus).toEqual(DB_STATUS_B_UNDERBEHANDLING)
    })

    it('attachmentsGetsTypeSetToVForVedlegg', async () => {
        attachmentServiceMock.getAttachments.and.callFake(mailId => { if (mailId === TEST_MAIL_ID) { return Promise.resolve(twoAttachments) } })
        // Typer ligger i NDT_DOKTILKN
        await service.importJournalPost(sessionMock, draft)

        result = getJournPostRequestTypeIncoming()

        expect(extractAttachmentFromJournalPost("2").dlType).toEqual(DLTYPE_VEDLEGG)
        expect(extractAttachmentFromJournalPost("3").dlType).toEqual(DLTYPE_VEDLEGG)
    })

    it('attachmentsGetsTitleSetFromAttachmentFilename', async () => {
        attachmentServiceMock.getAttachments.and.callFake(mailId => { if (mailId === TEST_MAIL_ID) { return Promise.resolve(twoAttachments) } })
        // Typer ligger i NDT_DOKTILKN
        await service.importJournalPost(sessionMock, draft)

        result = getJournPostRequestTypeIncoming()

        expect(extractAttachmentFromJournalPost("1").dbTittel).toEqual(TEST_MAIL_MAILMESSAGE_SUBJECT)
        expect(extractAttachmentFromJournalPost("2").dbTittel).toEqual(TEST_MAIL_ATTACHMENT_FILENAME)
        expect(extractAttachmentFromJournalPost("3").dbTittel).toEqual(TEST_MAIL_ATTACHMENT_FILENAME_2)
    })

    it('messageAttachmentsGetsCorrectDocumentFormat', async () => {
        gmailMock.getMessage.and.callFake(mailId => { if (mailId === TEST_MAIL_ID) { return Promise.resolve(GmailMessageTestData.plainTextMessageWithAttachments) } })
        attachmentServiceMock.getAttachments.and.callFake(mailId => { if (mailId === TEST_MAIL_ID) { return Promise.resolve(twoAttachments) } })

        await service.importJournalPost(sessionMock, draft)

        result = getJournPostRequestTypeIncoming()

        expect(extractAttachmentFromJournalPost("2").veDokformat).toEqual("html")
        expect(extractAttachmentFromJournalPost("3").veDokformat).toEqual("txt")
    })

    it('messageAttachmentsGetsTitleSetFromAttachmentFilename', async () => {
        await service.importJournalPost(sessionMock, draft)

        result = getJournPostRequestTypeIncoming()

        expect(extractAttachmentFromJournalPost("1").veDokformat).toEqual("html")
    })

    it('attachmentsGetsContentSetFromAttachmentContentService', async () => {
        gmailMock.getMessage.and.callFake(mailId => { if (mailId === TEST_MAIL_ID) { return Promise.resolve(GmailMessageTestData.plainTextMessageWithAttachments) } })
        attachmentServiceMock.getAttachments.and.callFake(mailId => { if (mailId === TEST_MAIL_ID) { return Promise.resolve(twoAttachments) } })
        await service.importJournalPost(sessionMock, draft)

        result = getJournPostRequestTypeIncoming()

        expect(extractAttachmentFromJournalPost("2").fil.base64).toEqual(TEST_MAIL_ATTACHMENT_CONTENT_2)
        expect(extractAttachmentFromJournalPost("3").fil.base64).toEqual(TEST_MAIL_ATTACHMENT_CONTENT_3)
    })

    it('inlineAttachmentsGetsContentSetFromAttachmentContentService', async () => {
        gmailMock.getMessage.and.callFake(mailId => { if (mailId === TEST_MAIL_ID) { return Promise.resolve(GmailMessageTestData.htmlMessageWithInlineAttachmentAndAttachments) } })
        let inlineAttachment = { id: "0.1", text: "inline.bmp" }

        attachmentServiceMock.getAttachments.and.callFake(mailId => { if (mailId === TEST_MAIL_ID) { return Promise.resolve([mailAttachment, inlineAttachment, attachment, attachment2]) } })
        gmailMock.getAttachment.and.callFake((mailId, attachmentId) => {
            if (mailId === TEST_MAIL_ID && attachmentId == "ANGjdJ8rCuUwWnmTotZnvc9QVDmV0aPRn1LgJveqmg-FylyYPIm5ZOhjRek3iViJJSit8fCsDyQQP7fsp-pLb0qRWRjAkhk_tAaAMpcA_HXwZYRS9_esbtoNOQz1wUVQu3rtrFzmA3BBuPb3m96ij-cnHRdv4M67LXdMGuoKsGBZZvhmiOOFu9vBJvF8nRhZ57J7pRSfiP2Gu9JTcFTVyOsXH7Bp5NbfM9Nq84AQysTkce5uTqZIgp4LSTJ37GGK21m11VcFxy3qMR8GxJqDjOjx3ch7yBPppZgO8pt0XE2YswfmoG2Qe0j-GiFviaw") {
                return Promise.resolve(TEST_MAIL_ATTACHMENT_CONTENT_2)
            }
            else if (mailId === TEST_MAIL_ID && attachmentId === "ANGjdJ8ZEyVgscsigcf3yDKm1PtJLXU-i703hhERrYBOi1lVv00lryRYfJkxEWRb2chxTi383x1WNgoDBtSJPmxQTuDSdygS4Qxoz2O1xvowWd7NNH1zqNjMK6cVnuIXbNC3KIO1UdVdWSt5ml8oNxkzsKdRMgm4A-MsOwGlfs8CcPLiFvNKMkxWiMAJy8kc-r6yG15xY2Qh2G1pEQeQmXWXfzFNhGh0A9M5CW7a7h5XWhVzLmVIZjtwYC9AqXugrZUG9Lb1-UmS0wLtEahvKVzOZqY2baX3PFUa_HhG7ILkXl_LfQluI-4AFnugyDA") {
                return Promise.resolve(TEST_MAIL_ATTACHMENT_CONTENT)
            }
            else if (mailId === TEST_MAIL_ID && attachmentId === TEST_MAIL_INLINE_ATTACHMENT_TOKEN_2) {
                return Promise.resolve(TEST_MAIL_ATTACHMENT_CONTENT_3)
            }
        })

        let selectedInlineAttachment = { attachmentId: "0.1", mainDocument: false }
        draft.attachments = [selectedMailAttachment, selectedInlineAttachment, selectedAttachment, selectedAttachment2]

        await service.importJournalPost(sessionMock, draft)

        result = getJournPostRequestTypeIncoming()

        expect(extractAttachmentFromJournalPost("3").fil.base64).toEqual(TEST_MAIL_ATTACHMENT_CONTENT)
        expect(extractAttachmentFromJournalPost("4").fil.base64).toEqual(TEST_MAIL_ATTACHMENT_CONTENT_2)
        expect(extractAttachmentFromJournalPost("2").fil.base64).toEqual(TEST_MAIL_ATTACHMENT_CONTENT_3)
    })

    it('attachmentsInInlineMailMessageGetsContentSetFromAttachmentContentService', async () => {
        gmailMock.getMessage.and.callFake(mailId => { if (mailId === TEST_MAIL_ID) { return Promise.resolve(GmailMessageTestData.htmlMessageWithInlineMessageRfc822AttachmentThatDoesNotShowAttachmentsUpInList) } })

        let pdfAttachment = { id: "1.0.1", text: "Narvik Storsenter 109.pdf" }
        let image3Attachment = { id: "1.0.0.2", text: "image003.jpg" }
        let image2Attachment = { id: "1.0.0.1", text: "image002.png" }
        attachmentServiceMock.getAttachments.and.callFake(mailId => { if (mailId === TEST_MAIL_ID) { return Promise.resolve([pdfAttachment, image2Attachment, image3Attachment]) } })

        gmailMock.getAttachment.and.callFake((mailId, attachmentId) => {
            if (mailId === TEST_MAIL_ID && attachmentId == "ANGjdJ_XqKgkINCc8iPrwBVaebKTeY3jPMGHKEmvz8gigq2UkegiqIsECiZ4ASfLb-5Af5nAz-XgCaLPhEds2jYS2HutFw8PJ7gjIvWszkZGC3ffiiFeSCK3WtypxaYoHNTjJDf5qKEjJWUWB72XGFpB1viUOwmk1zyhgkfqdWXfq4WgRUchzqxSgOzYa90fb3xqp1RBk-cXrcpUhDNhK-1hU_Rn7C0RYqdEdHFWpdUWn959w7XPpUwY36lGQ0AI30XvIhNNBrdVmxV3CS2ydrsK5crzx76NlwpgOrG8GyBSEEV_HIET8eb47C8XEd0") {
                return Promise.resolve(TEST_MAIL_ATTACHMENT_CONTENT_2)
            }
            else if (mailId === TEST_MAIL_ID && attachmentId === "ANGjdJ8RXuXw6X_46QARw7Ge5IaxSobUOeFoeurkBVi0TTPZ3qTrKzaU9Yg_u2rkkEXIqHcidS2oP5G3VYXmb--7SIhfv1XG7JlvCZob6-tlm1NMdfIxCGcQt1FhpZEPHjzUvvUGHc6tLFS3wSjf5RXhbzcOGOYLsvpkz98ZgPRaeJn-y-VxvkVHwIfE0fmhHYMBkV4yRTDJFbkFPqm-o_lY8sZgRUZHZkp3R9oePtUBcL9cjpYn4xgnpH1Jx1YHG0yRBh07y2g1p3qSzQBVu3LCRuXhLnxjln_EvnNpynW_HxSZuPEaCrprHHAMdlY") {
                return Promise.resolve(TEST_MAIL_ATTACHMENT_CONTENT)
            }
            else if (mailId === TEST_MAIL_ID && attachmentId === "ANGjdJ98u_opKOYcdzDmTuuXN4LaWDAOmTSMeq4b-PEug9el14WGuDwQn5Kmn-P2RbX8rmtLA3VHuEwNGEkzNe9EEXsJ8Q_dOkPXr8vfz2Ye64xsr4ruHmn2PjhqR9HxpuLWzC760L1Ix2mQoTa9ljwIHUwwg9Us0HB54wHH_j9sgccSZzC9h7Tl2K0VfjENLV6nFIQa0-QvRHhUcxyIUUt3A2BJ9kfgB6SgBZclnIItWga304J1wbSTpSq6G_C0XMJIkJ8xbDn1CfA6Mrm1ec6Fy6qryGi9OulCz5U_4H39KqxX-1Cs0dLXKWn1SBc") {
                return Promise.resolve(TEST_MAIL_ATTACHMENT_CONTENT_3)
            }
        })

        let selectedPdfAttachment = { attachmentId: "1.0.1", mainDocument: true }
        let selectedImage2Attachment = { attachmentId: "1.0.0.1", mainDocument: false }
        let selectedImage3Attachment = { attachmentId: "1.0.0.2", mainDocument: false }
        draft.attachments = [selectedPdfAttachment, selectedImage2Attachment, selectedImage3Attachment]

        await service.importJournalPost(sessionMock, draft)

        result = getJournPostRequestTypeIncoming()

        expect(extractAttachmentFromJournalPost("1").fil.base64).toEqual(TEST_MAIL_ATTACHMENT_CONTENT)
        expect(extractAttachmentFromJournalPost("2").fil.base64).toEqual(TEST_MAIL_ATTACHMENT_CONTENT_2)
        expect(extractAttachmentFromJournalPost("3").fil.base64).toEqual(TEST_MAIL_ATTACHMENT_CONTENT_3)
    })

    it('onlyAttachmentsThatHasBeenSelectedAreIncluded', async () => {
        attachmentServiceMock.getAttachments.and.callFake(mailId => { if (mailId === TEST_MAIL_ID) { return Promise.resolve(twoAttachments) } })
        selectedAttachment2.mainDocument = true
        draft.attachments = [selectedAttachment2]

        await service.importJournalPost(sessionMock, draft)

        result = getJournPostRequestTypeIncoming()

        expect(extractAttachmentFromJournalPost("1")).toBeDefined()
        expect(extractAttachmentFromJournalPost("2")).toBeUndefined()
        expect(extractAttachmentFromJournalPost("3")).toBeUndefined()
    })

    it('attachmentSetAsMainDocument', async () => {
        attachmentServiceMock.getAttachments.and.callFake(mailId => { if (mailId === TEST_MAIL_ID) { return Promise.resolve(twoAttachments) } })
        selectedMailAttachment.mainDocument = false
        selectedAttachment.mainDocument = true

        await service.importJournalPost(sessionMock, draft)

        result = getJournPostRequestTypeIncoming()

        expect(extractAttachmentFromJournalPost("1").dlType).toEqual(DLTYPE_VEDLEGG)
        expect(extractAttachmentFromJournalPost("2").dlType).toEqual(DLTYPE_HOVEDDOKUMENT)
        expect(extractAttachmentFromJournalPost("3").dlType).toEqual(DLTYPE_VEDLEGG)
    })

    it('throwsExceptionIfMultipleSelectedAttachmentsAreMarkedAsMainDocument', async () => {
        selectedAttachment.mainDocument = true
        selectedAttachment2.mainDocument = true

        let importResult = await service.importJournalPost(sessionMock, draft)

        expect(importResult).toEqual({ status: TEST_RESPONSE_ERROR_CODE, message: MESSAGE_INVALID_MULTIPLE_MAIN_DOCUMENT })
        expect(logMock.error).toHaveBeenCalledWith(new Error(MESSAGE_INVALID_MULTIPLE_MAIN_DOCUMENT))
    })

    it('throwsExceptionIfNoneSelectedAttachmentsAreMarkedAsMainDocument', async () => {
        selectedMailAttachment.mainDocument = false
        selectedAttachment.mainDocument = false
        selectedAttachment2.mainDocument = false

        let importResult = await service.importJournalPost(sessionMock, draft)

        expect(importResult).toEqual({ status: TEST_RESPONSE_ERROR_CODE, message: MESSAGE_INVALID_NO_MAIN_DOCUMENT })
        expect(logMock.error).toHaveBeenCalledWith(new Error(MESSAGE_INVALID_NO_MAIN_DOCUMENT))
    })

    it('fillsInHtmlTemplateForPlaintextMailMessageWithoutAttachment', async () => {
        await service.importJournalPost(sessionMock, draft)

        result = getJournPostRequestTypeIncoming()

        let expectedPlainTextMail = he.escape(
            "<div>æøå</div>Gmail Sak <gmailsak@narvik.kommune.no>Bjørn-Tore Lilleng <bjorn.tore.lilleng@narvik.kommune.no>24. februar 2016 12:08")
            + "<em>Ingen</em>" + "<div style=\"white-space:pre-wrap\">" + he.escape("<span>äöã</span>\r\n") + "</div>"
        expect(extractAttachmentFromJournalPost("1").fil.base64).toEqual(Buffer.from(expectedPlainTextMail, 'utf8').toString('base64'))
    })

    it('fillsInHtmlTemplateForPlaintextMailMessageWithoutAttachmentAndMultipleLines', async () => {
        gmailMock.getMessage.and.callFake(mailId => { if (mailId === TEST_MAIL_ID) { return Promise.resolve(GmailMessageTestData.plainTextMessageWithoutAttachmentsAndMultipleLinesInText) } })
        await service.importJournalPost(sessionMock, draft)

        result = getJournPostRequestTypeIncoming()

        let expectedPlainTextMail = he.escape(
            "TestBjørn-Tore Lilleng <btl@narvik.kommune.no>Bjørn-Tore Lilleng <bjorn.tore.lilleng@narvik.kommune.no>27. oktober 2016 14:32")
            + "<em>Ingen</em>" + "<div style=\"white-space:pre-wrap\">" + he.escape("En\r\nRen\r\nTekst\r\nE-post\r\nMed\r\nFlere\r\nLinjer\r\n") + "</div>"
        expect(extractAttachmentFromJournalPost("1").fil.base64).toEqual(Buffer.from(expectedPlainTextMail, 'utf8').toString('base64'))
    })

    it('fillsInHtmlTemplateForPlaintextMailMessageWithAttachments', async () => {
        attachmentServiceMock.getAttachments.and.callFake(mailId => { if (mailId === TEST_MAIL_ID) { return Promise.resolve(twoAttachments) } })
        gmailMock.getMessage.and.callFake(mailId => { if (mailId === TEST_MAIL_ID) { return Promise.resolve(GmailMessageTestData.plainTextMessageWithAttachments) } })

        await service.importJournalPost(sessionMock, draft)

        result = getJournPostRequestTypeIncoming()

        let expectedPlainTextMail = he.escape(
            "<div>æøå</div>Gmail Sak <gmailsak@narvik.kommune.no>Bjørn-Tore Lilleng <bjorn.tore.lilleng@narvik.kommune.no>24. februar 2016 13:06")
            + "minimal.html; informasjon.txt" + "<div style=\"white-space:pre-wrap\">" + he.escape("<span>äöã</span>\r\n") + "</div>"
        expect(extractAttachmentFromJournalPost("1").fil.base64).toEqual(Buffer.from(expectedPlainTextMail, 'utf8').toString('base64'))
    })

    it('fillsInHtmlTemplateForHtmlMailMessageWithoutAttachment', async () => {
        gmailMock.getMessage.and.callFake(mailId => { if (mailId === TEST_MAIL_ID) { return Promise.resolve(GmailMessageTestData.htmlMessageWithoutAttachments) } })
        await service.importJournalPost(sessionMock, draft)

        result = getJournPostRequestTypeIncoming()

        let expectedPlainTextMail = he.escape(
            "<div>æøå</div>Gmail Sak <gmailsak@narvik.kommune.no>Bjørn-Tore Lilleng <bjorn.tore.lilleng@narvik.kommune.no>24. februar 2016 12:08")
            + "<em>Ingen</em>" + "<div dir=\"ltr\">&lt;span&gt;äöã&lt;/span&gt;</div>\r\n"
        expect(extractAttachmentFromJournalPost("1").fil.base64).toEqual(Buffer.from(expectedPlainTextMail, 'utf8').toString('base64'))
    })

    it('fillsInHtmlTemplateForHtmlMailMessageWithoutAttachmentAndMultipleCCRecipients', async () => {
        gmailMock.getMessage.and.callFake(mailId => { if (mailId === TEST_MAIL_ID) { return Promise.resolve(GmailMessageTestData.htmlMessageWithMultipleCCRecipients) } })
        await service.importJournalPost(sessionMock, draft)

        result = getJournPostRequestTypeIncoming()

        let expectedPlainTextMail = he.escape(
            "<div>æøå</div>Gmail Sak <gmailsak@narvik.kommune.no>Bjørn-Tore Lilleng <bjorn.tore.lilleng@narvik.kommune.no>") + "<strong>Kopi:</strong> " + he.escape("btl@elev.narvikskolen.no, Bjørn-Tore Lilleng <btl@narvikskolen.no>") + " <br>" + he.escape("11. mai 2016 12:25")
            + "<em>Ingen</em>" + "<div dir=\"ltr\">&lt;span&gt;äöã&lt;/span&gt;<br>\r\n</div>\r\n"
        expect(extractAttachmentFromJournalPost("1").fil.base64).toEqual(Buffer.from(expectedPlainTextMail, 'utf8').toString('base64'))
    })

    it('fillsInHtmlTemplateForHtmlMailMessageWithAttachments', async () => {
        gmailMock.getMessage.and.callFake(mailId => { if (mailId === TEST_MAIL_ID) { return Promise.resolve(GmailMessageTestData.htmlMessageWithAttachments) } })
        attachmentServiceMock.getAttachments.and.callFake(mailId => { if (mailId === TEST_MAIL_ID) { return Promise.resolve(twoAttachments) } })
        gmailMock.getAttachment.and.callFake((mailId, attachmentId) => {
            if (mailId === TEST_MAIL_ID && attachmentId == "ANGjdJ-6lDYMGOpOYolyMOnJMEhGyid0krYRYx04pLeicAiu8iEOM3e7WywXs_CXlFcMhNrEAeGxXEzd4rsnvOHoDXA4wVQcAmoTzl4EU72uP9yF89CvmpFKgjSF0fY9eDZDghTRVHQIgqDmD2IbPeMe_uDf-kUBCjDhjBW99tTyE2nh7JApIumPClIxyRf5Efj78oRi3LE_1joFj6UXcg0Irzku1gG8brEvEF941_HQS3C7zz4T1jJFoLC-Y2wXqMeW4RPh6TvwfecaN3rQz9G_KMxtKHi9C3MjjuZv8aeTaYYwVuEN5qa_4LLKiws") {
                return Promise.resolve(TEST_MAIL_ATTACHMENT_CONTENT)
            }
            else if (mailId === TEST_MAIL_ID && attachmentId === "ANGjdJ96fe8_29F1Nbg0pEVQ72HDK20953fvjHvmaG1B5byVvw2BDLZSLC_wHsK9CyDnB1i07osjZ6QFsam9s417sfMNZCZcw3Si2RUyQBnWLZvf1Ly23WiEeAZRtvpGbfHFIDKw0iXdYkYHS0T47jzZhtl0H_wcKtjzfCtIyj-BQ5bCZQCpaf17PGpGSuUiknqsmG9Lh5mdTcMWbPo5NMdeLgmcX5C6C7HUnKuonc9BH_h62VvubjkFB9IKqbJGZgQKB1I-wk3s-Ya2N0h0D_Tcw_T_PPHEeb_SIe8ULOvujTi8kPFR6qbQKgVQUrM") {
                return Promise.resolve(TEST_MAIL_ATTACHMENT_CONTENT)
            }
        })

        await service.importJournalPost(sessionMock, draft)

        result = getJournPostRequestTypeIncoming()

        let expectedPlainTextMail = he.escape(
            "<div>æøå</div>Gmail Sak <gmailsak@narvik.kommune.no>Bjørn-Tore Lilleng <bjorn.tore.lilleng@narvik.kommune.no>24. februar 2016 14:07")
            + "minimal.html; informasjon.txt" + "<div dir=\"ltr\">&lt;span&gt;äöã&lt;/span&gt;</div>\r\n"
        expect(extractAttachmentFromJournalPost("1").fil.base64).toEqual(Buffer.from(expectedPlainTextMail, 'utf8').toString('base64'))
    })

    it('fillsInHtmlTemplateForHtmlMailMessageWithInlineAttachment', async () => {
        gmailMock.getMessage.and.callFake(mailId => { if (mailId === TEST_MAIL_ID) { return Promise.resolve(GmailMessageTestData.htmlMessageWithInlineAttachment) } })

        await service.importJournalPost(sessionMock, draft)

        result = getJournPostRequestTypeIncoming()

        let expectedPlainTextMail = he.escape(
            "<div>æøå</div>Gmail Sak <gmailsak@narvik.kommune.no>Bjørn-Tore Lilleng <bjorn.tore.lilleng@narvik.kommune.no>24. februar 2016 14:26")
            + "<em>Ingen</em>"
            + "<div dir=\"ltr\"><div id=\":11a\" class=\"\" style=\"font-size:12.8px;margin-bottom:0px;margin-left:0px;padding-bottom:5px\"><div id=\":11d\" class=\"\" style=\"overflow:hidden\"><div dir=\"ltr\">&lt;span&gt;äöã&lt;/span&gt;</div><div dir=\"ltr\"><br></div><div dir=\"ltr\"><img src=\"data:image/bmp;base64,Qk1CAAAAAAAAAD4AAAAoAAAAAQAAAAEAAAABAAEAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP///wCAAAAA\" alt=\"Innebygd bilde 1\" width=\"1\" height=\"1\"><br></div><div class=\"\"></div></div></div><div class=\"\" id=\":16t\" style=\"font-size:12.8px\"></div>\r\n</div>\r\n"
        expect(extractAttachmentFromJournalPost("1").fil.base64).toEqual(Buffer.from(expectedPlainTextMail, 'utf8').toString('base64'))
    })

    it('fillsInHtmlTemplateForHtmlMailMessageWithInlineAttachmentAndAttachments', async () => {
        gmailMock.getMessage.and.callFake(mailId => { if (mailId === TEST_MAIL_ID) { return Promise.resolve(GmailMessageTestData.htmlMessageWithInlineAttachmentAndAttachments) } })
        attachmentServiceMock.getAttachments.and.callFake(mailId => { if (mailId === TEST_MAIL_ID) { return Promise.resolve(twoAttachments) } })
        gmailMock.getAttachment.and.callFake((mailId, attachmentId) => {
            if (mailId === TEST_MAIL_ID && attachmentId == "ANGjdJ8ZEyVgscsigcf3yDKm1PtJLXU-i703hhERrYBOi1lVv00lryRYfJkxEWRb2chxTi383x1WNgoDBtSJPmxQTuDSdygS4Qxoz2O1xvowWd7NNH1zqNjMK6cVnuIXbNC3KIO1UdVdWSt5ml8oNxkzsKdRMgm4A-MsOwGlfs8CcPLiFvNKMkxWiMAJy8kc-r6yG15xY2Qh2G1pEQeQmXWXfzFNhGh0A9M5CW7a7h5XWhVzLmVIZjtwYC9AqXugrZUG9Lb1-UmS0wLtEahvKVzOZqY2baX3PFUa_HhG7ILkXl_LfQluI-4AFnugyDA") {
                return Promise.resolve(TEST_MAIL_ATTACHMENT_CONTENT)
            }
            else if (mailId === TEST_MAIL_ID && attachmentId === "ANGjdJ8rCuUwWnmTotZnvc9QVDmV0aPRn1LgJveqmg-FylyYPIm5ZOhjRek3iViJJSit8fCsDyQQP7fsp-pLb0qRWRjAkhk_tAaAMpcA_HXwZYRS9_esbtoNOQz1wUVQu3rtrFzmA3BBuPb3m96ij-cnHRdv4M67LXdMGuoKsGBZZvhmiOOFu9vBJvF8nRhZ57J7pRSfiP2Gu9JTcFTVyOsXH7Bp5NbfM9Nq84AQysTkce5uTqZIgp4LSTJ37GGK21m11VcFxy3qMR8GxJqDjOjx3ch7yBPppZgO8pt0XE2YswfmoG2Qe0j-GiFviaw") {
                return Promise.resolve(TEST_MAIL_ATTACHMENT_CONTENT)
            }
            else if (mailId === TEST_MAIL_ID && attachmentId === TEST_MAIL_INLINE_ATTACHMENT_TOKEN_2) {
                return Promise.resolve(TEST_MAIL_INLINE_ATTACHMENT_CONTENT)
            }
        })

        await service.importJournalPost(sessionMock, draft)

        result = getJournPostRequestTypeIncoming()

        let expectedPlainTextMail = he.escape(
            "<div>æøå</div>Gmail Sak <gmailsak@narvik.kommune.no>Bjørn-Tore Lilleng <bjorn.tore.lilleng@narvik.kommune.no>24. februar 2016 14:52")
            + "minimal.html; informasjon.txt"
            + "<div dir=\"ltr\"><span style=\"font-size:12.8px\">&lt;span&gt;äöã&lt;/span&gt;</span><div><span style=\"font-size:12.8px\"><br></span></div><div><span style=\"font-size:12.8px\"><img src=\"data:image/bmp;base64,Qk1CAAAAAAAAAD4AAAAoAAAAAQAAAAEAAAABAAEAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP///wCAAAAA\" alt=\"Innebygd bilde 2\" width=\"1\" height=\"1\"><br></span></div></div>\r\n"
        expect(extractAttachmentFromJournalPost("1").fil.base64).toEqual(Buffer.from(expectedPlainTextMail, 'utf8').toString('base64'))
    })

    it('fillsInHtmlTemplateForHtmlMailMessageWithInlineAttachmentAndAttachmentsForInlineImagesMarkedAsAttachmentInContentDisposition', async () => {
        gmailMock.getMessage.and.callFake(mailId => { if (mailId === TEST_MAIL_ID) { return Promise.resolve(GmailMessageTestData.htmlMessageWithInlineImagesAndPdfAttachmentWithNewContentDispositionForInlineImages) } })
        attachmentServiceMock.getAttachments.and.callFake(mailId => { if (mailId === TEST_MAIL_ID) { return Promise.resolve(twoAttachments) } })
        gmailMock.getAttachment.and.callFake((mailId, attachmentId) => {
            if (mailId === TEST_MAIL_ID && attachmentId == "ANGjdJ_2nsdVd8c9MT1WHrLt6RPZhXxmvCbuZp8FX9FSeoepXWu_YWN37cccGuWA_tkxeWAHjKhKk4IWuP2-ELGvnQUEIVa4Sa2AGfWQjCidM2rZjP03lHnJSMTbc0uwhVlcLcE-Hq6rTJCExaOo8gzdBovA3x2yzwe71oA2NKK8_nH6FGFYj1wmYARHlyOYnis7sQTCUOMVcm65UIAfxkqdFqxS6XVTWBW_CNbjPA") {
                return Promise.resolve(TEST_MAIL_INLINE_ATTACHMENT_CONTENT)
            }
            else if (mailId === TEST_MAIL_ID && attachmentId === "ANGjdJ_adf-aPg6iIJ6wWQl7UsT_ltcycsm1tkIELRxdd93hZx2EiNF5c2WcLoZ0HjzCF2VcoNiM_cYJEz07Xmm85kWC0VPLxDy132nYnewVLxPCAZULZtvMDBBXBYiH5tTljj40Iu9HAZZBUvsOjmiXU8uc5dOtEO1v43cRNyXu9AJdSCXXLUvtN6R3F3iAOQ4eV6RXKoW5dFwD625SQdvH67MaJVguXaqYB5QpQw") {
                return Promise.resolve(TEST_MAIL_ATTACHMENT_CONTENT)
            }
        })

        await service.importJournalPost(sessionMock, draft)

        result = getJournPostRequestTypeIncoming()

        let expectedPlainTextMail = 'Inline images with new type Content-Disposition&quot;Bjørn-Tore Lilleng&quot; &lt;btl@narvik.kommune.no&gt;&quot;Bjørn-Tore Lilleng&quot; &lt;bjorn.tore.lilleng@narvik.kommune.no&gt;17. februar 2020 09:16minimal.html; informasjon.txt<div dir="ltr"><div> &gt;n&gt;n&gt;n&gt;-&gt;-&gt;-&gt;/?&quot;%?<br></div><div><br></div><div>^- Create multiple dashes and forward slashes</div><div><br></div><div><img src="data:image/png;base64,Qk1CAAAAAAAAAD4AAAAoAAAAAQAAAAEAAAABAAEAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP///wCAAAAA" alt="ic_attachment_black_24dp_1x.png" width="24" height="24"><br></div></div>\r\n'
        expect(extractAttachmentFromJournalPost("1").fil.base64).toEqual(Buffer.from(expectedPlainTextMail, 'utf8').toString('base64'))
    })

    it('whenMailHasMultipleAttachmentAndOnlyMailIsSelectedItDoesNotThrowException', async () => {
        gmailMock.getMessage.and.callFake(mailId => { if (mailId === TEST_MAIL_ID) { return Promise.resolve(GmailMessageTestData.htmlMessageWithAttachments) } })
        attachmentServiceMock.getAttachments.and.callFake(mailId => { if (mailId === TEST_MAIL_ID) { return Promise.resolve(twoAttachments) } })
        draft.attachments = [selectedMailAttachment]

        await service.importJournalPost(sessionMock, draft)

        result = getJournPostRequestTypeIncoming()

        let expectedPlainTextMail = he.escape(
            "<div>æøå</div>Gmail Sak <gmailsak@narvik.kommune.no>Bjørn-Tore Lilleng <bjorn.tore.lilleng@narvik.kommune.no>24. februar 2016 14:07")
            + "<em>Ingen</em>" + "<div dir=\"ltr\">&lt;span&gt;äöã&lt;/span&gt;</div>\r\n"
        expect(extractAttachmentFromJournalPost("1").fil.base64).toEqual(Buffer.from(expectedPlainTextMail, 'utf8').toString('base64'))
    })

    it('whenJournalPostIsSuccessfullyAddedItReturnsProperlySetResponseObject', async () => {
        let importResult = await service.importJournalPost(sessionMock, draft)

        expect(importResult.message).toEqual(TEST_RESPONSE_OK_JOURNAL_POST_ID)
    })

    it('whenJournalPostIsNotAddedItReturnsResponseObjectWithErrorMessage', async () => {
        noarkIncomingMock.putJournpost.and.returnValue({ status: TEST_RESPONSE_ERROR_CODE, message: TEST_RESPONSE_ERROR_MESSAGE })

        let importResult = await service.importJournalPost(sessionMock, draft)

        expect(importResult).toEqual({ status: TEST_RESPONSE_ERROR_CODE, message: TEST_RESPONSE_ERROR_MESSAGE })
    })

    it('whenJournalPostIsImportedAndItThrowsAnExceptionErrorCodeIsReturnedAndGenericErrorMessage', async () => {
        noarkIncomingMock.putJournpost.and.callFake(() => { return Promise.reject(Error(TEST_RESPONSE_EXCEPTION_MESSAGE)) })

        let importResult = await service.importJournalPost(sessionMock, draft)

        expect(importResult.message).toEqual(TEST_RESPONSE_EXCEPTION_MESSAGE)
    })

    it('whenJournalPostIsImportedAndItThrowsAnExceptionItIsLoggedInImportLog', async () => {
        noarkIncomingMock.putJournpost.and.callFake(() => { return Promise.reject(Error(TEST_RESPONSE_EXCEPTION_MESSAGE)) })

        await service.importJournalPost(sessionMock, draft)

        expect(importLogMock.logImport).toHaveBeenCalledWith(TEST_MAIL_ADDRESS, undefined, draft, Error(TEST_RESPONSE_EXCEPTION_MESSAGE))
    })

    it('whenJournalPostIsImportedAndItThrowsAnExceptionImportLogExceptionsAreIgnored', async () => {
        noarkIncomingMock.putJournpost.and.callFake(() => { return Promise.reject(Error(TEST_RESPONSE_EXCEPTION_MESSAGE)) })
        importLogMock.logImport.and.callFake(() => { return Promise.reject(Error('Not shown in client')) })

        try {
            await service.importJournalPost(sessionMock, draft)
        } catch (e) {
            fail('When import logging throws exceptions it should be ignored')
        }
    })

    it('whenJournalPostIsImportedAndItThrowsAnExceptionAndExceptionIsLogged', async () => {
        const expectedError = Error(TEST_RESPONSE_EXCEPTION_MESSAGE)
        noarkIncomingMock.putJournpost.and.callFake(() => { return Promise.reject(expectedError) })

        await service.importJournalPost(sessionMock, draft)

        expect(logMock.error).toHaveBeenCalledWith(expectedError)
    })

    it('whenJournalPostIsImportedAndItThrowsAnExceptionImportLogExceptionsAreLogged', async () => {
        const expectedError = Error('Not shown in client')
        noarkIncomingMock.putJournpost.and.callFake(() => { return Promise.reject(Error(TEST_RESPONSE_EXCEPTION_MESSAGE)) })
        importLogMock.logImport.and.callFake(() => { return Promise.reject(expectedError) })

        await service.importJournalPost(sessionMock, draft)

        expect(logMock.error).toHaveBeenCalledWith(expectedError)
    })

    it('whenJournalPostIsInvalidAndItThrowsAnExceptionItIsLoggedInImportLog', async () => {
        draft.attachments = undefined

        await service.importJournalPost(sessionMock, draft)

        expect(importLogMock.logImport).toHaveBeenCalledWith(TEST_MAIL_ADDRESS, undefined, draft, Error(MESSAGE_INVALID_ATTACHMENTS))
    })

    it('whenJournalPostIsInvalidAndItThrowsAnExceptionImportLogExceptionsAreIgnored', async () => {
        draft.attachments = undefined
        noarkIncomingMock.putJournpost.and.callFake(() => { return Promise.reject(Error(TEST_RESPONSE_EXCEPTION_MESSAGE)) })
        importLogMock.logImport.and.callFake(() => { return Promise.reject(Error('Not show in client')) })

        try {
            await service.importJournalPost(sessionMock, draft)
        } catch (e) {
            fail('When import logging throws exceptions it should be ignored')
        }
    })

    it('whenJournalPostIsSuccessfullyAddedItIsLoggedInImportLog', async () => {
        await service.importJournalPost(sessionMock, draft)

        expect(importLogMock.logImport).toHaveBeenCalledWith(TEST_MAIL_ADDRESS, TEST_RESPONSE_OK_JOURNAL_POST_ID, draft, undefined)
    })

    it('whenJournalPostIsSuccessfullyAndImportLogThrowsExceptionItIsIgnored', async () => {
        importLogMock.logImport.and.returnValue(Promise.reject(Error('Not shown in client')))

        let importResult = await service.importJournalPost(sessionMock, draft)

        expect(importResult).toEqual({ status: "jp.id", message: TEST_RESPONSE_OK_JOURNAL_POST_ID })
    })

    it('whenJournalDraftDocumentTypeIsAnOutgoingDocumentItContactsOutgoingImportService', async () => {
        draft.documentType = OUTGOING_DOCUMENTTYPE_ID

        await service.importJournalPost(sessionMock, draft)

        expect(noarkIncomingMock.putJournpost).not.toHaveBeenCalled()
    })

    describe('time issues', () => {
        beforeEach(function () {
            jasmine.clock().install();
        });

        afterEach(function () {
            jasmine.clock().uninstall();
        });

        it('whenInternalDateIsInTheFutureItUsesReceivedValueInstead', async () => {
            // internalDate: 1582295460000 | UTC: Fri Feb 21 2020 14:31:00 | GMT+1: Fri Feb 21 2020 15:31:00
            gmailMock.getMessage.and.callFake(mailId => { if (mailId === TEST_MAIL_ID) { return Promise.resolve(GmailMessageTestData.htmlMessageWithPdfAttachmentAndInternalDateOneHourAheadOfReceivedDate) } })
            jasmine.clock().mockDate(new Date(1582278523726)); // UTC: Fri Feb 21 2020 09:48:43 | GMT+1: Fri Feb 21 2020 10:48:43

            await service.importJournalPost(sessionMock, draft)

            result = getJournPostRequestTypeIncoming()

            expect(result.jpDokdato).toEqual('20200221')
        })

        it('whenInternalDateAndReceivedValueIsInTheFutureItFailsWithError', async () => {
            // internalDate: 1581927388000 | UTC: Mon Feb 17 2020 08:16:28 | GMT+1: Mon Feb 17 2020 09:16:28
            gmailMock.getMessage.and.callFake(mailId => { if (mailId === TEST_MAIL_ID) { return Promise.resolve(GmailMessageTestData.htmlMessageWithPdfAttachmentAndInternalDateOneHourAheadOfReceivedDate) } })
            jasmine.clock().mockDate(new Date(1582200333000)); // UTC: Thu Feb 20 2020 12:05:33 | GMT+1: Thu Feb 20 2020 13:05:33

            let importResult = await service.importJournalPost(sessionMock, draft)

            expect(importResult).toEqual({ status: "ERROR", message: 'Tidspunktet for når e-posten ble mottat er i fremtiden.' })
        })      
        
        it('whenInternalDateIsInTheFutureAndReceivedValueDoesNotExistItFailsWithError', async () => {
            // internalDate: 1582295460000 | UTC: Fri Feb 21 2020 14:31:00 | GMT+1: Fri Feb 21 2020 15:31:00
            gmailMock.getMessage.and.callFake(mailId => { if (mailId === TEST_MAIL_ID) { return Promise.resolve(GmailMessageTestData.htmlMessageWithInlineImagesAndPdfAttachmentWithNewContentDispositionForInlineImages) } })
            jasmine.clock().mockDate(new Date(1581437275000)); // UTC: Tue Feb 11 2020 16:07:55 | GMT+1: Tue Feb 11 2020 17:07:55

            let importResult = await service.importJournalPost(sessionMock, draft)

            expect(importResult).toEqual({ status: "ERROR", message: 'Tidspunktet for når e-posten ble mottat er i fremtiden.' })
        })           
    })
})