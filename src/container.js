async function Container() {
    let Bottle = require('bottlejs');
    let axios = require('axios')

    let config = require('./config');

    let indexRoutes = require('./routes/index');

    // Setup logging
    let log4js = require('log4js');
    log4js.configure({
        appenders: { 'out': { type: 'stdout' } },
        categories: { default: { appenders: ['out'], level: 'debug' } }
    });
    var log = log4js.getLogger('bottlejs');

    // Setup database connection pool.
    log.debug(`Connecting to database "${config.database.config.database}" as "${config.database.config.user}" on "${config.database.config.server}" ...`);
    if (config.database.config.password === undefined) {
        log.warn(`Password for database user "${config.database.config.user}" is "${config.database.config.password}"`);
    }
    let mssql = require('mssql');
    let sqlPool = await mssql.connect(config.database.config);
    log.debug('Connection to database established.');

    // Import types.
    let ActiveDirectoryService = require('./services/ActiveDirectoryService');
    let AcosImportService = require('./services/AcosImportService');
    let AcosNoarkService = require('./services/AcosNoarkService');
    let N4wsBridgeService = require('./services/N4wsBridgeService');
    let SessionService = require('./services/SessionService');
    let WebsakUserCheckService = require('./services/WebsakUserCheckService');
    let ArchiveIdService = require('./services/ArchiveIdService');
    let AttachmentsService = require('./services/AttachmentsService');
    let AuthorizedHttpClientService = require('./services/AuthorizedHttpClientService');
    let AddressRegistryService = require('./services/AddressRegistryService');
    let FileTypeRegistryService = require('./services/FileTypeRegistryService');
    let ImportLogService = require('./services/ImportLogService');
    let GmailClientService = require('./services/GmailClientService');
    let DepartmentUserRegistryService = require('./services/DepartmentUserRegistryService');
    let ImportLogLookupService = require('./services/ImportLogLookupService');
    let LastArchiveIdLookupService = require('./services/LastArchiveIdLookupService');
    let WebsakDepartmentService = require('./services/WebsakDepartmentService');
    let ImportLogLookupController = require('./controllers/ImportLogLookupController');
    let LastArchiveIdLookupController = require('./controllers/LastArchiveIdLookupController');
    let AttachmentsController = require('./controllers/AttachmentsController');
    let WebsakUserCheckController = require('./controllers/WebsakUserCheckController');
    let ArchiveIdController = require('./controllers/ArchiveIdController');
    let AddressRegistryController = require('./controllers/AddressRegistryController');
    let AcosImportController = require('./controllers/AcosImportController');
    let DepartmentUserRegistryController = require('./controllers/DepartmentUserRegistryController');
    let GoogleAuthenticationMiddleware = require('./middleware/GoogleAuthenticationMiddleware');
    let DepartmentUsersChooseHandlerMiddleware = require('./middleware/DepartmentUsersChooseHandlerMiddleware');

    const bottle = new Bottle();

    // Constants
    bottle.constant('log', log4js);
    bottle.constant('logger', log4js.getLogger);
    bottle.constant('config', config);
    bottle.constant('express', require('express'));
    bottle.constant('rawhttpclient', axios.create({ 'maxContentLength': Infinity, 'maxBodyLength': Infinity }))
    bottle.constant('htmlescape', require('he'))
    bottle.constant('xml', require('xml-js'))

    bottle.constant('ldap', require('ldapjs-no-python'));
    bottle.constant('sqlserver', sqlPool);

    // Miscellaneous
    bottle.factory('indexRoutes', c => indexRoutes(c));
    bottle.factory('DepartmentUsersChooseHandlerMiddleware', c => new DepartmentUsersChooseHandlerMiddleware(c.logger('DepartmentUsersChooseHandlerMiddleware'), c.config.authorization.choose_handler_addresses));
    bottle.factory('GoogleAuthenticationMiddleware', c => new GoogleAuthenticationMiddleware(c.logger('GoogleAuthenticationMiddleware'), c.config, c.rawhttpclient, c.SessionService));

    // Services
    bottle.factory('SessionService', c => c); // Pass container to decorator.
    bottle.decorator('SessionService', c => () => new SessionService(c.logger('SessionService'))); // Create new session instance each time.
    bottle.factory('AuthorizedHttpClientService', c => authorization => new AuthorizedHttpClientService(log, c.rawhttpclient, authorization));
    bottle.factory('ActiveDirectoryService', c => new ActiveDirectoryService(c.logger('ActiveDirectoryService'), c.ldap, c.config.ldap.config));
    bottle.factory('AttachmentsService', c => authorization => new AttachmentsService(c.logger('AttachmentsService'), c.GmailClientService(authorization), c.FileTypeRegistryService));
    bottle.factory('AcosImportService', c => authorization => new AcosImportService(c.logger('AcosImportService'), c.N4wsBridgeService, c.GmailClientService(authorization), c.WebsakDepartmentService, c.ActiveDirectoryService, c.AddressRegistryService, c.DepartmentUserRegistryService, c.AttachmentsService(authorization), c.ImportLogService(authorization), c.WebsakUserCheckService, c.ArchiveIdService, c.htmlescape));
    bottle.factory('AcosNoarkService', c => n4ws => new AcosNoarkService(c.logger('AcosNoarkService'), n4ws, c.rawhttpclient, c.htmlescape, c.xml));
    bottle.factory('N4wsBridgeService', c => new N4wsBridgeService(c.logger('N4wsBridgeService'), c.AcosNoarkService, c.config.n4ws));
    bottle.factory('GmailClientService', c => authorization => new GmailClientService(c.logger('GmailClientService'), c.AuthorizedHttpClientService(authorization)));
    bottle.factory('ImportLogService', c => authorization => new ImportLogService(c.logger('ImportLogService'), c.sqlserver, c.GmailClientService(authorization)));
    bottle.factory('LastArchiveIdLookupService', c => new LastArchiveIdLookupService(c.logger('LastArchiveIdLookupService'), c.sqlserver));
    bottle.factory('AddressRegistryService', c => new AddressRegistryService(c.logger('AddressRegistryService'), c.sqlserver));
    bottle.factory('ArchiveIdService', c => new ArchiveIdService(c.logger('ArchiveIdService'), c.sqlserver));
    bottle.factory('ImportLogLookupService', c => new ImportLogLookupService(c.logger('ImportLogLookupService'), c.sqlserver));
    bottle.factory('DepartmentUserRegistryService', c => new DepartmentUserRegistryService(c.logger('DepartmentUserRegistryService'), c.sqlserver));
    bottle.factory('WebsakDepartmentService', c => new WebsakDepartmentService(c.logger('WebsakDepartmentService'), c.sqlserver));
    bottle.factory('FileTypeRegistryService', c => new FileTypeRegistryService(c.logger('FileTypeRegistryService'), c.sqlserver));
    bottle.factory('WebsakUserCheckService', c => new WebsakUserCheckService(c.logger('WebsakUserCheckService'), c.config.authorization.choose_handler_addresses, c.WebsakDepartmentService, c.ActiveDirectoryService));

    // Controllers
    bottle.service('WebsakUserCheckController', WebsakUserCheckController, 'WebsakUserCheckService');
    bottle.service('DepartmentUserRegistryController', DepartmentUserRegistryController, 'DepartmentUserRegistryService');
    bottle.service('ImportLogLookupController', ImportLogLookupController, 'ImportLogLookupService');
    bottle.service('ArchiveIdController', ArchiveIdController, 'ArchiveIdService');
    bottle.service('AcosImportController', AcosImportController, 'AcosImportService');
    bottle.service('AddressRegistryController', AddressRegistryController, 'AddressRegistryService');
    bottle.service('AttachmentsController', AttachmentsController, 'AttachmentsService');
    bottle.service('LastArchiveIdLookupController', LastArchiveIdLookupController, 'ActiveDirectoryService', 'ArchiveIdService', 'LastArchiveIdLookupService');
    return bottle.container;
}

module.exports = Container();