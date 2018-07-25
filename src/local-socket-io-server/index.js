// @flow

/* global setTimeout */

/* eslint consistent-this: ["error", "localSocketIoServer"] */

const {LocalHttpServer} = require('./../local-http-server');
const {LocalSocketIoClient} = require('./../local-socket-io-client');

const {localMaster} = require('./../local-master');

const {isFunction} = require('./../helper');

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
    +connected: {[key: string]: LocalSocketIoClient}
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

        sockets.connected[socket.id] = socket;
    }

    disconnectSocket(socket: LocalSocketIoClient) {
        const localSocketIoServer = this;
        const {sockets} = localSocketIoServer;

        sockets.connected[socket.id].removeAllListeners();

        Reflect.deleteProperty(sockets.connected, socket.id);
    }

    to(socketId: string): LocalSocketIoClient | null {
        const localSocketIoServer = this;
        const {sockets} = localSocketIoServer;

        return sockets.connected[socketId] || null;
    }

    close(callback?: () => void) {
        const localSocketIoServer = this;
        const {sockets} = localSocketIoServer;

        localSocketIoServer.unbindEventListener();

        Object.keys(sockets.connected).forEach((key: string) => {
            const socket = sockets.connected[key];

            socket.disconnect();
            localSocketIoServer.disconnectSocket(socket);
        });

        if (isFunction(callback)) {
            setTimeout(callback, 0);
        }
    }
}

module.exports.LocalSocketIoServer = LocalSocketIoServer;
