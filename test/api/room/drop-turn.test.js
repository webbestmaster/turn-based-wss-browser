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
const dropTurnSchema = require('./../../schema').dropTurn;
const dropTurnMessageSchema = require('./../../schema').dropTurnMessage;
const takeTurnMessageSchema = require('./../../schema').takeTurnMessage;
const messageConst = require('./../../../module/room/message-data');
const error = require('./../../../module/server/api/error-data');

describe('GET /api/room/drop-turn/:roomId/:userId', () => {
    let server = null;

    beforeEach(() => {
        server = new Server(serverOptions);
        return server.run();
    });

    afterEach(() => server.destroy());

    it('drop turn for SINGLE player', async () => { // eslint-disable-line max-statements
        const user = await util.createUser();

        const createRoomResult = await util.getAsJson(url + '/api/room/create');
        const {roomId} = createRoomResult;

        // join to room
        await util.getAsJson(url + path.join('/api/room/join/', roomId, user.userId, user.socket.id));

        // drop turn
        let dropTurnResult = await util.getAsJson(url + path.join('/api/room/drop-turn/', roomId, user.userId));

        assert(dropTurnResult.type === messageConst.type.dropTurn);
        assert(dropTurnResult.roomId === roomId);
        assert(dropTurnResult.activeUserId !== user.userId); // has no active user
        assert.jsonSchema(dropTurnResult, dropTurnSchema);
        assert(user.messages.length === 1); // join into room by user

        // take turn
        const takeTurnResult = await util.getAsJson(url + path.join('/api/room/take-turn/', roomId, user.userId));

        assert(takeTurnResult.activeUserId === user.userId);

        // drop turn again
        dropTurnResult = await util.getAsJson(url + path.join('/api/room/drop-turn/', roomId, user.userId));

        assert(dropTurnResult.type === messageConst.type.dropTurn);
        assert(dropTurnResult.roomId === roomId);
        assert(dropTurnResult.activeUserId === user.userId); // for single player should be the same active user id
        assert.jsonSchema(dropTurnResult, dropTurnSchema);
        assert(user.messages.length === 4); // join and take, drop, take
        assert.jsonSchema(user.messages[2], dropTurnMessageSchema); // check drop
        assert(user.messages[2].states.last.activeUserId === user.userId);

        user.socket.disconnect();
    });

    it('drop turn for TWO players', async () => { // eslint-disable-line max-statements
        const userA = await util.createUser();
        const userB = await util.createUser();

        const createRoomResult = await util.getAsJson(url + '/api/room/create');
        const {roomId} = createRoomResult;

        // join to room
        await util.getAsJson(url + path.join('/api/room/join/', roomId, userA.userId, userA.socket.id));
        await util.getAsJson(url + path.join('/api/room/join/', roomId, userB.userId, userB.socket.id));

        // drop turn
        let dropTurnResult = await util.getAsJson(url + path.join('/api/room/drop-turn/', roomId, userA.userId));

        assert(dropTurnResult.roomId === roomId);
        assert(dropTurnResult.activeUserId !== userA.userId); // has no active user
        assert(dropTurnResult.activeUserId !== userB.userId); // has no active user
        assert.jsonSchema(dropTurnResult, dropTurnSchema);

        assert(userA.messages.length === 2); // join userA, join userB
        assert(userB.messages.length === 1); // join userA

        // take turn by userA
        const takeTurnResult = await util.getAsJson(url + path.join('/api/room/take-turn/', roomId, userA.userId));

        assert(dropTurnResult.roomId === roomId);
        assert.jsonSchema(dropTurnResult, dropTurnSchema);
        assert(takeTurnResult.activeUserId === userA.userId);

        // drop turn by userB
        dropTurnResult = await util.getAsJson(url + path.join('/api/room/drop-turn/', roomId, userB.userId));

        assert(dropTurnResult.type === messageConst.type.dropTurn);
        assert(dropTurnResult.roomId === roomId);
        assert(dropTurnResult.activeUserId === userA.userId);
        assert.jsonSchema(dropTurnResult, dropTurnSchema);
        assert(userA.messages.length === 3); // joinA, joinB, take
        assert(userB.messages.length === 2); // joinB, take

        assert(userA.messages[2].states.last.activeUserId === userA.userId);
        assert(userB.messages[1].states.last.activeUserId === userA.userId);

        assert.jsonSchema(userA.messages[2], takeTurnMessageSchema);
        assert.jsonSchema(userB.messages[1], takeTurnMessageSchema);

        // drop turn by userA
        dropTurnResult = await util.getAsJson(url + path.join('/api/room/drop-turn/', roomId, userA.userId));
        assert(dropTurnResult.activeUserId === userB.userId);

        assert(dropTurnResult.type === messageConst.type.dropTurn);
        assert(dropTurnResult.roomId === roomId);
        assert(dropTurnResult.activeUserId === userB.userId);

        assert(userA.messages.length === 5); // joinA, joinB, takeA, dropA, takeB
        assert(userB.messages.length === 4); // joinB, takeA, dropA, takeB

        assert(userA.messages[4].states.last.activeUserId === userB.userId);
        assert(userB.messages[3].states.last.activeUserId === userB.userId);

        assert.jsonSchema(userA.messages[3], dropTurnMessageSchema);
        assert.jsonSchema(userA.messages[4], takeTurnMessageSchema);

        assert(userA.messages[3].states.last.activeUserId === userA.userId); // drop user id
        assert(userA.messages[4].states.last.activeUserId === userB.userId); // auto take user id

        assert(userB.messages[2].states.last.activeUserId === userA.userId); // drop user id
        assert(userB.messages[3].states.last.activeUserId === userB.userId); // auto take user id

        assert.jsonSchema(userB.messages[2], dropTurnMessageSchema);
        assert.jsonSchema(userB.messages[3], takeTurnMessageSchema);

        // drop turn by userA again
        dropTurnResult = await util.getAsJson(url + path.join('/api/room/drop-turn/', roomId, userA.userId));

        // see above should be nothing
        assert(dropTurnResult.activeUserId === userB.userId);

        assert(dropTurnResult.type === messageConst.type.dropTurn);
        assert(dropTurnResult.roomId === roomId);
        assert(dropTurnResult.activeUserId === userB.userId);

        assert(userA.messages.length === 5); // joinA, joinB, takeA, dropA, takeB
        assert(userB.messages.length === 4); // joinB, takeA, dropA, takeB

        assert(userA.messages[4].states.last.activeUserId === userB.userId);
        assert(userB.messages[3].states.last.activeUserId === userB.userId);

        assert.jsonSchema(userA.messages[3], dropTurnMessageSchema);
        assert.jsonSchema(userA.messages[4], takeTurnMessageSchema);

        assert(userA.messages[3].states.last.activeUserId === userA.userId); // drop user id
        assert(userA.messages[4].states.last.activeUserId === userB.userId); // auto take user id

        assert(userB.messages[2].states.last.activeUserId === userA.userId); // drop user id
        assert(userB.messages[3].states.last.activeUserId === userB.userId); // auto take user id

        assert.jsonSchema(userB.messages[2], dropTurnMessageSchema);
        assert.jsonSchema(userB.messages[3], takeTurnMessageSchema);

        userA.socket.disconnect();
        userB.socket.disconnect();
    });

    it('drop turn by non exists player', async () => { // eslint-disable-line max-statements
        const userA = await util.createUser();
        const userB = await util.createUser();
        const zeroUser = await util.createUser();

        const createRoomResult = await util.getAsJson(url + '/api/room/create');
        const {roomId} = createRoomResult;

        // join to room
        await util.getAsJson(url + path.join('/api/room/join/', roomId, userA.userId, userA.socket.id));
        await util.getAsJson(url + path.join('/api/room/join/', roomId, userB.userId, userB.socket.id));

        // drop turn by zero user
        let dropTurnZeroUserResult = await util
            .getAsJson(url + path.join('/api/room/drop-turn/', roomId, zeroUser.userId));

        assert(dropTurnZeroUserResult.activeUserId !== userA.userId); // has no active user
        assert(dropTurnZeroUserResult.activeUserId !== userB.userId); // has no active user
        assert(dropTurnZeroUserResult.activeUserId !== zeroUser.userId); // has no active user
        assert.jsonSchema(dropTurnZeroUserResult, dropTurnSchema);

        // take turn by userA
        await util.getAsJson(url + path.join('/api/room/take-turn/', roomId, userA.userId));

        // drop turn by zero user again
        dropTurnZeroUserResult = await util
            .getAsJson(url + path.join('/api/room/drop-turn/', roomId, zeroUser.userId));

        assert(dropTurnZeroUserResult.activeUserId === userA.userId); // still userA is active user
        assert.jsonSchema(dropTurnZeroUserResult, dropTurnSchema);

        assert(userA.messages.length === 3); // joinA, joinB, takeA
        assert(userB.messages.length === 2); // joinB, takeA
        assert(zeroUser.messages.length === 0);

        userA.socket.disconnect();
        userB.socket.disconnect();
        zeroUser.socket.disconnect();
    });

    it('drop turn by leave room', async () => { // eslint-disable-line max-statements
        const userA = await util.createUser();
        const userB = await util.createUser();
        const zeroUser = await util.createUser();

        const createRoomResult = await util.getAsJson(url + '/api/room/create');
        const {roomId} = createRoomResult;

        // join to room
        await util.getAsJson(url + path.join('/api/room/join/', roomId, userA.userId, userA.socket.id));
        await util.getAsJson(url + path.join('/api/room/join/', roomId, userB.userId, userB.socket.id));

        // take turn by userA
        await util.getAsJson(url + path.join('/api/room/take-turn/', roomId, userA.userId));

        // leave userA
        await util.getAsJson(url + path.join('/api/room/leave/', roomId, userA.userId));

        // take turn as zero user
        let takeTurnZeroUserResult = await util
            .getAsJson(url + path.join('/api/room/take-turn/', roomId, zeroUser.userId));

        assert(takeTurnZeroUserResult.activeUserId === userB.userId);

        // leave userB
        await util.getAsJson(url + path.join('/api/room/leave/', roomId, userB.userId));

        // take turn as zero user, but room is not not exists
        takeTurnZeroUserResult = await util
            .getAsJson(url + path.join('/api/room/take-turn/', roomId, zeroUser.userId));

        assert(takeTurnZeroUserResult.error.id === error.ROOM_NOT_FOUND.id);
        assert(takeTurnZeroUserResult.error.message === error.ROOM_NOT_FOUND.message.replace('{{roomId}}', roomId));

        assert(userA.messages.length === 5); // joinA, joinB, takeA, dropA, takeB [after that - leave room A]
        assert(userB.messages.length === 7); // joinB, takeA, dropA, takeB, leaveA, dropB, takeB, [cause single user], [after that - leave room B]
        assert(zeroUser.messages.length === 0);

        userA.socket.disconnect();
        userB.socket.disconnect();
        zeroUser.socket.disconnect();
    });
});
