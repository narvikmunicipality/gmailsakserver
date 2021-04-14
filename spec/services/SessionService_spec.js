describe('SessionService', () => {
    const SessionService = require('../../src/services/SessionService');
    var service;

    beforeEach(() => {
        service = new SessionService(undefined);
    });

    it('stores given email address for later retrieval', () => {
        service.setUserEmail('gmailsak@example.com');

        expect(service.getUserEmail()).toEqual('gmailsak@example.com');
    });
});