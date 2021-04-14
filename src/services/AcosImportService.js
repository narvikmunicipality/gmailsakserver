function AcosImportService(log, n4wsBridge, gmail, departmentService, adService, addressRegistry, departmentUserRegistry, attachmentService, importLog, websakUserCheck, archiveIdService, he, importedMailTemplate) {
    const SQL_ERROR_RETURNED_WHEN_SENDER_HAS_DUPLICATE_CODE = "Subquery returned more than 1 value.",
        MESSAGE_DUPLICATE_SENDER_CODE = "Kan ikke importere journalpost med kontakt som har duplikate koder.",
        BEHANSV_SAKSBEHANDLER = "1",
        IHTYPE_MOTTAKER = "1",
        IHTYPE_AVSENDER = "0",
        INCOMING_DOCUMENTTYPE = "I",
        NOTE_WITHOUT_FOLLOWUP_DOCUMENTTYPE = "X",
        MESSAGE_INVALID_DATE = "Tidspunktet for når e-posten ble mottat er i fremtiden.",
        MESSAGE_INVALID_SENDER_CODE = "Avsenderkoden er ikke gyldig.",
        DOCUMENT_FORMAT_HTML = "html",
        MESSAGETYPE_ERROR_CODE = "ERROR",
        MAIL_MESSAGE_ATTACHMENT_ID = "68dbdf13b423ade4121dd9466ebc4362",
        DOKUMENT_TILKNYTNING_VEDLEGG = "V",
        STATUS_UNDER_BEHANDLING = "B",
        KATEGORI_EPOST = "EP",
        PRODUCTION_FORMAT = "P",
        DOKUMENT_TILKNYTNING_HOVEDDOKUMENT = "H"
    importedMailTemplate = importedMailTemplate || createFormatMailTemplate`<!DOCTYPE html><html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"><title>Importert e-postmelding: ${0}</title><style type="text/css">#lawoyi43 *, #uzamob29 *{font-family: sans-serif;}#lawoyi43>h1, #lawoyi43>h2, #uzamob29>h2{border-bottom: 1px solid black;}#lawoyi43 strong{width: 8em;text-align: right;display: inline-block;}</style></head><body><div id="lawoyi43"><h1>${0}</h1><h2>Detaljer</h2><strong>Til:</strong> ${1} <br><strong>Fra:</strong> ${2} <br>${3}<strong>Sendt:</strong> ${4} <br><strong>Vedlegg:</strong> ${5}<br></div><div id="uzamob29"><h2>Innhold</h2>${6}</div></body></html>`

    function createFormatMailTemplate(strings, ...keys) {
        return (function (...values) {
            let dict = values[values.length - 1] || {}
            let result = [strings[0]]
            keys.forEach(function (key, i) {
                let value = Number.isInteger(key) ? values[key] : dict[key]
                result.push(value, strings[i + 1])
            })
            return result.join('')
        })
    }
    function dateFormatter(date) {
        return date.toISOString().slice(0, 10).replace(/-/g, '') // yyyyMMdd
    }
    function fullFormatter(date) { // dd. MMMM yyyy HH:mm
        function day(date) { return `${date.getDate()}`.padStart(2, '0') }
        function month(date) { return ['januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'desember'][date.getMonth()] }
        function year(date) { return date.getFullYear() }
        function hour(date) { return `${date.getHours()}`.padStart(2, '0') }
        function minute(date) { return `${date.getMinutes()}`.padStart(2, '0') }

        return `${day(date)}. ${month(date)} ${year(date)} ${hour(date)}:${minute(date)}`
    }

    function exceptionIsContactWithMultipleCodes(e) {
        return e.message !== undefined && e.message.includes(SQL_ERROR_RETURNED_WHEN_SENDER_HAS_DUPLICATE_CODE)
    }

    function getCorrectServiceBasedOnDocumentType(draft) {
        let service = undefined
        if (draft.documentType === INCOMING_DOCUMENTTYPE) {
            service = n4wsBridge.createIncomingNoarkService()
        } else {
            service = n4wsBridge.createOutgoingNoarkService()
        }
        return service
    }

    async function postJournalPostToWebService(service, post) {
        return await service.putJournpost(post)
    }

    async function putAttachmentsInJournalPost(draft, post, message) {
        let result = await convertChosenAttachmentsToDokumentType(draft, message)
        post.dokument = result
    }

    async function convertChosenAttachmentsToDokumentType(draft, message) {
        let nextRnr = 1
        let journalPostAttachments = []
        attachments = await attachmentService.getAttachments(draft.mailId)
        let selectedAttachments = createSelectedAttachmentList(draft, attachments)

        for (var i = 0; i < selectedAttachments.length; ++i) {
            let attachment = selectedAttachments[i]
            let dokumentType = n4wsBridge.createDokumentTypeBaseObject()
            dokumentType.dlRnr = `${nextRnr++}`
            dokumentType.veVariant = PRODUCTION_FORMAT
            dokumentType.dbKategori = KATEGORI_EPOST
            dokumentType.dbStatus = STATUS_UNDER_BEHANDLING

            if (attachment.mainDocument) {
                dokumentType.dlType = DOKUMENT_TILKNYTNING_HOVEDDOKUMENT
            } else {
                dokumentType.dlType = DOKUMENT_TILKNYTNING_VEDLEGG
            }

            dokumentType.dbTittel = attachment.text

            if (!isMailMessageAttachment(attachment) && message.payload.parts !== undefined) {
                await getAttachmentContentFromMail(draft, attachment, dokumentType, message.payload)
            } else {
                let inlineAttachments = []
                let attachmentNameList = ""
                let mailContents = ''

                if (isPlainTextMail(message)) {
                    mailContents = decodePlainTextMailData(message.payload.body.data)
                } else if (isHtmlMailContent(message.payload)) {
                    mailContents = getHtmlMailContent(message.payload)
                } else if (isHtmlMailWithAttachments(message.payload)) {
                    attachmentNameList = createAttachmentNameList(selectedAttachments)

                    for (var j = 0; j < message.payload.parts.length; ++j) {
                        let payload = message.payload.parts[j]
                        if (isPlainTextMailWithAttachments(payload)) {
                            mailContents = decodePlainTextMailData(payload.body.data)
                        } else if (isHtmlMailContent(payload)) {
                            mailContents = getHtmlMailContent(payload)
                        } else if (isHtmlMailWithInlineAttachment(payload)) {
                            mailContents = await processMailContentAndInlineAttachments(draft, inlineAttachments, mailContents, payload)
                        }
                    }
                } else if (isHtmlMailWithInlineAttachment(message.payload)) {
                    mailContents = await processMailContentAndInlineAttachments(draft, inlineAttachments, mailContents, message.payload)
                }

                mailContents = inlineAttachmentInMailContent(inlineAttachments, mailContents)

                dokumentType.fil.base64 = Buffer.from(putMailContentInImportMessageTemplate(message, attachmentNameList, mailContents), 'utf8').toString('base64')
                dokumentType.veDokformat = DOCUMENT_FORMAT_HTML
            }
            journalPostAttachments.push(dokumentType)
        }
        return journalPostAttachments
    }

    async function getAttachmentContentFromMail(draft, attachment, dokumentType, payload) {
        for (var i = 0; i < payload.parts.length; ++i) {
            let attachmentPayload = payload.parts[i]
            if (attachmentPayload.parts !== undefined) {
                await getAttachmentContentFromMail(draft, attachment, dokumentType, attachmentPayload)
            } else {
                await putMessageContentIntoFiltype(draft, attachment, dokumentType, attachmentPayload)
            }
        }
    }

    function verifyThatOneAndOnlyOneMainDocumentIsSelected(draft) {
        let mainDocument = 0
        for (var i = 0; i < draft.attachments.length; ++i) {
            let selectedAttachment = draft.attachments[i]
            if (selectedAttachment.mainDocument) {
                mainDocument++
            }
        }

        if (mainDocument > 1) {
            throw new Error("Det er valgt flere enn ett hoveddokument.")
        } else if (mainDocument < 1) {
            throw new Error("Det er ikke valgt hoveddokument.")
        }
    }

    function verifySelectedAttachmentsExists(draft) {
        if (draft.attachments === undefined || draft.attachments.length === 0) {
            throw new Error("Vedleggslisten er tom.")
        }
    }

    async function setHandlerAndSenderDetails(session, draft, post) {
        if (draft.documentType === NOTE_WITHOUT_FOLLOWUP_DOCUMENTTYPE) {
            await createAndSetAvsmotForNoteWithoutFollowup(session, draft, post)
        } else {
            await createAndSetAvsmotForIncomingAndOutgoingDocument(session, draft, post)
        }
    }

    async function createAndSetAvsmotForNoteWithoutFollowup(session, draft, post) {
        let saksbehandler = n4wsBridge.createAvsMotTypeBaseObject()
        saksbehandler.amIhtype = IHTYPE_AVSENDER
        saksbehandler.amBehansv = BEHANSV_SAKSBEHANDLER
        await setHandlerOnJournalPost(session, draft, saksbehandler)

        if (draft.senderCode !== undefined) {
            let avsender = n4wsBridge.createAvsMotTypeBaseObject()
            avsender.amIhtype = IHTYPE_MOTTAKER
            let lookupUser = await departmentUserRegistry.lookupUser(draft.senderCode)
            if (lookupUser.code === '') {
                throw new Error("Oppgitt mottaker er ikke en gyldig saksbehandler.")
            } else {
                avsender.amKortnavn = lookupUser.code.toUpperCase()
                let departmentForUser = await departmentService.getDepartmentForUser(lookupUser.code)
                if (isDepartmentUserEmpty(departmentForUser)) {
                    throw new Error("Oppgitt mottaker tilhører ikke en enhet.")
                } else {
                    avsender.amAdmkort = departmentForUser.departmentCode
                    avsender.amJenhet = departmentForUser.journalUnit
                }
            }
            post.avsmot = [avsender, saksbehandler]
        } else {
            post.avsmot = [saksbehandler]
        }
    }

    async function createAndSetAvsmotForIncomingAndOutgoingDocument(session, draft, post) {
        let avsmot = n4wsBridge.createAvsMotTypeBaseObject()
        post.avsmot = [avsmot]
        await setHandlerOnJournalPost(session, draft, avsmot)
        await setSenderDetailsBasedOnDetailsGivenInDraft(draft, avsmot)
    }

    async function setHandlerOnJournalPost(session, draft, avsmot) {
        let user = undefined
        if ((await websakUserCheck.getUserStatus(session)).chooseHandler) {
            if (hasHandlerSet(draft)) {
                user = await departmentUserRegistry.lookupUser(draft.handler)

                if (user.code === '' && user.name === '') {
                    throw new Error("Saksbehandlerkoden er ikke gyldig.")
                }
            } else {
                throw new Error("Saksbehandlerkoden er ikke gyldig.")
            }
        } else if (hasHandlerSet(draft)) {
            throw new Error("Du har ikke tilgang til å importere som en annen saksbehandler.")
        } else {
            let adUser = await verifyAndGetAdUserForGmailUser(session)
            user = { code: adUser.username, name: adUser.displayname }
        }
        await verifyAndSetDepartmentAndJournalUnitOnJournalPost(user, avsmot)
        setSaksbehandlerOnJournalPost(avsmot, user)
    }


    function hasHandlerSet(draft) {
        return draft.handler !== undefined && draft.handler.length > 0
    }

    async function tryLoggingImport(emailAddress, journalPostId, draft, exception) {
        try {
            await importLog.logImport(emailAddress, journalPostId, draft, exception)
        } catch (error) {
            log.error(error)
        }
    }

    async function putMessageContentIntoFiltype(draft, attachment, dokumentType, messagePayload) {
        if (messagePayload.partId !== undefined && messagePayload.partId === attachment.id) {
            dokumentType.fil.base64 = await gmail.getAttachment(draft.mailId, messagePayload.body.attachmentId)
            dokumentType.veDokformat = messagePayload.filename.substring(messagePayload.filename.lastIndexOf('.') + 1)
        }
    }

    function setJpStatusBasedOnDocumentType(draft, post) {
        if (draft.documentType === INCOMING_DOCUMENTTYPE) {
            post.jpStatus = 'S'
        } else {
            post.jpStatus = 'R'
        }
    }

    function createErrorResponse(message) {
        return { status: MESSAGETYPE_ERROR_CODE, message: message }
    }

    async function processMailContentAndInlineAttachments(draft, inlineAttachments, mailContents, payload) {
        for (var i = 0; i < payload.parts.length; ++i) {
            let messagePayload = payload.parts[i]
            if (isHtmlMailContent(messagePayload)) {
                mailContents = getHtmlMailContent(messagePayload)
            } else if (isInlineAttachment(messagePayload)) {
                await createAndAddInlineAttachmentToList(draft, inlineAttachments, messagePayload)
            }
        }
        return mailContents
    }

    function putMailContentInImportMessageTemplate(message, attachmentNameList, mailContents) {
        return importedMailTemplate(
            he.escape(getHeader(message.payload, 'Subject')),
            he.escape(getHeader(message.payload, 'To').replace(/\\"/g, '')),
            he.escape(getHeader(message.payload, 'From').replace(/\\"/g, '')),
            getHeader(message.payload, 'CC') === '' ? '' : `<strong>Kopi:</strong> ${he.escape(getHeader(message.payload, 'CC').replace(/\\"/g, ''))} <br>`,
            fullFormatter(millisecondsToDate(message.internalDate)),
            attachmentNameList === '' ? '<em>Ingen</em>' : attachmentNameList,
            mailContents
        )
    }

    function inlineAttachmentInMailContent(inlineAttachments, mailContents) {
        for (var i = 0; i < inlineAttachments.length; ++i) {
            let inlineAttachment = inlineAttachments[i]
            let contentIdReplace = new RegExp(`cid:${inlineAttachment.contentId}`, 'g')
            mailContents =
                mailContents.replace(
                    contentIdReplace,
                    `data:${inlineAttachment.contentType};${inlineAttachment.encoding},${inlineAttachment.content}`
                )
        }
        return mailContents
    }

    function getHtmlMailContent(payload) {
        for (var i = 0; i < payload.parts.length; ++i) {
            let messagePayload = payload.parts[i]
            if (isHtmlVersionOfMessage(messagePayload)) {
                return decodeHtmlMailData(messagePayload)
            }
        }
        return ''
    }

    function decodeHtmlMailData(messagePayload) {
        return Buffer.from(messagePayload.body.data, 'base64').toString('utf8')
    }

    async function createAndAddInlineAttachmentToList(draft, inlineAttachments, messagePayload) {
        let inlineContent = await gmail.getAttachment(draft.mailId, messagePayload.body.attachmentId)
        let contentId = getHeader(messagePayload, 'Content-Id').replace(/[<>]/g, '')
        let type = getHeader(messagePayload, 'Content-Type').split(';')[0]
        let encoding = getHeader(messagePayload, 'Content-Transfer-Encoding')
        let inlineAttachment = { contentId: contentId, contentType: type, encoding: encoding, content: inlineContent }
        inlineAttachments.push(inlineAttachment)
    }

    function isInlineAttachment(messagePayload) {
        let contentDisposition = getHeader(messagePayload, 'Content-Disposition')
        let contentId = getHeader(messagePayload, 'Content-ID')
        return contentDisposition.startsWith('inline') || contentId.startsWith('<ii_')
    }

    function getHeader(messagePayload, name) {
        for (var i = 0; i < messagePayload.headers.length; ++i) {
            let header = messagePayload.headers[i]
            if (header.name.toUpperCase() === name.toUpperCase()) {
                return header.value
            }
        }

        return ''
    }

    function isHtmlMailWithInlineAttachment(payload) {
        return payload.mimeType === 'multipart/related'
    }

    function isHtmlVersionOfMessage(payload) {
        return payload.mimeType === 'text/html'
    }

    function decodePlainTextMailData(data) {
        return '<div style="white-space:pre-wrap">' + he.escape(Buffer.from(data, 'base64').toString('utf8')) + '</div>'
    }

    function isPlainTextMailWithAttachments(payload) {
        return payload.mimeType === 'text/plain' && payload.body.data != undefined
    }

    function isHtmlMailWithAttachments(payload) {
        return payload.mimeType === 'multipart/mixed'
    }

    function isHtmlMailContent(payload) {
        return payload.mimeType == 'multipart/alternative'
    }

    function isPlainTextMail(message) {
        return message.payload.mimeType === 'text/plain'
    }

    function createAttachmentNameList(selectedAttachments) {
        let attachmentNameList = ''
        for (var i = 0; i < selectedAttachments.length; ++i) {
            let journalAttachment = selectedAttachments[i]
            if (journalAttachment.id !== MAIL_MESSAGE_ATTACHMENT_ID) {
                attachmentNameList += journalAttachment.text + '; '
            }
        }

        attachmentNameList = trimTrailingSemicolon(attachmentNameList)

        return attachmentNameList
    }

    function trimTrailingSemicolon(attachmentNameList) {
        if (attachmentNameList !== '') {
            attachmentNameList = attachmentNameList.substring(0, attachmentNameList.length - 2)
        }
        return attachmentNameList
    }

    function createSelectedAttachmentList(draft, attachments) {
        let selectedAttachments = []
        for (var i = 0; i < attachments.length; ++i) {
            let attachment = attachments[i]
            for (var j = 0; j < draft.attachments.length; ++j) {
                let selectedAttachment = draft.attachments[j]
                if (selectedAttachment.attachmentId === attachment.id) {
                    selectedAttachments.push({ mainDocument: selectedAttachment.mainDocument, text: attachment.text, id: selectedAttachment.attachmentId })
                }
            }
        }
        return selectedAttachments
    }

    function isMailMessageAttachment(attachment) {
        return attachment.id === MAIL_MESSAGE_ATTACHMENT_ID
    }

    async function setSenderDetailsBasedOnDetailsGivenInDraft(draft, avsmot) {
        if (senderCodeIsUnset(draft)) {
            verifySenderNameIsSet(draft)
            setAllSenderDetailsFromDraft(draft, avsmot)
        } else {
            await lookupSenderFromAddressRegistry(draft, avsmot)
        }
    }

    function setSaksbehandlerOnJournalPost(avsmot, user) {
        avsmot.amSbhinit = user.code
        avsmot.amSbhnavn = user.name
    }

    function senderCodeIsUnset(draft) {
        return draft.senderCode === undefined || draft.senderCode.length === 0
    }

    async function lookupSenderFromAddressRegistry(draft, avsmot) {
        let results = await lookupAddressForCodeInDraft(draft)
        throwExceptionIfThereIsNoMatchingCodes(results)
        findCorrectSenderAndSetDetails(draft, avsmot, results)
    }

    function throwExceptionIfThereIsNoMatchingCodes(results) {
        if (results.length === 0) {
            throw new Error(MESSAGE_INVALID_SENDER_CODE)
        }
    }

    function findCorrectSenderAndSetDetails(draft, avsmot, results) {
        let foundMatch = false
        for (var i = 0; i < results.length; ++i) {
            let result = results[i]
            if (result.code === draft.senderCode) {
                foundMatch = true
                setSenderDetailsFromResult(avsmot, result)
            }
        }
        if (!foundMatch) {
            throw new Error(MESSAGE_INVALID_SENDER_CODE)
        }
    }

    function setSenderDetailsFromResult(avsmot, result) {
        avsmot.amKortnavn = result.code
        avsmot.amNavn = result.name
        avsmot.amAdresse = result.address1
        avsmot.amPostnr = result.zipcode
        avsmot.amPoststed = result.city
        avsmot.amEpostadr = result.mail
    }

    async function lookupAddressForCodeInDraft(draft) {
        return await addressRegistry.lookupCode(draft.senderCode)
    }

    async function verifyAndGetAdUserForGmailUser(session) {
        let adUser = await adService.lookupEmail(session.getUserEmail())
        verifyUsernameIsNotEmpty(adUser.username)
        return adUser
    }

    function setAllSenderDetailsFromDraft(draft, avsmot) {
        avsmot.amNavn = draft.senderName
        avsmot.amAdresse = draft.senderAddress
        avsmot.amPostnr = draft.senderZipCode
        avsmot.amPoststed = draft.senderCity
        avsmot.amEpostadr = draft.senderMail
    }

    function verifySenderNameIsSet(draft) {
        if (draft.senderName === undefined || draft.senderName === '') {
            throw new Error("Navnet til avsender er ugyldig.")
        }
    }

    async function verifyAndSetDepartmentAndJournalUnitOnJournalPost(user, avsmot) {
        let departmentForUser = await tryGettingDepartmentForADUser(user)
        avsmot.amAdmkort = departmentForUser.departmentCode
        avsmot.amJenhet = departmentForUser.journalUnit
    }

    async function tryGettingDepartmentForADUser(user) {
        let departmentForUser = await departmentService.getDepartmentForUser(user.code)
        verifyDepartmentIsNotEmpty(departmentForUser)
        return departmentForUser
    }

    function verifyDepartmentIsNotEmpty(departmentForUser) {
        if (isDepartmentUserEmpty(departmentForUser)) {
            throw new Error("Brukeren er ikke satt opp riktig i Websak.")
        }
    }

    function isDepartmentUserEmpty(department) {
        return department.departmentCode.length === 0 || department.journalUnit.length === 0
    }

    function verifyUsernameIsNotEmpty(username) {
        if (username.length === 0) {
            throw new Error("Ugyldig e-postadresse, er ikke koblet opp mot bruker.")
        }
    }

    function setArchiveDueDate(post) {
        let now = new Date()
        now.setMonth(now.getMonth() + 1)
        post.jpForfdato = dateFormatter(now)
    }

    function verifyAndSetDocumentDateOnJournalPost(message, post) {
        try {
            let dateReceived = millisecondsToDate(message.internalDate)
            verifyDateIsInThePast(message)
            setFormattedDateOnJournalPost(post, dateReceived)
        } catch (e) {
            throw new Error(MESSAGE_INVALID_DATE)
        }
    }

    function millisecondsToDate(millisecondsToEpoch) {
        return new Date(Number(millisecondsToEpoch))
    }

    function setFormattedDateOnJournalPost(post, dateReceived) {
        post.jpDokdato = dateFormatter(dateReceived)
    }

    function verifyDateIsInThePast(message) {
        let internalDate = message.internalDate
        let now = new Date()
        if (now.getTime() < internalDate) {
            let receivedDate = new Date(getHeader(message.payload, "Received").split(';')[1].trim(' '))
            if (!isNaN(receivedDate) && now < receivedDate) {
                throw new Error(MESSAGE_INVALID_DATE)
            }
        }
    }

    function setArchiveDocumentTypeOnJournalPost(draft, post) {
        post.jpNdoktype = draft.documentType
    }

    function setArchiveTitleOnJournalPost(draft, post) {
        post.jpInnhold = ''
        post.jpOffinnhold = draft.title
    }

    function setArchiveIdOnJournalPost(draft, post) {
        post.jpSaar = draft.archiveId.substring(0, 4)
        post.jpSaseknr = draft.archiveId.substring(4).replace(/^0*/, '')
    }

    function verifyDocumentTypeIsValid(draft) {
        if (draft.documentType === undefined || !draft.documentType.match("^[IUX]$")) {
            throw Error('ArkivsakDokumentType er ugyldig.')
        }
    }

    function verifyArchiveTitleIsValid(draft) {
        if (draft.title === undefined || draft.title === '') {
            throw new Error('ArkivsakTittel er ugyldig.')
        }
    }

    async function verifyArchiveIdIsValid(draft) {
        draft.archiveId = draft.archiveId.toString()
        if (!draft.archiveId.match(/^[0-9]{10}$/)) {
            throw new Error("ArkivsakId er ugyldig.")
        }

        try {
            await archiveIdService.getArchive(draft.archiveId)
        } catch (e) {
            throw Error(e.message)
        }
    }

    return {
        importJournalPost: async (session, draft) => {
            let response = undefined
            try {
                verifyDocumentTypeIsValid(draft)
                let service = getCorrectServiceBasedOnDocumentType(draft)
                let post = n4wsBridge.createJournpostTypeBaseObject()

                post.jpJdato = dateFormatter(new Date())
                setArchiveDueDate(post)

                await verifyArchiveIdIsValid(draft)
                verifyArchiveTitleIsValid(draft)
                verifySelectedAttachmentsExists(draft)
                verifyThatOneAndOnlyOneMainDocumentIsSelected(draft)

                setJpStatusBasedOnDocumentType(draft, post)
                setArchiveIdOnJournalPost(draft, post)
                setArchiveTitleOnJournalPost(draft, post)
                setArchiveDocumentTypeOnJournalPost(draft, post)
                await setHandlerAndSenderDetails(session, draft, post)

                let message = await gmail.getMessage(draft.mailId)
                verifyAndSetDocumentDateOnJournalPost(message, post)

                await putAttachmentsInJournalPost(draft, post, message)

                try {
                    response = await postJournalPostToWebService(service, post)
                    await tryLoggingImport(session.getUserEmail(), response.message, draft, undefined)
                } catch (e) {
                    if (exceptionIsContactWithMultipleCodes(e)) {
                        response = createErrorResponse(MESSAGE_DUPLICATE_SENDER_CODE)
                    } else {
                        log.error(e)
                        response = createErrorResponse(e.message)
                    }
                    await tryLoggingImport(session.getUserEmail(), undefined, draft, e)
                }
            } catch (e) {
                log.error(e)
                response = createErrorResponse(e.message)
                await tryLoggingImport(session.getUserEmail(), undefined, draft, e)
            }

            return response
        }
    }
}

module.exports = AcosImportService