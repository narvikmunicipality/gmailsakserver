describe('ArchiveIdController', () => {
    const ArchiveIdController = require('../../src/controllers/DepartmentUserRegistryController');
    const expectedControllerReceiversValue = 'test_value1', expectedControllerDepartmentUsersValue = 'test_value2', expectedKeyword = 'test_keyword';
    var controller, departmentUserRegistryServiceMock, resultMock, requestStub;

    beforeEach(() => {
        departmentUserRegistryServiceMock = jasmine.createSpyObj('DepartmentUserRegistryService', ['getDepartmentUserList', 'searchUsersMatchingKeyword']);
        departmentUserRegistryServiceMock.getDepartmentUserList.and.returnValue(Promise.resolve(expectedControllerDepartmentUsersValue));
        departmentUserRegistryServiceMock.searchUsersMatchingKeyword.and.returnValue(Promise.resolve(expectedControllerReceiversValue));
        resultMock = jasmine.createSpyObj('result', ['send']);
        requestStub = { query: { keyword: expectedKeyword }};

        controller = ArchiveIdController(departmentUserRegistryServiceMock);
    });
    
    it('queries searchUsersMatchingKeyword with keyword in query string', async () => {
        await controller.receivers_get(requestStub, resultMock);

        expect(departmentUserRegistryServiceMock.searchUsersMatchingKeyword).toHaveBeenCalledWith(expectedKeyword);
    });

    it('sends result from searchUsersMatchingKeyword as result to query', async () => {
        await controller.receivers_get(requestStub, resultMock);

        expect(resultMock.send).toHaveBeenCalledWith(expectedControllerReceiversValue);
    });

    it('sends result from getDepartmentUserList as result to query', async () => {
        await controller.departmentusers_get(requestStub, resultMock);

        expect(resultMock.send).toHaveBeenCalledWith(expectedControllerDepartmentUsersValue);
    });    
});