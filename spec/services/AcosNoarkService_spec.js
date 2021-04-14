describe('AcosNoarkService', () => {
    const AcosNoarkService = require('../../src/services/AcosNoarkService')
    const he = require('he'), xml = require('xml-js')
    const TEST_MINIMAL_AND_INVALID_ENVELOPE = '<?xml version="1.0" encoding="UTF-8"?><soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><soapenv:Body><PutJournpostRequest xmlns="http://www.arkivverket.no/Noark4WS/types"><journpost xmlns=""></journpost></PutJournpostRequest></soapenv:Body></soapenv:Envelope>',
        TEST_ROOT_ITEMS_ENVELOPE = '<?xml version="1.0" encoding="UTF-8"?><soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><soapenv:Body><PutJournpostRequest xmlns="http://www.arkivverket.no/Noark4WS/types"><journpost xmlns=""><jpJdato>20200206</jpJdato><jpNdoktype>I</jpNdoktype><jpDokdato>20200131</jpDokdato><jpStatus>S</jpStatus><jpInnhold></jpInnhold><jpForfdato>20200307</jpForfdato><jpSaar>2020</jpSaar><jpSaseknr>2</jpSaseknr><jpOffinnhold>Importtest</jpOffinnhold></journpost></PutJournpostRequest></soapenv:Body></soapenv:Envelope>',
        TEST_AVSMOT_ITEMS_ENVELOPE = '<?xml version="1.0" encoding="UTF-8"?><soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><soapenv:Body><PutJournpostRequest xmlns="http://www.arkivverket.no/Noark4WS/types"><journpost xmlns=""><avsmot><amIhtype>0</amIhtype><amKortnavn>KODE</amKortnavn><amAdmkort>ADM</amAdmkort><amJenhet>ENH</amJenhet><amBehansv>1</amBehansv><amSbhinit>SBEH</amSbhinit><amSbhnavn>Navn Saksbehandler</amSbhnavn><amNavn>Navn Navnesen</amNavn><amAdresse>Adresse 1</amAdresse><amPostnr>1234</amPostnr><amPoststed>Poststed</amPoststed><amEpostadr>gmailsak@example.com</amEpostadr></avsmot><avsmot><amIhtype>1</amIhtype><amKortnavn>EDOK</amKortnavn><amAdmkort>MDA</amAdmkort><amJenhet>HNE</amJenhet><amBehansv>0</amBehansv><amSbhinit>HBES</amSbhinit><amSbhnavn>Ukjent Behandler</amSbhnavn><amNavn>Test Testersen</amNavn><amAdresse>Gate 2</amAdresse><amPostnr>4321</amPostnr><amPoststed>Stedpost</amPoststed><amEpostadr>ukjent@example.com</amEpostadr></avsmot></journpost></PutJournpostRequest></soapenv:Body></soapenv:Envelope>',
        TEST_DOKUMENT_ITEMS_ENVELOPE = '<?xml version="1.0" encoding="UTF-8"?><soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><soapenv:Body><PutJournpostRequest xmlns="http://www.arkivverket.no/Noark4WS/types"><journpost xmlns=""><dokument><dlRnr>1</dlRnr><veVariant>P</veVariant><dbKategori>EP</dbKategori><dbStatus>B</dbStatus><dlType>V</dlType><dbTittel>Vedlegg</dbTittel><veDokformat>PDF</veDokformat><fil><base64>abc</base64></fil></dokument><dokument><dlRnr>2</dlRnr><veVariant>P</veVariant><dbKategori>E</dbKategori><dbStatus>B</dbStatus><dlType>P</dlType><dbTittel>Tilfeldig</dbTittel><veDokformat>EXE</veDokformat><fil><base64>def</base64></fil></dokument></journpost></PutJournpostRequest></soapenv:Body></soapenv:Envelope>',
        TEST_ESCAPED_ITEMS_ENVELOPE = '<?xml version="1.0" encoding="UTF-8"?><soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><soapenv:Body><PutJournpostRequest xmlns="http://www.arkivverket.no/Noark4WS/types"><journpost xmlns=""><jpJdato>&lt;</jpJdato><jpNdoktype>&amp;</jpNdoktype><jpDokdato>&amp;</jpDokdato><jpStatus>&gt;</jpStatus><jpInnhold>&amp;</jpInnhold><jpForfdato>&amp;</jpForfdato><jpSaar>&amp;</jpSaar><jpSaseknr>&amp;</jpSaseknr><jpOffinnhold>&amp;</jpOffinnhold><avsmot><amIhtype>&amp;</amIhtype><amKortnavn>&amp;</amKortnavn><amAdmkort>&amp;</amAdmkort><amJenhet>&amp;</amJenhet><amBehansv>&amp;</amBehansv><amSbhinit>&amp;</amSbhinit><amSbhnavn>&amp;</amSbhnavn><amNavn>&amp;</amNavn><amAdresse>&amp;</amAdresse><amPostnr>&amp;</amPostnr><amPoststed>&amp;</amPoststed><amEpostadr>&amp;</amEpostadr></avsmot><dokument><dlRnr>&amp;</dlRnr><veVariant>&amp;</veVariant><dbKategori>&amp;</dbKategori><dbStatus>&amp;</dbStatus><dlType>&amp;</dlType><dbTittel>&amp;</dbTittel><veDokformat>&amp;</veDokformat><fil><base64>&amp;</base64></fil></dokument></journpost></PutJournpostRequest></soapenv:Body></soapenv:Envelope>',
        SUCCESSFUL_IMPORT_RESULT = '<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema"><soap:Body><PutJournpostResponse xmlns="http://www.arkivverket.no/Noark4WS/types"><status type="OK" xmlns=""><message code="jp.id"><text>2018007599</text></message></status></PutJournpostResponse></soap:Body></soap:Envelope>',
        XML_FAILED_IMPORT_RESULT = '<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema"><soap:Body><soap:Fault><faultcode>soap:Server</faultcode><faultstring>Server was unable to process request. ---&gt; Error: arkivsakid is missing.</faultstring><detail /></soap:Fault></soap:Body></soap:Envelope>',
        DUPLICATE_CODE_FAILED_IMPORT_RESULT = '<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema"><soap:Body><soap:Fault><faultcode>soap:Server</faultcode><faultstring>Server was unable to process request. ---&gt; Error saving Journalpost 17.02.2020 00:00:00 ---&gt; Subquery returned more than 1 value. This is not permitted when the subquery follows =, !=, &lt;, &lt;= , &gt;, &gt;= or when the subquery is used as an expression.</faultstring><detail /></soap:Fault></soap:Body></soap:Envelope>',
        HTML_FAILED_IMPORT_RESULT = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"><html xmlns="http://www.w3.org/1999/xhtml"><head><meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1"/><title>405 - HTTP verb used to access this page is not allowed.</title><style type="text/css"><!--body{margin:0;font-size:.7em;font-family:Verdana, Arial, Helvetica, sans-serif;background:#EEEEEE;}fieldset{padding:0 15px 10px 15px;}h1{font-size:2.4em;margin:0;color:#FFF;}h2{font-size:1.7em;margin:0;color:#CC0000;}h3{font-size:1.2em;margin:10px 0 0 0;color:#000000;}#header{width:96%;margin:0 0 0 0;padding:6px 2% 6px 2%;font-family:"trebuchet MS", Verdana, sans-serif;color:#FFF;background-color:#555555;}#content{margin:0 0 0 2%;position:relative;}.content-container{background:#FFF;width:96%;margin-top:8px;padding:10px;position:relative;}--></style></head><body><div id="header"><h1>Server Error</h1></div><div id="content"><div class="content-container"><fieldset><h2>405 - HTTP verb used to access this page is not allowed.</h2><h3>The page you are looking for cannot be displayed because an invalid method (HTTP verb) was used to attempt access.</h3></fieldset></div></div></body></html>'
        TEST_EXPECTED_URL = 'some n4ws url'
    var postXml
    var service, httpClientMock, logMock

    beforeEach(() => {
        logMock = jasmine.createSpyObj('logger', ['error'])

        httpClientMock = jasmine.createSpyObj('httpclient', ['post'])
        httpClientMock.post.and.callFake((url, xml, params) => { postXml = xml; return { data: SUCCESSFUL_IMPORT_RESULT } })

        service = new AcosNoarkService(logMock, TEST_EXPECTED_URL, httpClientMock, he, xml)
    })

    it('posts to given url', async () => {
        await service.putJournpost({ avsmot: [], dokument: [] })

        expect(httpClientMock.post).toHaveBeenCalledWith(TEST_EXPECTED_URL, jasmine.anything(), jasmine.anything())
    })

    it('posts with correct headers', async () => {
        await service.putJournpost({ avsmot: [], dokument: [] })

        expect(httpClientMock.post).toHaveBeenCalledWith(jasmine.anything(), jasmine.anything(), { headers: { 'Content-Type': 'text/xml; charset=utf-8', 'SOAPAction': '"urn:#PutJournpost"' } })
    })

    it('given empty journalpost posts minimal xml soap envelope', async () => {
        await service.putJournpost({ avsmot: [], dokument: [] })

        expect(postXml).toEqual(TEST_MINIMAL_AND_INVALID_ENVELOPE)
    })

    it('return value is correctly parsed and returned as json', async () => {
        let result = await service.putJournpost({ avsmot: [], dokument: [] })

        expect(result).toEqual({ status: 'jp.id', message: '2018007599' })
    })

    it('returns error message when import fails', async () => {
        httpClientMock.post.and.returnValue(Promise.reject({ response: { status: 500, headers: { 'content-type': 'text/xml; charset=utf-8' }, data: XML_FAILED_IMPORT_RESULT } }))

        let result = await service.putJournpost({ avsmot: [], dokument: [] })

        expect(result).toEqual({ status: 'ERROR', message: 'Server was unable to process request. ---> Error: arkivsakid is missing.' })
    })

    describe('logs exceptions', () => {
        it('when import returns error message', async () => {
            const expectedError = { response: { status: 500, headers: { 'content-type': 'text/xml; charset=utf-8' }, data: XML_FAILED_IMPORT_RESULT } }
            httpClientMock.post.and.returnValue(Promise.reject(expectedError))
            
            await service.putJournpost({ avsmot: [], dokument: [] })
            
            expect(logMock.error).toHaveBeenCalledWith(expectedError)
        })

        it('when import throws error', async () => {
            const expectedErrorContent = { response: { status: 500, headers: { 'content-type': 'text/xml' }, data: '' } }
            httpClientMock.post.and.returnValue(Promise.reject(expectedErrorContent))
    
            try {
                await service.putJournpost({ avsmot: [], dokument: [] })
            }
            catch (ignored) {
                expect(logMock.error).toHaveBeenCalledWith(expectedErrorContent)
            }
        })        
    })

    it('throws error when import failure result is text/xml and empty body', async () => {
        const expectedErrorContent = { response: { status: 500, headers: { 'content-type': 'text/xml' }, data: '' } }
        httpClientMock.post.and.returnValue(Promise.reject(expectedErrorContent))

        try {
            await service.putJournpost({ avsmot: [], dokument: [] })
        }
        catch (error) {
            expect(error).toEqual(expectedErrorContent)
        }
    })

    it('throws error when import failure result is not text/xml', async () => {
        const expectedErrorContent = { response: { status: 500, headers: { 'content-type': 'text/html' }, data: HTML_FAILED_IMPORT_RESULT } }
        httpClientMock.post.and.returnValue(Promise.reject(expectedErrorContent))

        try {
            await service.putJournpost({ avsmot: [], dokument: [] })
        }
        catch (error) {
            expect(error).toEqual(expectedErrorContent)
        }
    })

    it('throws error when import failure because of duplicate contact codes', async () => {
        httpClientMock.post.and.returnValue(Promise.reject({ response: { status: 500, headers: { 'content-type': 'text/xml' }, data: DUPLICATE_CODE_FAILED_IMPORT_RESULT } }))

        try {
            await service.putJournpost({ avsmot: [], dokument: [] })
        }
        catch (error) {
            expect(error).toEqual(Error('Server was unable to process request. ---> Error saving Journalpost 17.02.2020 00:00:00 ---> Subquery returned more than 1 value. This is not permitted when the subquery follows =, !=, <, <= , >, >= or when the subquery is used as an expression.'))
        }
    })

    it('given journalpost with all root items posts correct xml soap envelope', async () => {
        await service.putJournpost({
            jpJdato: '20200206',
            jpStatus: 'S',
            jpForfdato: '20200307',
            jpDokdato: '20200131',
            jpNdoktype: 'I',
            jpInnhold: '',
            jpOffinnhold: 'Importtest',
            jpSaar: '2020',
            jpSaseknr: '2',
            avsmot: [],
            dokument: []
        })

        expect(postXml).toEqual(TEST_ROOT_ITEMS_ENVELOPE)
    })

    it('given journalpost with multiple avsmot items posts correct xml soap envelope', async () => {
        await service.putJournpost({
            avsmot: [{
                amIhtype: '0',
                amKortnavn: 'KODE',
                amAdmkort: 'ADM',
                amJenhet: 'ENH',
                amBehansv: '1',
                amSbhinit: 'SBEH',
                amSbhnavn: 'Navn Saksbehandler',
                amNavn: 'Navn Navnesen',
                amAdresse: 'Adresse 1',
                amPostnr: '1234',
                amPoststed: 'Poststed',
                amEpostadr: 'gmailsak@example.com',
            }, {
                amIhtype: '1',
                amKortnavn: 'EDOK',
                amAdmkort: 'MDA',
                amJenhet: 'HNE',
                amBehansv: '0',
                amSbhinit: 'HBES',
                amSbhnavn: 'Ukjent Behandler',
                amNavn: 'Test Testersen',
                amAdresse: 'Gate 2',
                amPostnr: '4321',
                amPoststed: 'Stedpost',
                amEpostadr: 'ukjent@example.com',
            }],
            dokument: []
        })

        expect(postXml).toEqual(TEST_AVSMOT_ITEMS_ENVELOPE)
    })

    it('given journalpost with multiple dokument items posts correct xml soap envelope', async () => {
        await service.putJournpost({
            avsmot: [],
            dokument: [{
                dlRnr: '1',
                veVariant: 'P',
                dbKategori: 'EP',
                dbStatus: 'B',
                dlType: 'V',
                dbTittel: 'Vedlegg',
                veDokformat: 'PDF',
                fil: { base64: 'abc' }
            }, {
                dlRnr: '2',
                veVariant: 'P',
                dbKategori: 'E',
                dbStatus: 'B',
                dlType: 'P',
                dbTittel: 'Tilfeldig',
                veDokformat: 'EXE',
                fil: { base64: 'def' }
            }]
        })

        expect(postXml).toEqual(TEST_DOKUMENT_ITEMS_ENVELOPE)
    })

    it('given journalpost with characters that must be escaped items posts correct xml soap envelope', async () => {
        await service.putJournpost({
            jpJdato: '<',
            jpStatus: '>',
            jpForfdato: '&',
            jpDokdato: '&',
            jpNdoktype: '&',
            jpInnhold: '&',
            jpOffinnhold: '&',
            jpSaar: '&',
            jpSaseknr: '&',
            avsmot: [
                {
                    amIhtype: '&',
                    amKortnavn: '&',
                    amAdmkort: '&',
                    amJenhet: '&',
                    amBehansv: '&',
                    amSbhinit: '&',
                    amSbhnavn: '&',
                    amNavn: '&',
                    amAdresse: '&',
                    amPostnr: '&',
                    amPoststed: '&',
                    amEpostadr: '&',
                }
            ],
            dokument: [
                {
                    dlRnr: '&',
                    veVariant: '&',
                    dbKategori: '&',
                    dbStatus: '&',
                    dlType: '&',
                    dbTittel: '&',
                    veDokformat: '&',
                    fil: {
                        base64: '&'
                    }
                }
            ]
        })

        expect(postXml).toEqual(TEST_ESCAPED_ITEMS_ENVELOPE)
    })
})