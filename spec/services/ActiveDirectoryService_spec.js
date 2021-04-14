describe('ActiveDirectoryService', () => {
    const ActiveDirectoryService = require('../../src/services/ActiveDirectoryService');
    const expectedEmailAddress = 'gmailsak@example.com';
    const LdapEntry = { dn: 'CN=User - user,DC=com', controls: [], displayName: 'User Name', sAMAccountName: 'user' };
    const expectedClientConfig = {
        user: 'ldapuser',
        password: 'password',
        timeout: 10000,
        serverUrl: 'ldap://example.com',
        basedn: 'CN=base,DC=dn',
    };
    var service, ldapjsMock, ldapClientMock;

    function resolveSearchSuccessfullyWithNoItems() {
        ldapClientMock.search.and.callFake((b, o, setupCallback) => {
            setupCallback(undefined, {
                on: (eventName, callback) => {
                    if (eventName === 'end') { callback({ status: 0 }); }
                }
            });
        });
    }

    function resolveBindSuccessfully() {
        ldapClientMock.bind.and.callFake((u, p, stateCallback) => { stateCallback(); });
    }

    beforeEach(() => {
        ldapClientMock = jasmine.createSpyObj('client', ['bind', 'unbind', 'search']);
        ldapjsMock = jasmine.createSpyObj('ldapjs', ['createClient']);
        ldapjsMock.createClient.and.returnValue(ldapClientMock);

        service = new ActiveDirectoryService(undefined, ldapjsMock, expectedClientConfig);
    });


    it('creates a ldap client with correct parameters', async () => {
        resolveBindSuccessfully();
        resolveSearchSuccessfullyWithNoItems();

        await service.lookupEmail(expectedEmailAddress);

        expect(ldapjsMock.createClient).toHaveBeenCalledWith({ url: expectedClientConfig.serverUrl, timeout: expectedClientConfig.timeout });
    });

    it('binds to given username and password', async () => {
        resolveBindSuccessfully();
        resolveSearchSuccessfullyWithNoItems();

        await service.lookupEmail(expectedEmailAddress);

        expect(ldapClientMock.bind).toHaveBeenCalledWith(expectedClientConfig.user, expectedClientConfig.password, jasmine.anything());
    });

    it('throws exception when bind fails', async () => {
        ldapClientMock.bind.and.callFake((u, p, stateCallback) => { stateCallback('bind error'); });

        try {
            await service.lookupEmail(expectedEmailAddress);
        } catch (err) {
            expect(err).toEqual('bind error');
            return;
        }

        fail('Should throw exception');
    });

    describe('search', () => {
        beforeEach(() => {
            resolveBindSuccessfully();
        });

        it('calls search with correct basedn', async () => {
            resolveSearchSuccessfullyWithNoItems();

            await service.lookupEmail(expectedEmailAddress);

            expect(ldapClientMock.search).toHaveBeenCalledWith(expectedClientConfig.basedn, jasmine.anything(), jasmine.anything());
        });

        it('calls search with correct options', async () => {
            let expectedOptions = { scope: 'sub', attributes: ['samaccountname', 'displayname'], filter: "(&(objectClass=user)(mail=gmailsak@example.com))" };
            resolveSearchSuccessfullyWithNoItems();

            await service.lookupEmail(expectedEmailAddress);

            expect(ldapClientMock.search).toHaveBeenCalledWith(jasmine.anything(), expectedOptions, jasmine.anything());
        });

        it('throws exception when search fails setup', async () => {
            ldapClientMock.search.and.callFake((b, o, setupCallback) => { setupCallback('setup error', { on: eventName => { } }); });

            try {
                await service.lookupEmail(expectedEmailAddress);
            } catch (err) {
                expect(err).toEqual('setup error');
                return;
            }

            fail('Should throw exception');
        });

        it('does not register on-events when search fails setup', async () => {
            var registeredEvents = 0;
            ldapClientMock.search.and.callFake((b, o, setupCallback) => { setupCallback('setup error', { on: eventName => { registeredEvents++; } }); });

            try {
                await service.lookupEmail(expectedEmailAddress);
            } catch (err) {
                expect(registeredEvents).toBe(0);
                return;
            }

            fail('Should throw exception');
        });

        it('throws exception when search encounters ldap error', async () => {
            ldapClientMock.search.and.callFake((b, o, setupCallback) => {
                setupCallback(undefined, {
                    on: (eventName, callback) => {
                        if (eventName === 'end') { callback({ status: 1337 }); }
                    }
                });
            });

            try {
                await service.lookupEmail(expectedEmailAddress);
            } catch (err) {
                expect(err).toEqual(new Error('LDAP error encountered: 1337'));
                return;
            }

            fail('Should throw exception');
        });

        it('throws exception when search encounters an error', async () => {
            ldapClientMock.search.and.callFake((b, o, setupCallback) => {
                setupCallback(undefined, {
                    on: (eventName, callback) => {
                        if (eventName === 'error') { callback(new Error('an error')); }
                    }
                });
            });

            try {
                await service.lookupEmail(expectedEmailAddress);
            } catch (err) {
                expect(err).toEqual(new Error('an error'));
                return;
            }

            fail('Should throw exception');
        });

        it('returns items from searchEntry event', async () => {
            ldapClientMock.search.and.callFake((b, o, setupCallback) => {
                setupCallback(undefined, {
                    on: (eventName, callback) => {
                        if (eventName === 'end') { callback({ status: 0 }); }
                        else if (eventName === 'searchEntry') { callback({ object: LdapEntry }); }
                    }
                });
            });

            let result = await service.lookupEmail(expectedEmailAddress);

            expect(result).toEqual({ username: 'user', displayname: 'User Name' });
        });

        it('returns empty array when searchEntry event never called', async () => {
            resolveSearchSuccessfullyWithNoItems();

            let result = await service.lookupEmail(expectedEmailAddress);

            expect(result).toEqual({ username: '', displayname: '' });
        });

        it('calls unbind after end event is called', async () => {
            resolveSearchSuccessfullyWithNoItems();

            let result = await service.lookupEmail(expectedEmailAddress);

            expect(ldapClientMock.unbind).toHaveBeenCalledWith(jasmine.anything());
        });
    });
});