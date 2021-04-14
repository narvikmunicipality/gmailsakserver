describe('WebsakUserCheckService', () => {
    const WebsakUserCheckService = require('../../src/services/WebsakUserCheckService');
    const expectedEmailAddress = 'gmailsak@example.com';
    const chooseHandlerList = ['handler@example.com', 'other@example.com'];
    var service, departmentServiceMock, adServiceMock, sessionMock;

    beforeEach(() => {
        departmentServiceMock = jasmine.createSpyObj('departmentService', ['getDepartmentForUser']);
        adServiceMock = jasmine.createSpyObj('activeDirectoryService', ['lookupEmail']);
        adServiceMock.lookupEmail.and.returnValue(Promise.resolve({ username: 'gsak', displayname: 'Gmail Sak' }));
        sessionMock = jasmine.createSpyObj('session', ['getUserEmail']);
        sessionMock.getUserEmail.and.returnValue(expectedEmailAddress);

        service = new WebsakUserCheckService(undefined, chooseHandlerList, departmentServiceMock, adServiceMock);
    });

    it('queries active directory service with session email address', async () => {
        departmentServiceMock.getDepartmentForUser.and.returnValue(Promise.resolve({ journalUnit: 'JRN', departmentCode: 'DEP' }));

        await service.getUserStatus(sessionMock);

        expect(adServiceMock.lookupEmail).toHaveBeenCalledWith(expectedEmailAddress);
    });

    it('queries department service with username from active directory service', async () => {
        departmentServiceMock.getDepartmentForUser.and.returnValue(Promise.resolve({ journalUnit: 'JRN', departmentCode: 'DEP' }));

        await service.getUserStatus(sessionMock);

        expect(departmentServiceMock.getDepartmentForUser).toHaveBeenCalledWith('gsak');
    });

    it('returns valid when user got both journal unit and department', async () => {
        departmentServiceMock.getDepartmentForUser.and.returnValue(Promise.resolve({ journalUnit: 'JRN', departmentCode: 'DEP' }));

        let result = await service.getUserStatus(sessionMock);
        
        expect(result.valid).toBe(true);
    });
    
    it('returns invalid when user does not have journal unit', async () => {
        departmentServiceMock.getDepartmentForUser.and.returnValue(Promise.resolve({ journalUnit: '', departmentCode: 'DEP' }));
        
        let result = await service.getUserStatus(sessionMock);
        
        expect(result.valid).toBe(false);
    });
    
    it('returns invalid when user does not have department code', async () => {
        departmentServiceMock.getDepartmentForUser.and.returnValue(Promise.resolve({ journalUnit: 'JRN', departmentCode: '' }));
        
        let result = await service.getUserStatus(sessionMock);

        expect(result.valid).toBe(false);
    });

    it('returns false for chooseHandler when current user is not in approved list', async () => {
        departmentServiceMock.getDepartmentForUser.and.returnValue(Promise.resolve({ journalUnit: 'JRN', departmentCode: 'DEP' }));
        
        let result = await service.getUserStatus(sessionMock);

        expect(result.chooseHandler).toBe(false);
    });

    it('returns true for chooseHandler when current user is in approved list', async () => {
        departmentServiceMock.getDepartmentForUser.and.returnValue(Promise.resolve({ journalUnit: 'JRN', departmentCode: 'DEP' }));
        sessionMock.getUserEmail.and.returnValue('handler@example.com');

        let result = await service.getUserStatus(sessionMock);

        expect(result.chooseHandler).toBe(true);
    });    
});