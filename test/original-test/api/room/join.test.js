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
const messageConst = require('./../../../module/room/message.json');
const error = require('./../../../module/server/api/error.json');

describe('GET /api/room/join/:roomId/:userId/:socketId', () => {
    let server = null;

    beforeEach(() => {
        server = new Server(serverOptions);
        return server.run();
    });

    afterEach(() => server.destroy());

    it('join', async () => { // eslint-disable-line max-statements
        const userA = await util.createUser();
        const userB = await util.createUser();

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

        // join to room as userB
        let joinUserBResult = await util
            .getAsJson(url + path.join('/api/room/join/', roomId, userB.userId, userB.socket.id));

        assert(joinUserBResult.type === messageConst.type.joinIntoRoom);
        assert(joinUserBResult.roomId === roomId);
        assert(joinUserBResult.userId === userB.userId);
        assert(joinUserBResult.socketId === userB.socket.id);
        assert.jsonSchema(joinUserBResult, joinIntoRoomSchema);
        assert.jsonSchema(userB.messages[0], joinIntoRoomMessageSchema);

        assert(userB.messages[0].states.last.type === messageConst.type.joinIntoRoom);
        assert(userB.messages[0].states.last.roomId === roomId);
        assert(userB.messages[0].states.last.userId === userB.userId);
        assert(userB.messages[0].states.last.socketId === userB.socket.id);
        assert(userB.messages[0].states.length === 2);

        // user a should be got second message
        assert(userA.messages[1].states.last.type === messageConst.type.joinIntoRoom);
        assert(userA.messages[1].states.last.roomId === roomId);
        assert(userA.messages[1].states.last.userId === userB.userId);
        assert(userA.messages[1].states.last.socketId === userB.socket.id);
        assert(userA.messages[1].states.length === 2);

        // check users exists - should be 2 users
        let getUsersResult = await util
            .getAsJson(url + path.join('/api/room/get-users/', roomId));

        assert.deepEqual(getUsersResult.users, [
            {userId: userA.userId, socketId: userA.socket.id},
            {userId: userB.userId, socketId: userB.socket.id}
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
        assert(userB.messages.length === 1);

        // join to room as userB
        joinUserBResult = await util
            .getAsJson(url + path.join('/api/room/join/', roomId, userB.userId, userB.socket.id));

        assert(joinUserBResult.type === messageConst.type.joinIntoRoom);
        assert(joinUserBResult.roomId === roomId);
        assert(joinUserBResult.userId === userB.userId);
        assert(joinUserBResult.socketId === userB.socket.id);

        // no new socket messages
        assert(userA.messages.length === 2);
        assert(userB.messages.length === 1);

        // check users exists - should be 2 users
        getUsersResult = await util
            .getAsJson(url + path.join('/api/room/get-users/', roomId));

        assert.deepEqual(getUsersResult.users, [
            {userId: userA.userId, socketId: userA.socket.id},
            {userId: userB.userId, socketId: userB.socket.id}
        ]);

        userA.socket.disconnect();
        userB.socket.disconnect();
    });

    it('join to not exists room', async () => {
        const user = await util.createUser();
        const notExistsRoomId = String(Math.random());

        await util.getAsJson(url + '/api/room/create');

        // join to not exists room
        const joinUserResult = await util
            .getAsJson(url + path.join('/api/room/join/', notExistsRoomId, user.userId, user.socket.id));

        assert(joinUserResult.error.id === error.ROOM_NOT_FOUND.id);
        assert(joinUserResult.error.message === error.ROOM_NOT_FOUND.message.replace('{{roomId}}', notExistsRoomId));

        user.socket.disconnect();
    });
});
