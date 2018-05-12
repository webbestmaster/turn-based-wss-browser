// @flow

/* global setTimeout */

/* eslint consistent-this: ["error", "localSocketIoServer"] */

const {LocalHttpServer} = require('./../local-http-server');
const {LocalSocketIoClient} = require('./../local-socket-io-client');

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

    connectSocket(socket: LocalSocketIoClient) {
        const localSocketIoServer = this;
        const {sockets} = localSocketIoServer;
    }

    close(callback?: () => void) {
        const localSocketIoServer = this;

        if (typeof callback === 'function') {
            setTimeout(callback, 0);
        }
    }

    to(socketId: string): LocalSocketIoClient {
        console.error('implement!!!!, get LocalSocketIoClient with socketId', socketId);
        return new LocalSocketIoClient();
    }
}

module.exports.LocalSocketIoServer = LocalSocketIoServer;
