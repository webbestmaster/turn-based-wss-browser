// @flow

/* eslint consistent-this: ["error", "server"] */

/* global __dirname */

const ip = require('ip'); // eslint-disable-line id-length
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const apiRouter = require('./api-router').apiRouter;
const roomMaster = require('./../room/master').roomMaster;

type ServerConstructorOptionsType = {|
    +port?: string
|};

const serverDefaultOptions: ServerConstructorOptionsType = {
    port: 3000,
    'static': 'static'
};

/**
 *
 * @param {Object} options - options for new TBW
 *      @param {number} options.port - port to lister
 *      @param {string} options.static - path to static files
 */
class Server {
    constructor(options: ServerConstructorOptionsType) {
        const server = this;

        const attr = {
            options: Object.assign(serverDefaultOptions, options),
            expressApp: null,
            httpServer: null,
            socketIoServer: null
        };

        const expressApp = express();
        const httpServer = http.Server(expressApp); // eslint-disable-line new-cap
        const socketIoServer = socketIo(httpServer);

        Object.assign(attr, {
            expressApp,
            httpServer,
            socketIoServer
        });

        server._attr = { // eslint-disable-line no-underscore-dangle, id-match
            options: Object.assign(serverDefaultOptions, options),
            expressApp,
            httpServer,
            socketIoServer
        };
    }

    run() {
        return new Promise((resolve, reject) => {
            const server = this;
            const httpServer = server.getHttpServer();
            const socketIoServer = server.getSocketIoServer();
            const options = server.getOptions();

            server.getExpressApp().use(express.static(server.getOptions().static));

            apiRouter.bindRoutes(server);

            httpServer.listen(options.port, () => {
                console.log('TBW listening on ' + ip.address() + ':' + options.port);
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

    destroy() {
        const server = this;
        const httpServer = server.getHttpServer();
        const socketIoServer = server.getSocketIoServer();
        const port = server.getOptions().port;

        // const expressApp = server.getExpressApp();

        roomMaster.destroy();

        return Promise
            .all([
                new Promise((resolve, reject) => socketIoServer.close(resolve)),
                new Promise((resolve, reject) => httpServer.close(resolve))
            ])
            .then(() => {
                console.log('TBW stop listen ' + ip.address() + ':' + port);
            });
    }

    getAttr() {
        return this._attr; // eslint-disable-line no-underscore-dangle
    }

    getExpressApp() {
        return this.getAttr().expressApp;
    }

    getHttpServer() {
        return this.getAttr().httpServer;
    }

    getSocketIoServer() {
        return this.getAttr().socketIoServer;
    }

    getOptions() {
        return this.getAttr().options;
    }
}

module.exports.Server = Server;
