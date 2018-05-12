// @flow

/* global setTimeout */

/* eslint consistent-this: ["error", "localSocketIoServer"] */

const {LocalHttpServer} = require('./../local-http-server');
const {LocalSocketIoClient} = require('./../local-socket-io-client');

const {localMaster} = require('./../local-master');

/*
return socketIoServer.sockets.connected[socketId] || null;
*/

/*
const socketIoServer = server.getSocketIoServer();

connections.forEach(connection => {
    socketIoServer.to(connection.getAttr().socketId).emit('message', data);
});
*/


type AttrType = {|
    +localHttpServer: LocalHttpServer
|};

type SocketsType = {|
    +connected: { [key: string]: LocalSocketIoClient }
|};


class LocalSocketIoServer {
    attr: AttrType;
    sockets: SocketsType;

    constructor(localHttpServer: LocalHttpServer) {
        const localSocketIoServer = this;

        localSocketIoServer.attr = {
            localHttpServer
        };

        localSocketIoServer.sockets = {
            connected: {}
        };
    }

    bindEventListener() {
        const localSocketIoServer = this;

        localMaster.addSocketIoServer(localSocketIoServer);
    }

    unbindEventListener() {
        const localSocketIoServer = this;

        localMaster.removeSocketIoServer(localSocketIoServer);
    }

    connectSocket(socket: LocalSocketIoClient) {
        const localSocketIoServer = this;
        const {sockets} = localSocketIoServer;
    }

    to(socketId: string): LocalSocketIoClient {
        console.error('implement!!!!, get LocalSocketIoClient with socketId', socketId);
        return new LocalSocketIoClient();
    }

    close(callback?: () => void) {
        const localSocketIoServer = this;

        localSocketIoServer.unbindEventListener();

        if (typeof callback === 'function') {
            setTimeout(callback, 0);
        }
    }
}

module.exports.LocalSocketIoServer = LocalSocketIoServer;
