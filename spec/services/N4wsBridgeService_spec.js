describe('N4wsBridgeService', () => {
    const N4wsBridgeService = require('../../src/services/N4wsBridgeService')
    const EXPECTED_NOARK_SERVICE = 'AcosNoarkInstance', EXPECTED_INCOMING_N4WS_URL = 'incoming_url', EXPECTED_OUTGOING_N4WS_URL = 'outgoing_url'
    var service, acosNoarkServiceSpy, n4wsConfig

    beforeEach(() => {
        acosNoarkServiceSpy = jasmine.createSpy('AcosNoarkService')
        acosNoarkServiceSpy.and.returnValue(EXPECTED_NOARK_SERVICE)

        n4wsConfig = { incoming: EXPECTED_INCOMING_N4WS_URL, outgoing: EXPECTED_OUTGOING_N4WS_URL }

        service = new N4wsBridgeService(undefined, acosNoarkServiceSpy, n4wsConfig)
    })

    it('creates minimum required JournpostType base object', () => {
        let expectedBaseObject = { jpJdato: '', dokument: [], avsmot: [], jpStatus: '', jpForfdato: '', jpDokdato: '', jpNdoktype: '', jpInnhold: '', jpOffinnhold: '', jpSaar: '', jpSaseknr: '' }

        expect(service.createJournpostTypeBaseObject()).toEqual(expectedBaseObject)
    })

    it('creates minimum required base DokumentType object', () => {
        let expectedBaseObject = { dlRnr: '', veVariant: '', dbKategori: '', dbStatus: '', dlType: '', dlType: '', dbTittel: '', veDokformat: '', fil: { base64: '' } }

        expect(service.createDokumentTypeBaseObject()).toEqual(expectedBaseObject)
    })

    it('creates minimum required base AvsMotType object', () => {
        let expectedBaseObject = { amIhtype: '', amKortnavn: '', amAdmkort: '', amJenhet: '', amIhtype: '', amBehansv: '', amSbhinit: '', amSbhnavn: '', amKortnavn: '', amNavn: '', amAdresse: '', amPostnr: '', amPoststed: '', amEpostadr: '', amNavn: '', amAdresse: '', amPostnr: '', amPoststed: '', amEpostadr: '', amAdmkort: '', amJenhet: '' }

        expect(service.createAvsMotTypeBaseObject()).toEqual(expectedBaseObject)
    })

    describe('createIncomingNoarkService', () => {
        it('returns created service', () => {
            let result = service.createIncomingNoarkService()

            expect(result).toEqual(EXPECTED_NOARK_SERVICE)
        })
        
        it('creates service with correct url', () => {
            service.createIncomingNoarkService()

            expect(acosNoarkServiceSpy).toHaveBeenCalledWith(EXPECTED_INCOMING_N4WS_URL)
        })
    })
    
    describe('createOutgoingNoarkService', () => {
        it('returns created service', () => {
            let result = service.createOutgoingNoarkService()

            expect(result).toEqual(EXPECTED_NOARK_SERVICE)
        })
        
        it('creates service with correct url', () => {
            service.createOutgoingNoarkService()

            expect(acosNoarkServiceSpy).toHaveBeenCalledWith(EXPECTED_OUTGOING_N4WS_URL)
        })
    })
})