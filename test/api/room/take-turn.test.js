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
const takeTurnSchema = require('./../../schema').takeTurn;
const takeTurnMessageSchema = require('./../../schema').takeTurnMessage;
const messageConst = require('./../../../module/room/message-data');

describe('GET /api/room/take-turn/:roomId/:userId', () => {
    let server = null;

    beforeEach(() => {
        server = new Server(serverOptions);
        return server.run();
    });

    afterEach(() => server.destroy());

    it('take turn by non exists player', async () => { // eslint-disable-line max-statements
        const user = await util.createUser();
        const userNotExists = await util.createUser();

        const createRoomResult = await util.getAsJson(url + '/api/room/create');
        const {roomId} = createRoomResult;

        // join to room
        await util.getAsJson(url + path.join('/api/room/join/', roomId, user.userId, user.socket.id));

        // take turn by userNotExists
        let takeTurnResult = await util
            .getAsJson(url + path.join('/api/room/take-turn/', roomId, userNotExists.userId));

        assert(takeTurnResult.type === messageConst.type.takeTurn);
        assert(takeTurnResult.roomId === roomId);
        assert(takeTurnResult.activeUserId !== userNotExists.userId);
        assert(takeTurnResult.activeUserId !== user.userId);
        assert.jsonSchema(takeTurnResult, takeTurnSchema);
        assert(user.messages.length === 1); // join into room by user
        assert(userNotExists.messages.length === 0); // no room, no messages

        // take turn by userNotExists again
        takeTurnResult = await util
            .getAsJson(url + path.join('/api/room/take-turn/', roomId, userNotExists.userId));

        assert(takeTurnResult.type === messageConst.type.takeTurn);
        assert(takeTurnResult.roomId === roomId);
        assert(takeTurnResult.activeUserId !== userNotExists.userId);
        assert(takeTurnResult.activeUserId !== user.userId);
        assert.jsonSchema(takeTurnResult, takeTurnSchema);
        assert(user.messages.length === 1); // join into room by user
        assert(userNotExists.messages.length === 0); // no room, no messages

        user.socket.disconnect();
        userNotExists.socket.disconnect();
    });

    it('take turn SINGLE player', async () => { // eslint-disable-line max-statements
        const user = await util.createUser();

        const createRoomResult = await util.getAsJson(url + '/api/room/create');
        const {roomId} = createRoomResult;

        // join to room
        await util.getAsJson(url + path.join('/api/room/join/', roomId, user.userId, user.socket.id));

        // take turn
        let takeTurnResult = await util
            .getAsJson(url + path.join('/api/room/take-turn/', roomId, user.userId));

        assert(takeTurnResult.type === messageConst.type.takeTurn);
        assert(takeTurnResult.roomId === roomId);
        assert(takeTurnResult.activeUserId === user.userId);
        assert.jsonSchema(takeTurnResult, takeTurnSchema);
        assert(user.messages.length === 2); // join and take turn
        assert(user.messages[1].states.length === 2); // join and take turn
        assert.jsonSchema(user.messages[1], takeTurnMessageSchema);
        assert(user.messages[1].states.last.activeUserId === user.userId);

        // take turn again
        takeTurnResult = await util
            .getAsJson(url + path.join('/api/room/take-turn/', roomId, user.userId));

        assert(takeTurnResult.type === messageConst.type.takeTurn);
        assert(takeTurnResult.roomId === roomId);
        assert(takeTurnResult.activeUserId === user.userId);
        assert.jsonSchema(takeTurnResult, takeTurnSchema);
        assert(user.messages.length === 2); // join and take turn
        assert(user.messages[1].states.length === 2); // join and take turn
        assert.jsonSchema(user.messages[1], takeTurnMessageSchema);

        user.socket.disconnect();
    });

    it('take turn TWO players', async () => { // eslint-disable-line max-statements
        const userA = await util.createUser();
        const userB = await util.createUser();

        const createRoomResult = await util.getAsJson(url + '/api/room/create');
        const {roomId} = createRoomResult;

        // join to room as userA
        await util.getAsJson(url + path.join('/api/room/join/', roomId, userA.userId, userA.socket.id));
        await util.getAsJson(url + path.join('/api/room/join/', roomId, userB.userId, userB.socket.id));

        // take turn as userA
        const takeTurnUserAResult = await util
            .getAsJson(url + path.join('/api/room/take-turn/', roomId, userA.userId));

        assert(takeTurnUserAResult.type === messageConst.type.takeTurn);
        assert(takeTurnUserAResult.roomId === roomId);
        assert(takeTurnUserAResult.activeUserId === userA.userId);
        assert.jsonSchema(takeTurnUserAResult, takeTurnSchema);
        assert(userA.messages.length === 3); // join, join and take turn
        assert(userA.messages[2].states.length === 3); // join, join and take turn
        assert.jsonSchema(userA.messages[2], takeTurnMessageSchema);
        assert(userA.messages[2].states.last.activeUserId === userA.userId);

        // take as userA again
        const takeTurnUserAResultAgain = await util
            .getAsJson(url + path.join('/api/room/take-turn/', roomId, userA.userId));

        assert(takeTurnUserAResultAgain.type === messageConst.type.takeTurn);
        assert(takeTurnUserAResultAgain.roomId === roomId);
        assert(takeTurnUserAResultAgain.activeUserId === userA.userId);
        assert.jsonSchema(takeTurnUserAResultAgain, takeTurnSchema);
        assert(userA.messages.length === 3); // join, join and take turn
        assert(userA.messages[2].states.length === 3); // join, join and take turn
        assert.jsonSchema(userA.messages[2], takeTurnMessageSchema);

        // take as userB
        const takeTurnUserBResult = await util
            .getAsJson(url + path.join('/api/room/take-turn/', roomId, userB.userId));

        assert(takeTurnUserBResult.type === messageConst.type.takeTurn);
        assert(takeTurnUserBResult.roomId === roomId);
        assert(takeTurnUserBResult.activeUserId === userA.userId); // turn should be belongs to userA
        assert.jsonSchema(takeTurnUserAResultAgain, takeTurnSchema);
        assert(userA.messages.length === 3); // join, join and take turn
        assert(userA.messages[2].states.length === 3); // join, join and take turn
        assert.jsonSchema(userA.messages[2], takeTurnMessageSchema);

        userA.socket.disconnect();
        userB.socket.disconnect();
    });
});
