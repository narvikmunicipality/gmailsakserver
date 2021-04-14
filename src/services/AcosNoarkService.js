function AcosNoarkService(log, n4wsUrl, httpclient, he, xml) {
    function emptyStringIfUndefined(checkValue, definedValue) {
        return checkValue !== undefined ? definedValue : ''
    }

    function xmlTag(tagName, value) {
        return `<${tagName}>${value && he.escape(value)}</${tagName}>`
    }

    function toXml(from, attribute) {
        return emptyStringIfUndefined(from[attribute], xmlTag(attribute, from[attribute]))
    }

    function avsmot(journalPost) {
        let xml = ''
        for (var i = 0; i < journalPost.avsmot.length; ++i) {
            let am = journalPost.avsmot[i]
            xml += `\
<avsmot>\
${toXml(am, 'amIhtype')}\
${toXml(am, 'amKortnavn')}\
${toXml(am, 'amAdmkort')}\
${toXml(am, 'amJenhet')}\
${toXml(am, 'amBehansv')}\
${toXml(am, 'amSbhinit')}\
${toXml(am, 'amSbhnavn')}\
${toXml(am, 'amNavn')}\
${toXml(am, 'amAdresse')}\
${toXml(am, 'amPostnr')}\
${toXml(am, 'amPoststed')}\
${toXml(am, 'amEpostadr')}\
</avsmot>`
        }

        return xml
    }

    function dokument(journalPost) {
        let xml = ''
        for (var i = 0; i < journalPost.dokument.length; ++i) {
            let dok = journalPost.dokument[i]
            xml += `\
<dokument>\
${toXml(dok, 'dlRnr')}\
${toXml(dok, 'veVariant')}\
${toXml(dok, 'dbKategori')}\
${toXml(dok, 'dbStatus')}\
${toXml(dok, 'dlType')}\
${toXml(dok, 'dbTittel')}\
${toXml(dok, 'veDokformat')}\
<fil>${toXml(dok.fil, 'base64')}</fil>\
</dokument>`
        }

        return xml
    }

    function createEnvelope(journalPost) {
        return `<?xml version="1.0" encoding="UTF-8"?>\
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">\
<soapenv:Body>\
<PutJournpostRequest xmlns="http://www.arkivverket.no/Noark4WS/types">\
<journpost xmlns="">\
${toXml(journalPost, 'jpJdato')}\
${toXml(journalPost, 'jpNdoktype')}\
${toXml(journalPost, 'jpDokdato')}\
${toXml(journalPost, 'jpStatus')}\
${toXml(journalPost, 'jpInnhold')}\
${toXml(journalPost, 'jpForfdato')}\
${toXml(journalPost, 'jpSaar')}\
${toXml(journalPost, 'jpSaseknr')}\
${toXml(journalPost, 'jpOffinnhold')}\
${avsmot(journalPost)}\
${dokument(journalPost)}\
</journpost>\
</PutJournpostRequest>\
</soapenv:Body>\
</soapenv:Envelope>`
    }
    return {
        putJournpost: async (journalPost) => {
            let response = { status: '', message: '' }
            try {
                let result = await httpclient.post(n4wsUrl, createEnvelope(journalPost), { headers: { 'Content-Type': 'text/xml; charset=utf-8', 'SOAPAction': '"urn:#PutJournpost"' } })
                let parsedResult = xml.xml2js(result.data, { compact: true })
                let message = parsedResult['soap:Envelope']['soap:Body']['PutJournpostResponse']['status']['message']
                response = { status: message._attributes.code, message: message.text._text }
            } catch (e) {
                log.error(e)
                if (e.response.headers['content-type'].includes('text/xml') && e.response.data !== '') {
                    let parsedResult = xml.xml2js(e.response.data, { compact: true })
                    let errorMessage = parsedResult['soap:Envelope']['soap:Body']['soap:Fault']['faultstring']['_text']

                    if (errorMessage.includes('Subquery returned more than 1 value.')) {
                        throw new Error(errorMessage)
                    }

                    response = { status: 'ERROR', message: he.decode(errorMessage) }
                } else {
                    throw e
                }
            }

            return response
        }
    }
}

module.exports = AcosNoarkService;