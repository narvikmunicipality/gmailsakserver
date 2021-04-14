function N4wsBridgeService(log, acosNoark, n4ws) {
    return {
        createIncomingNoarkService: () => {
            return acosNoark(n4ws.incoming)
        },
        createOutgoingNoarkService: () => {
            return acosNoark(n4ws.outgoing)
        },

        createJournpostTypeBaseObject: () => {
            return {
                jpJdato: '',
                dokument: [],
                avsmot: [],
                jpStatus: '',
                jpForfdato: '',
                jpDokdato: '',
                jpNdoktype: '',
                jpInnhold: '',
                jpOffinnhold: '',
                jpSaar: '',
                jpSaseknr: ''
            }
        },
        createDokumentTypeBaseObject: () => {
            return {
                dlRnr: '',
                veVariant: '',
                dbKategori: '',
                dbStatus: '',
                dlType: '',
                dbTittel: '',
                veDokformat: '',
                fil: { base64: '' }
            }
        },
        createAvsMotTypeBaseObject: () => {
            return {
                amIhtype: '',
                amKortnavn: '',
                amAdmkort: '',
                amJenhet: '',
                amBehansv: '',
                amSbhinit: '',
                amSbhnavn: '',
                amNavn: '',
                amAdresse: '',
                amPostnr: '',
                amPoststed: '',
                amEpostadr: '',
            }
        }
    }
}

module.exports = N4wsBridgeService