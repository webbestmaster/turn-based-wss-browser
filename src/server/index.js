// @flow

/* eslint consistent-this: ["error", "server"] */

/* global __dirname */

const {LocalExpress} = require('./../local-express');
const {LocalSocketIoServer} = require('./../local-socket-io-server');
const {LocalHttpServer} = require('./../local-http-server');
const apiRouter = require('./api-router').apiRouter;
const roomMaster = require('./../room/master').roomMaster;
const {
    isBoolean,
    isNumber,
    isString,
    isFunction,
    isNotBoolean,
    isNotNumber,
    isNotString,
    isNotFunction
} = require('./../helper');

type ServerConstructorOptionsType = {|
    port: number
|};

const serverDefaultOptions: ServerConstructorOptionsType = {
    port: 3000
};

type AttrType = {|
    +options: ServerConstructorOptionsType,
    +expressApp: LocalExpress,
    +httpServer: LocalHttpServer,
    +socketIoServer: LocalSocketIoServer
|};

/**
 *
 * @param {Object} options - options for new TBW
 *      @param {number} options.port - port to lister
 */
class Server {
    _attr: AttrType; // eslint-disable-line no-underscore-dangle, id-match
    constructor(options: ServerConstructorOptionsType) {
        const server = this;

        const expressApp = new LocalExpress();
        const httpServer = new LocalHttpServer(expressApp);
        const socketIoServer = new LocalSocketIoServer(httpServer);

        server._attr = { // eslint-disable-line no-underscore-dangle, id-match
            options: {
                port: isNumber(options.port) ? options.port : serverDefaultOptions.port
            },
            expressApp,
            httpServer,
            socketIoServer
        };
    }

    run(): Promise<void> {
        return new Promise((resolve: () => void, reject: () => void) => {
            const server = this;
            const httpServer = server.getHttpServer();
            const socketIoServer = server.getSocketIoServer();
            const options = server.getOptions();

            // server.getExpressApp().use(express.static(server.getOptions().static));

            apiRouter.bindRoutes(server);

            httpServer.listen(options.port, () => {
                socketIoServer.bindEventListener();
                console.log('TBW listening on local:' + options.port);
                resolve();
            });

            /*
            // just debug info
            socketIoServer.on('connection', socket => {
                console.log(`Client connected [id=${socket.id}]`);

                socket.on('disconnect', () => {
                    console.log(`Client disconnected [id=${socket.id}]`);
                });
            });
            */
        });
    }

    destroy(): Promise<void> {
        const server = this;
        const httpServer = server.getHttpServer();
        const socketIoServer = server.getSocketIoServer();
        const options = server.getOptions();

        // const expressApp = server.getExpressApp();

        roomMaster.destroy();

        return Promise
            .all([
                new Promise((resolve: () => void, reject: () => void): void => socketIoServer.close(resolve)),
                new Promise((resolve: () => void, reject: () => void): void => httpServer.close(resolve))
            ])
            .then((): void => console.log('TBW stop listen on local:', options.port))
            .catch((error: Error) => {
                console.error('error with TBW stop listen on local:', options.port);
                console.error(error);
            });
    }

    getAttr(): AttrType {
        return this._attr; // eslint-disable-line no-underscore-dangle
    }

    getExpressApp(): LocalExpress {
        return this.getAttr().expressApp;
    }

    getHttpServer(): LocalHttpServer {
        return this.getAttr().httpServer;
    }

    getSocketIoServer(): LocalSocketIoServer {
        return this.getAttr().socketIoServer;
    }

    getOptions(): ServerConstructorOptionsType {
        return this.getAttr().options;
    }
}

module.exports.Server = Server;
