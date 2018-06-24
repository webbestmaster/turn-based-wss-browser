// @flow

/* eslint consistent-this: ["error", "room"] */

type PushedStatePayloadIsGameStartedType = {|
    +isGameStart: boolean,
    +activeUserId: string,
    +map: mixed // MapType
|};

export type PushedStatePayloadUnitMoveType = {|
    +type: 'move',
    +path: mixed, // PathType,
    +from: {|
        +x: number,
        +y: number
    |},
    +to: {|
        +x: number,
        +y: number
    |},
    +unit: {|
        +id: string
    |},
    +map: mixed, // MapType,
    +activeUserId: string
|};

export type PushedStatePayloadUnitAttackType = {|
    +type: 'attack',
    +aggressor: mixed, // AttackResultUnitType,
    +defender: mixed, // AttackResultUnitType,
    +map: mixed, // MapType,
    +activeUserId: string
|};

export type PushedStatePayloadFixBuildingType = {|
    +type: 'fix-building',
    +building: mixed, // BuildingType,
    +map: mixed, // MapType,
    +activeUserId: string
|};

export type PushedStatePayloadOccupyBuildingType = {|
    +type: 'occupy-building',
    +building: mixed, // BuildingType,
    +map: mixed, // MapType,
    +activeUserId: string
|};

export type PushedStatePayloadRaiseSkeletonType = {|
    +type: 'raise-skeleton',
    +raiser: {|
        +x: number,
        +y: number,
        +id: string,
        +userId: string,
        +newUnitId: string
    |},
    +grave: {|
        +x: number,
        +y: number
    |},
    +map: mixed, // MapType,
    +activeUserId: string
|};

export type PushedStatePayloadDestroyBuildingType = {|
    +type: 'destroy-building',
    +destroyer: {|
        +x: number,
        +y: number,
        +id: string,
        +userId: string
    |},
    +building: {|
        +x: number,
        +y: number,
        +type: mixed, // BuildingAttrTypeType,
        +id: string
    |},
    +map: mixed, // MapType,
    +activeUserId: string
|};

export type PushedStatePayloadRefreshUnitListType = {|
    +type: 'refresh-unit-list',
    +map: mixed, // MapType,
    +activeUserId: string
|};

export type PushedStatePayloadBuyUnitType = {|
    +type: 'buy-unit',
    +newMapUnit: mixed, // UnitType,
    +map: mixed, // MapType,
    +activeUserId: string
|};

export type PushedStatePayloadSyncMapWithServerUserListType = {|
    +type: 'sync-map-with-server-user-list',
    +map: mixed, // MapType,
    +activeUserId: string
|};

export type MetaType = {|
    order: number,
    timestamp: number,
    hash: string
|};

export type PushedStatePayloadType = PushedStatePayloadIsGameStartedType
    | PushedStatePayloadUnitMoveType
    | PushedStatePayloadUnitAttackType
    | PushedStatePayloadRefreshUnitListType
    | PushedStatePayloadFixBuildingType
    | PushedStatePayloadOccupyBuildingType
    | PushedStatePayloadRaiseSkeletonType
    | PushedStatePayloadDestroyBuildingType
    | PushedStatePayloadBuyUnitType
    | PushedStatePayloadSyncMapWithServerUserListType;


export type PushedStateType = {|
    type: string,
    +state: PushedStatePayloadType,
    meta?: MetaType
|} | {|
    type: string,
    +roomId: string,
    activeUserId?: string,
    userId?: string,
    +socketId?: string,
    meta?: MetaType
|} | null;


const {roomMaster} = require('./master');
const {RoomConnection} = require('./room-connection');
const {Server} = require('./../server/index');
const find = require('lodash/find');
const sha1 = require('sha1');
const messageConst = require('./message-data.js');
const roomPrivate = require('./private');
const Stopwatch = require('timer-stopwatch');

let roomId = 0;

type RoomConstructorOptionsType = {|
    +server: Server
|};

// export type SettingsType = { [key: string]: mixed };
export type SettingsType = PushedStateType | { [key: string]: mixed };

type AttrType = {|
    connections: Array<RoomConnection>,
    id: string,
    activeUserId: string,
    defaultActiveUserId: string,
    states: Array<PushedStateType>,
    settings: SettingsType,
    timers: {|
        // will destroy room, if room has no connections
        onCreateRoom: Stopwatch | null
    |}, // will extend by private.bindTimers
    server: Server
|};

class Room {
    _attr: AttrType; // eslint-disable-line no-underscore-dangle, id-match

    constructor(options: RoomConstructorOptionsType) {
        const room = this;
        const defaultActiveUserId = 'user-id-default-' + String(Math.random()).slice(2);

        roomId += 1;

        room._attr = { // eslint-disable-line no-underscore-dangle, id-match
            connections: [],
            id: 'room-id-' + roomId,
            activeUserId: defaultActiveUserId,
            defaultActiveUserId,
            states: [],
            settings: {},
            timers: {
                // will destroy room, if room has no connections
                onCreateRoom: null
            }, // will extend by private.bindTimers
            server: options.server
        };

        roomPrivate.bindTimers(room);

        roomMaster.push(room);
    }

    giveTurn(userId: string): string {
        const room = this;
        const activeUserId = room.getActiveUserId();
        const userConnection = room.getRoomConnectionByUserId(userId);

        if (userConnection === null) {
            return activeUserId;
        }

        const defaultActiveUserId = room.getDefaultActiveUserId();

        if (activeUserId === defaultActiveUserId) {
            room.pushStateForce({
                type: messageConst.type.takeTurn,
                roomId: room.getId(),
                activeUserId: userId
            });
            room.getAttr().activeUserId = userId;
            return userId;
        }

        return activeUserId;
    }

    dropTurn(userId: string): string {
        const room = this;
        const activeUserId = room.getActiveUserId();

        if (activeUserId !== userId) {
            return activeUserId;
        }

        room.pushStateForce({
            type: messageConst.type.dropTurn,
            roomId: room.getId(),
            activeUserId: userId
        });

        const nextRoomConnection = room.getNextRoomConnectionByUserId(userId);

        if (nextRoomConnection === null) {
            return userId;
        }

        const nextActiveUserId = nextRoomConnection.getUserId();

        room.pushStateForce({
            type: messageConst.type.takeTurn,
            roomId: room.getId(),
            activeUserId: nextActiveUserId
        });

        room.getAttr().activeUserId = nextActiveUserId;

        return nextActiveUserId;
    }

    join(roomConnectionOptions: {| +userId: string, +socketId: string |}) {
        const room = this;
        const connections = room.getConnections();
        const userId = roomConnectionOptions.userId;

        const existRoomConnection = find(connections,
            (connection: RoomConnection): boolean => connection.getUserId() === userId);

        if (existRoomConnection) {
            existRoomConnection.unBindEventListeners();
            existRoomConnection.setSocketId(roomConnectionOptions.socketId);
            existRoomConnection.bindEventListeners();
            return;
        }

        const newRoomConnection = new RoomConnection({
            type: 'human',
            userId: roomConnectionOptions.userId,
            socketId: roomConnectionOptions.socketId,
            room
        });

        newRoomConnection.bindEventListeners();

        connections.push(newRoomConnection);

        room.pushStateForce({
            type: messageConst.type.joinIntoRoom,
            roomId: room.getId(),
            userId: roomConnectionOptions.userId,
            socketId: roomConnectionOptions.socketId
        });
    }

    makeBot(): {| userId: string, socketId: string |} {
        const room = this;
        const connections = room.getConnections();
        const userId = 'bot-user-id-' + String(Math.random()).slice(2);
        const socketId = 'bot-socket-id-' + String(Math.random()).slice(2);

        const newRoomConnection = new RoomConnection({
            type: 'bot',
            userId,
            socketId,
            room
        });

        newRoomConnection.bindEventListeners();

        connections.push(newRoomConnection);

        room.pushStateForce({
            type: messageConst.type.joinIntoRoom,
            roomId: room.getId(),
            userId,
            socketId
        });

        return {userId, socketId};
    }

    leave(userId: string) {
        const room = this;
        const connections = room.getConnections();

        const existRoomConnection = find(connections,
            (connection: RoomConnection): boolean => connection.getUserId() === userId);

        if (!existRoomConnection) {
            console.log('user with id', userId, 'is not exists in room');
            return;
        }

        room.dropTurn(userId);

        connections.splice(connections.indexOf(existRoomConnection), 1);

        room.pushStateForce({
            type: messageConst.type.leaveFromRoom,
            roomId: room.getId(),
            userId
        });

        existRoomConnection.destroy();

        const humanConnectionList = connections
            .filter((connection: RoomConnection): boolean => connection.getType() !== 'bot');

        if (humanConnectionList.length === 0) {
            room.destroy();
        }
    }

    pushState(userId: string, state: PushedStateType): PushedStateType | null {
        const room = this;
        const activeUserId = room.getActiveUserId();

        if (activeUserId !== userId) {
            return null;
        }

        return this.pushStateForce(state);
    }

    pushStateForce(state: PushedStateType): PushedStateType {
        const room = this;
        const states = room.getStates();

        // check room is destroyed
        if (states === null || state === null) {
            return state;
        }

        const order = states.length;
        const timestamp = Date.now();

        Object.assign(state, {
            type: state.type || messageConst.type.pushState,
            meta: {
                order,
                timestamp,
                hash: sha1(order + '/' + timestamp)
            }
        });

        states.push(state);

        room.emit({
            type: state.type,
            roomId: room.getId(),
            states: {
                last: state,
                length: room.getStates().length
            }
        });

        return state;
    }

    emit(data: mixed) {
        const room = this;
        const connections = room.getConnections();
        const server = room.getServer();
        const socketIoServer = server.getSocketIoServer();

        connections.forEach((connection: RoomConnection) => {
            const connectionAttr = connection.getAttr();
            const socketClient = socketIoServer.to(connectionAttr.socketId);

            if (socketClient === null) {
                return;
            }

            if (connectionAttr.type === 'bot') {
                return;
            }

            socketClient.emit('message', data);
        });
    }

    getRoomConnectionByUserId(userId: string): RoomConnection | null {
        const room = this;
        const connections = room.getConnections();

        return find(connections, (connection: RoomConnection): boolean => connection.getUserId() === userId) || null;
    }

    getNextRoomConnectionByUserId(userId: string): RoomConnection | null {
        const room = this;
        const roomConnection = room.getRoomConnectionByUserId(userId);

        if (roomConnection === null) {
            return null;
        }

        const connections = room.getConnections();
        const nextRoomConnectionOrder = connections.indexOf(roomConnection) + 1;

        if (nextRoomConnectionOrder === connections.length) {
            return connections[0];
        }

        return connections[nextRoomConnectionOrder];
    }

    getStateByHash(hash: string): PushedStateType | null {
        const room = this;
        const states = room.getStates();

        return find(states, (state: PushedStateType): boolean => {
            if (state === null || !state.meta) {
                return false;
            }

            return typeof state.meta.hash === 'string' && state.meta.hash === hash;
        }) ||
            null;
    }

    getStatesFromHash(hash: string): Array<PushedStateType> | null {
        const room = this;

        const startState = room.getStateByHash(hash);

        if (startState === null) {
            return null;
        }

        const states = room.getStates();

        const startIndex = states.indexOf(startState);

        return states.slice(startIndex + 1);
    }

    getConnections(): Array<RoomConnection> {
        return this.getAttr().connections;
    }

    getStates(): Array<PushedStateType> {
        return this.getAttr().states;
    }

    getLastStates(count: number): Array<PushedStateType> {
        const room = this;
        const states = room.getStates();
        const statesLength = states.length;

        return states.slice(statesLength - count, statesLength);
    }

    getId(): string {
        return this.getAttr().id;
    }

    getSettings(): SettingsType {
        return this.getAttr().settings;
    }

    getSetting(key: string): mixed {
        const {settings} = this.getAttr();

        if (settings === null) {
            return null;
        }

        return settings[key];
    }

    setSettings(settings: SettingsType): Room {
        const room = this;

        room.getAttr().settings = settings;

        return room;
    }

    setSetting(addedSettings: mixed): Room {
        const room = this;

        const settings = room.getSettings();

        Object.assign(settings, addedSettings);

        return room;
    }

    getServer(): Server {
        return this.getAttr().server;
    }

    getAttr(): AttrType {
        return this._attr; // eslint-disable-line no-underscore-dangle
    }

    getDefaultActiveUserId(): string {
        return this.getAttr().defaultActiveUserId;
    }

    getActiveUserId(): string {
        return this.getAttr().activeUserId;
    }

    destroy() {
        const room = this;

        const attr = room.getAttr();
        const {timers} = attr;

        // remove from roomMaster
        roomMaster.removeRoomById(room.getId());

        room.getConnections().forEach((connection: RoomConnection) => {
            connection.destroy();
        });

        // stop all timers
        Object.keys(timers).forEach((timerKey: string) => {
            const timer = timers[timerKey];

            if (timer && typeof timer.stop === 'function') {
                timer.stop();
            }
            timers[timerKey] = null;
        });

        // remove all keys
        Object.keys(attr).forEach((key: string) => {
            attr[key] = null;
        });
    }
}

module.exports.Room = Room;
