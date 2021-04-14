describe('AuthorizedHttpClientService', () => {
    const AuthorizedHttpClientService = require('../../src/services/AuthorizedHttpClientService')
    const EXPECTED_BEARER_TOKEN = 'test token', TEST_URL = 'some url'
    var service, httpClientMock

    beforeEach(() => {
        httpClientMock = jasmine.createSpyObj('httpclient', ['get'])
        httpClientMock.get.and.returnValue(Promise.resolve({ some: 'data' }))
        service = new AuthorizedHttpClientService(undefined, httpClientMock, EXPECTED_BEARER_TOKEN)
    })

    it('calls httpclient with correct headers set', async () => {
        await service.get(TEST_URL)

        expect(httpClientMock.get).toHaveBeenCalledWith(jasmine.anything(), { headers: { Authorization: EXPECTED_BEARER_TOKEN } })
    })

    it('calls httpclient with given url', async () => {
        await service.get(TEST_URL)

        expect(httpClientMock.get).toHaveBeenCalledWith(TEST_URL, jasmine.anything())
    })

    it('returns value from httpclient', async () => {
        let result = await service.get(TEST_URL)

        expect(result).toEqual({ some: 'data' })
    })
})