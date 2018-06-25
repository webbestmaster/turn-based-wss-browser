/* global describe, it, before, after, beforeEach, afterEach */
const chai = require('chai');
const assert = chai.assert;
const Server = require('./../../../module/server').Server;
const util = require('./../../util');
const serverOptions = util.getServerOptions();
const url = 'http://localhost:' + serverOptions.port;

chai.use(require('chai-json-schema'));

// self variables
const path = require('path');
const joinIntoRoomSchema = require('./../../schema').joinIntoRoom;
const joinIntoRoomMessageSchema = require('./../../schema').joinIntoRoomMessage;
const messageConst = require('./../../../module/room/message-data');
const error = require('./../../../module/server/api/error-data');

describe('GET /api/room/join/:roomId/:userId/:socketId', () => {
    let server = null;

    beforeEach(() => {
        server = new Server(serverOptions);
        return server.run();
    });

    afterEach(() => server.destroy());

    it('bot join', async () => { // eslint-disable-line max-statements
        const userA = await util.createUser();

        const createRoomResult = await util.getAsJson(url + '/api/room/create');
        const {roomId} = createRoomResult;

        // join to room as userA
        let joinUserAResult = await util
            .getAsJson(url + path.join('/api/room/join/', roomId, userA.userId, userA.socket.id));

        assert(joinUserAResult.type === messageConst.type.joinIntoRoom);
        assert(joinUserAResult.roomId === roomId);
        assert(joinUserAResult.userId === userA.userId);
        assert(joinUserAResult.socketId === userA.socket.id);
        assert.jsonSchema(joinUserAResult, joinIntoRoomSchema);
        assert.jsonSchema(userA.messages[0], joinIntoRoomMessageSchema);

        assert(userA.messages[0].states.last.type === messageConst.type.joinIntoRoom);
        assert(userA.messages[0].states.last.roomId === roomId);
        assert(userA.messages[0].states.last.userId === userA.userId);
        assert(userA.messages[0].states.last.socketId === userA.socket.id);
        assert(userA.messages[0].states.length === 1);

        const bot = await util.getAsJson(url + '/api/room/make/bot/' + roomId);

        // user a should be got second message
        assert(userA.messages[1].states.last.type === messageConst.type.joinIntoRoom);
        assert(userA.messages[1].states.last.roomId === roomId);
        assert(userA.messages[1].states.last.userId === bot.userId);
        assert(userA.messages[1].states.last.socketId === bot.socketId);
        assert(userA.messages[1].states.length === 2);

        // check users exists - should be 2 users
        let getUsersResult = await util
            .getAsJson(url + path.join('/api/room/get-users/', roomId));

        assert.deepEqual(getUsersResult.users, [
            {userId: userA.userId, socketId: userA.socket.id, type: 'human'},
            {userId: bot.userId, socketId: bot.socketId, type: 'bot'}
        ]);

        // try to rejoin
        // join to room as userA
        joinUserAResult = await util
            .getAsJson(url + path.join('/api/room/join/', roomId, userA.userId, userA.socket.id));

        assert(joinUserAResult.type === messageConst.type.joinIntoRoom);
        assert(joinUserAResult.roomId === roomId);
        assert(joinUserAResult.userId === userA.userId);
        assert(joinUserAResult.socketId === userA.socket.id);

        // no new socket messages
        assert(userA.messages.length === 2);

        // no new socket messages
        assert(userA.messages.length === 2);

        // check users exists - should be 2 users
        getUsersResult = await util
            .getAsJson(url + path.join('/api/room/get-users/', roomId));

        assert.deepEqual(getUsersResult.users, [
            {userId: userA.userId, socketId: userA.socket.id, type: 'human'},
            {userId: bot.userId, socketId: bot.socketId, type: 'bot'}
        ]);

        userA.socket.disconnect();
    });
});
