// @flow

/* eslint consistent-this: ["error", "roomConnection"] */

const messageConst = require('../message-data.js');
const roomConfig = require('../config-data.js');
const Stopwatch = require('timer-stopwatch');
const {Server} = require('./../../server/index');
const {Room} = require('./../index');
const {LocalSocketIoClient} = require('./../../local-socket-io-client');

type RoomConnectionConstructorOptionType = {|
    +userId: string,
    +socketId: string,
    +room: Room
|};

type AttrType = {|
    userId: string,
    socketId: string,
    room: Room,
    timers: {|
        onDisconnect: Stopwatch | null
    |}
|};


/**
 *
 * @constructor
 * @param {Object} options - options for new room's connection
 *      @param {String} options.socketId - socket's id
 *      @param {String} options.userId - user's id
 *      @param {Object} options.room - parent room
 */
class RoomConnection {
    _attr: AttrType; // eslint-disable-line no-underscore-dangle, id-match

    constructor(options: RoomConnectionConstructorOptionType) {
        const roomConnection = this;

        roomConnection._attr = { // eslint-disable-line no-underscore-dangle, id-match
            socketId: options.socketId,
            userId: options.userId,
            room: options.room,
            timers: {
                onDisconnect: null
            }
        };
    }

    bindEventListeners() {
        const roomConnection = this;
        const socketId = roomConnection.getSocketId();
        const socket = roomConnection.getSocket();

        if (socket === null) {
            console.error('--- ERROR ---> bindEventListeners: Can not find socket with id:', socketId);
            return;
        }

        socket.on('disconnect', () => {
            roomConnection.onDisconnect();
        });
    }

    unBindEventListeners() {
        const roomConnection = this;
        const socketId = roomConnection.getSocketId();
        const socket = roomConnection.getSocket();
        const timers = roomConnection.getTimers();

        if (timers.onDisconnect !== null) {
            timers.onDisconnect.stop();
        }

        if (socket === null) {
            // if socket has been disconnected from client, socket missing from socketIoServer
            console.error('--- ERROR ---> unBindEventListeners: Can not find socket with id:', socketId);
            return;
        }

        socket.removeAllListeners();
    }

    onDisconnect() {
        const roomConnection = this;
        const room = roomConnection.getRoom();

        room.pushStateForce({
            type: messageConst.type.userDisconnected,
            roomId: room.getId(),
            userId: roomConnection.getUserId()
        });

        const timer = new Stopwatch(roomConfig.timers.onUserDisconnect.time);

        timer.start();

        timer.onDone(() => {
            timer.stop();
            room.leave(roomConnection.getUserId());
        });
    }

    destroy() {
        const roomConnection = this;

        roomConnection.unBindEventListeners();
    }

    getUserId(): string {
        const roomConnection = this;

        return roomConnection.getAttr().userId;
    }

    setSocketId(socketId: string) {
        const roomConnection = this;

        roomConnection.getAttr().socketId = socketId;
    }

    getSocketId(): string {
        return this.getAttr().socketId;
    }

    getSocket(): LocalSocketIoClient | null {
        const roomConnection = this;
        const socketId = roomConnection.getSocketId();
        const server = roomConnection.getServer();
        const socketIoServer = server.getSocketIoServer();

        return socketIoServer.sockets.connected[socketId] || null;
    }

    getTimers(): {| onDisconnect: Stopwatch | null |} {
        return this.getAttr().timers;
    }

    getServer(): Server {
        return this.getRoom().getServer();
    }

    getRoom(): Room {
        return this.getAttr().room;
    }

    getAttr(): AttrType {
        return this._attr; // eslint-disable-line no-underscore-dangle
    }
}

module.exports.RoomConnection = RoomConnection;
