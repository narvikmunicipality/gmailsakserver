(async () => {
    var c = await require('./container'); // Dependency injection container

    var app = c.express();
    app.use(c.log.connectLogger(c.logger("http"), { level: 'auto' }));
    app.use(c.express.static('static'));
    app.use(c.express.json())
    app.use(c.GoogleAuthenticationMiddleware);
    app.use('/', c.indexRoutes);

    var log = c.logger("app");
    log.debug('Starting server ...');
    app.listen(c.config.server.port, c.config.server.address, () => {
        log.info(`Server is listening on http://${c.config.server.address}:${c.config.server.port}/`);
    });
})();