function AttachmentsService(log, gmailClient, filetypeRegistry) {
    function createMessageAttachment(message) {
        function subject(message) {
            var subjectValue = ''
            message.payload.headers.forEach(header => {
                if (header.name === "Subject") {
                    subjectValue = header.value
                }
            })

            return subjectValue
        }

        return {
            id: '68dbdf13b423ade4121dd9466ebc4362', // Id er MD5-sum av 'Eposten', og brukes for e-postmeldingen.
            text: subject(message),
            isImportable: true,
        }
    }

    async function addPayloadAttachments(payload) {
        var attachments = []
        for (let i = 0; i < payload.parts.length; ++i) {
            let payloadPart = payload.parts[i]
            if (payloadPart.mimeType !== 'multipart/alternative') {
                if (!isMailMessageAttachment(payloadPart)) {
                    attachments.push(await createAttachmentFromPayload(payloadPart))
                } else {
                    if (hasParts(payloadPart)) {
                        attachments = attachments.concat(await addAttachmentsInParts(payloadPart.parts))
                    }
                }
            }
        }
        return attachments
    }

    async function addAttachmentsInParts(parts) {
        var attachments = []
        for (let i = 0; i < parts.length; ++i) {
            let payloadPart = parts[i]
            if (isMessageWithAttachments(payloadPart)) {
                attachments = attachments.concat(await addPayloadAttachments(payloadPart))
            } else if (payloadPart.mimeType !== 'multipart/alternative') {
                attachments.push(await createAttachmentFromPayload(payloadPart))
            }
        }
        return attachments
    }

    async function createAttachmentFromPayload(payload) {
        let isImportable = await filetypeRegistry.isValid(payload.filename.substring(payload.filename.lastIndexOf('.') + 1))
        return {
            id: payload.partId,
            text: payload.filename,
            isImportable: isImportable
        }
    }

    function isMailMessageAttachment(payload) {
        return ((payload.mimeType == 'multipart/related' || payload.mimeType === 'text/plain')
            && payload.body.attachmentId === undefined) || (payload.mimeType === 'message/rfc822')
    }

    function isMessageWithAttachments(payload) {
        return hasParts(payload) && payload.mimeType === 'multipart/mixed'
    }

    function hasParts(payload) {
        return payload.parts !== undefined
    }

    return {
        getAttachments: async mailId => {
            let attachments = []
            let message = await gmailClient.getMessage(mailId)

            let attachment = createMessageAttachment(message)
            attachments.push(attachment)

            if (message.payload.mimeType === 'text/plain') {
                return attachments
            } else if (isMessageWithAttachments(message.payload)) {
                attachments = attachments.concat(await addPayloadAttachments(message.payload))
            } else if (isMailMessageAttachment(message.payload)) {
                attachments = attachments.concat(await addAttachmentsInParts(message.payload.parts))
            }

            return attachments
        }
    }
}

module.exports = AttachmentsService