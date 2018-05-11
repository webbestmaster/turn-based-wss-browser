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
const leaveFromRoomSchema = require('./../../schema').leaveFromRoom;
const leaveFromRoomMessageSchema = require('./../../schema').leaveFromRoomMessage;
const messageConst = require('./../../../module/room/message-data');
const error = require('./../../../module/server/api/error-data');

describe('GET /api/room/leave/:roomId/:userId', () => {
    let server = null;

    beforeEach(() => {
        server = new Server(serverOptions);
        return server.run();
    });

    afterEach(() => server.destroy());

    it('leave', async () => { // eslint-disable-line max-statements
        const userA = await util.createUser();
        const userB = await util.createUser();

        const createRoomResult = await util.getAsJson(url + '/api/room/create');
        const {roomId} = createRoomResult;

        // join to room as userA
        await util.getAsJson(url + path.join('/api/room/join/', roomId, userA.userId, userA.socket.id));

        // join to room as userB
        await util.getAsJson(url + path.join('/api/room/join/', roomId, userB.userId, userB.socket.id));

        // leave from room as userA
        const leaveUserAResult = await util.getAsJson(url + path.join('/api/room/leave/', roomId, userA.userId));

        assert(leaveUserAResult.type === messageConst.type.leaveFromRoom);
        assert(leaveUserAResult.roomId === roomId);
        assert(leaveUserAResult.userId === userA.userId);
        assert.jsonSchema(leaveUserAResult, leaveFromRoomSchema);
        assert.jsonSchema(userB.messages[1], leaveFromRoomMessageSchema);

        let getUsersResult = await util
            .getAsJson(url + path.join('/api/room/get-users/', roomId));

        assert.deepEqual(getUsersResult.users, [{userId: userB.userId, socketId: userB.socket.id}]);

        // leave from room as userB
        const leaveUserBResult = await util.getAsJson(url + path.join('/api/room/leave/', roomId, userB.userId));

        assert(leaveUserBResult.type === messageConst.type.leaveFromRoom);
        assert(leaveUserBResult.roomId === roomId);
        assert(leaveUserBResult.userId === userB.userId);
        assert.jsonSchema(leaveUserBResult, leaveFromRoomSchema);
        assert.jsonSchema(userB.messages[1], leaveFromRoomMessageSchema);
        assert(userB.messages.length === 2);

        // right now room is not exists
        getUsersResult = await util
            .getAsJson(url + path.join('/api/room/get-users/', roomId));

        assert(getUsersResult.error.id === error.ROOM_NOT_FOUND.id);
        assert(getUsersResult.error.message === error.ROOM_NOT_FOUND.message.replace('{{roomId}}', roomId));

        // leave from room as userB again
        const leaveUserBResultAgain = await util.getAsJson(url + path.join('/api/room/leave/', roomId, userB.userId));

        assert(leaveUserBResultAgain.error.id === error.ROOM_NOT_FOUND.id);
        assert(leaveUserBResultAgain.error.message === error.ROOM_NOT_FOUND.message.replace('{{roomId}}', roomId));

        assert(userA.messages.length === 2); // messages - userA join, userB join
        assert(userB.messages.length === 2); // messages - userB join, userA leave

        getUsersResult = await util
            .getAsJson(url + path.join('/api/room/get-users/', roomId));

        assert(getUsersResult.error.id === error.ROOM_NOT_FOUND.id);
        assert(getUsersResult.error.message === error.ROOM_NOT_FOUND.message.replace('{{roomId}}', roomId));

        userA.socket.disconnect();
        userB.socket.disconnect();
    });
});
