describe('AddressRegistryService', () => {
    const AddressRegistryService = require('../../src/services/AddressRegistryService')
    var service, sqlMock, requestMock
    const recordsetWithoutResult = { recordset: [], output: {}, rowsAffected: [0] }
    const recordsetWithSingleResult = { recordset: [{ Gid_GidID: "1", Gid_GidKode: "TESTCODE", Gid_Navn: "Test Code", Gid_Adr: "Address", Gid_PostNr: "ZipCode", Gid_Poststed: "City", Gid_EmailAdr: "test@example.com", DuplikatGid: "0" }], output: {}, rowsAffected: [1] }
    const recordsetWithTwoResults = {
        recordset: [
            { Gid_GidID: "1", Gid_GidKode: "TESTCODE", Gid_Navn: "Test Code", Gid_Adr: "Address", Gid_PostNr: "ZipCode", Gid_Poststed: "City", Gid_EmailAdr: "test@example.com", DuplikatGid: "0" },
            { Gid_GidID: "2", Gid_GidKode: "TESTCODE2", Gid_Navn: "Test Code 2", Gid_Adr: "Address 2", Gid_PostNr: "ZipCode 2", Gid_Poststed: "City 2", Gid_EmailAdr: "test2@example.com", DuplikatGid: "1" }
        ], output: {}, rowsAffected: [2]
    }
    const EXPECTED_LOOKUP_CODE = 'testcode', EXPECTED_LOOKUP_EMAIL = 'testemail'

    beforeEach(() => {
        requestMock = jasmine.createSpyObj('request', ['input', 'query'])
        requestMock.input.and.returnValue(requestMock)

        sqlMock = jasmine.createSpyObj('sqlserver', ['request'])
        sqlMock.request.and.returnValue(requestMock)

        service = new AddressRegistryService(undefined, sqlMock)
    })

    describe('lookupCode', () => {
        it('requests new connection from sqlserver', () => {
            requestMock.query.and.returnValue(Promise.resolve(recordsetWithoutResult))

            service.lookupCode(EXPECTED_LOOKUP_CODE)

            expect(sqlMock.request).toHaveBeenCalled()
        })

        it('calls input with given code and adds wildcard at end', async () => {
            requestMock.query.and.returnValue(Promise.resolve(recordsetWithoutResult))

            service.lookupCode(EXPECTED_LOOKUP_CODE)

            expect(requestMock.input).toHaveBeenCalledWith('code', EXPECTED_LOOKUP_CODE + '%')
        })

        it('calls query with correct query', async () => {
            requestMock.query.and.returnValue(Promise.resolve(recordsetWithoutResult))

            service.lookupCode(EXPECTED_LOOKUP_CODE)

            expect(requestMock.query).toHaveBeenCalledWith("SELECT gid1.Gid_GidID, gid1.Gid_GidKode, gid1.Gid_Navn, gid1.Gid_Adr, gid1.Gid_PostNr, gid1.Gid_Poststed, gid1.Gid_EmailAdr, (SELECT CASE WHEN COUNT(gid2.Gid_GidKode) > 1 THEN '1' ELSE '0' END FROM Gid_Identitet gid2 WHERE gid2.Gid_GidKode=gid1.Gid_GidKode) AS DuplikatGid FROM Gid_Identitet gid1 WHERE (gid1.gid_gidkode like @code) AND ((gid1.gid_tildato >= CURRENT_TIMESTAMP OR gid1.gid_tildato IS NULL OR gid1.gid_tildato = '') AND (gid1.gid_fradato <= CURRENT_TIMESTAMP OR gid1.gid_fradato is null OR gid1.gid_fradato = '')) ORDER BY gid1.Gid_GidKode")
        })

        it('returns empty array when no entries found', async () => {
            requestMock.query.and.returnValue(Promise.resolve(recordsetWithoutResult))

            let result = await service.lookupCode(EXPECTED_LOOKUP_CODE)

            expect(result).toEqual([])
        })

        it('converts single item correctly to expected json', async () => {
            requestMock.query.and.returnValue(Promise.resolve(recordsetWithSingleResult))

            let result = await service.lookupCode(EXPECTED_LOOKUP_CODE)

            expect(result).toEqual([{
                id: '1',
                code: 'TESTCODE',
                name: 'Test Code',
                address1: 'Address',
                zipcode: 'ZipCode',
                city: 'City',
                mail: 'test@example.com',
                duplicate: false
            }])
        })

        it('converts every item correctly to expected json', async () => {
            requestMock.query.and.returnValue(Promise.resolve(recordsetWithTwoResults))

            let result = await service.lookupCode(EXPECTED_LOOKUP_CODE)

            expect(result).toEqual([{
                id: '1',
                code: 'TESTCODE',
                name: 'Test Code',
                address1: 'Address',
                zipcode: 'ZipCode',
                city: 'City',
                mail: 'test@example.com',
                duplicate: false
            },
            {
                id: '2',
                code: 'TESTCODE2',
                name: 'Test Code 2',
                address1: 'Address 2',
                zipcode: 'ZipCode 2',
                city: 'City 2',
                mail: 'test2@example.com',
                duplicate: true
            }])
        })
    })

    describe('lookupEmail', () => {
        it('requests new connection from sqlserver', () => {
            requestMock.query.and.returnValue(Promise.resolve(recordsetWithoutResult))

            service.lookupEmail(EXPECTED_LOOKUP_EMAIL)

            expect(sqlMock.request).toHaveBeenCalled()
        })

        it('calls input with given email and adds wildcard at end', async () => {
            requestMock.query.and.returnValue(Promise.resolve(recordsetWithoutResult))

            service.lookupEmail(EXPECTED_LOOKUP_EMAIL)

            expect(requestMock.input).toHaveBeenCalledWith('email', EXPECTED_LOOKUP_EMAIL + '%')
        })

        it('calls query with correct query', async () => {
            requestMock.query.and.returnValue(Promise.resolve(recordsetWithoutResult))

            service.lookupEmail(EXPECTED_LOOKUP_EMAIL)

            expect(requestMock.query).toHaveBeenCalledWith("SELECT gid1.Gid_GidID, gid1.Gid_GidKode, gid1.Gid_Navn, gid1.Gid_Adr, gid1.Gid_PostNr, gid1.Gid_Poststed, gid1.Gid_EmailAdr, (SELECT CASE WHEN COUNT(gid2.Gid_GidKode) > 1 THEN '1' ELSE '0' END FROM Gid_Identitet gid2 WHERE gid2.Gid_GidKode=gid1.Gid_GidKode) AS DuplikatGid FROM Gid_Identitet gid1 WHERE (gid1.gid_emailadr like @email) AND ((gid1.gid_tildato >= CURRENT_TIMESTAMP OR gid1.gid_tildato IS NULL OR gid1.gid_tildato = '') AND (gid1.gid_fradato <= CURRENT_TIMESTAMP OR gid1.gid_fradato is null OR gid1.gid_fradato = '')) ORDER BY gid1.Gid_GidKode")
        })

        it('returns empty array when no entries found', async () => {
            requestMock.query.and.returnValue(Promise.resolve(recordsetWithoutResult))

            let result = await service.lookupEmail(EXPECTED_LOOKUP_EMAIL)

            expect(result).toEqual([])
        })

        it('converts single item correctly to expected json', async () => {
            requestMock.query.and.returnValue(Promise.resolve(recordsetWithSingleResult))

            let result = await service.lookupEmail(EXPECTED_LOOKUP_EMAIL)

            expect(result).toEqual([{
                id: '1',
                code: 'TESTCODE',
                name: 'Test Code',
                address1: 'Address',
                zipcode: 'ZipCode',
                city: 'City',
                mail: 'test@example.com',
                duplicate: false
            }])
        })

        it('converts every item correctly to expected json', async () => {
            requestMock.query.and.returnValue(Promise.resolve(recordsetWithTwoResults))

            let result = await service.lookupEmail(EXPECTED_LOOKUP_EMAIL)

            expect(result).toEqual([{
                id: '1',
                code: 'TESTCODE',
                name: 'Test Code',
                address1: 'Address',
                zipcode: 'ZipCode',
                city: 'City',
                mail: 'test@example.com',
                duplicate: false
            },
            {
                id: '2',
                code: 'TESTCODE2',
                name: 'Test Code 2',
                address1: 'Address 2',
                zipcode: 'ZipCode 2',
                city: 'City 2',
                mail: 'test2@example.com',
                duplicate: true
            }])
        })
    })
})