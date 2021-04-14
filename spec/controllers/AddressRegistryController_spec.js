describe('AddressRegistryController', () => {
    const AddressRegistryController = require('../../src/controllers/AddressRegistryController');
    const expectedControllerEmailValue = {
        id: 'test id',
        code: 'test code',
        name: 'test name',
        address1: 'test address',
        zipcode: 'test zip code',
        city: 'test city',
        mail: 'mail',
        duplicate: false,
    };
    const expectedControllerCodeValue = {
        id: 'test id',
        code: 'code',
        name: 'test name',
        address1: 'test address',
        zipcode: 'test zip code',
        city: 'test city',
        mail: 'test mail',
        duplicate: false,
    };
    const expectedEmailAddress = 'mail', expectedCode = 'code';
    var controller, addressRegistryServiceMock, resultMock;

    beforeEach(() => {
        addressRegistryServiceMock = jasmine.createSpyObj('AddressRegistryService', ['lookupEmail', 'lookupCode']);
        addressRegistryServiceMock.lookupEmail.and.returnValue(Promise.resolve(expectedControllerEmailValue));
        addressRegistryServiceMock.lookupCode.and.returnValue(Promise.resolve(expectedControllerCodeValue));
        resultMock = jasmine.createSpyObj('result', ['send']);

        controller = AddressRegistryController(addressRegistryServiceMock);
    });

    it('queries address registry service with mail in query string', async () => {
        await controller.get({ query: { mail: expectedEmailAddress } }, resultMock);

        expect(addressRegistryServiceMock.lookupEmail).toHaveBeenCalledWith(expectedEmailAddress);
    });

    it('sends result from archive id service as result to query', async () => {
        await controller.get({ query: { mail: expectedEmailAddress } }, resultMock);

        expect(resultMock.send).toHaveBeenCalledWith(expectedControllerEmailValue);
    });

    it('queries address registry service with code in query string', async () => {
        await controller.get({ query: { code: expectedCode } }, resultMock);

        expect(addressRegistryServiceMock.lookupCode).toHaveBeenCalledWith(expectedCode);
    });

    it('sends result from archive id service as result to query', async () => {
        await controller.get({ query: { code: expectedCode } }, resultMock);

        expect(resultMock.send).toHaveBeenCalledWith(expectedControllerCodeValue);
    });

    it('sends empty result when no keywords are set', async () => {
        await controller.get({ query: {} }, resultMock);

        expect(resultMock.send).toHaveBeenCalledWith([]);
    });
});