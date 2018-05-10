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
const userDisconnectedFromRoomMessage = require('./../../schema').userDisconnectedFromRoomMessage;

describe('onDisconnect', () => {
    let server = null;

    beforeEach(() => {
        server = new Server(serverOptions);
        return server.run();
    });

    afterEach(() => server.destroy());

    it('on user disconnect', async () => { // eslint-disable-line max-statements
        const userA = await util.createUser();
        const userB = await util.createUser();

        const createRoomResult = await util.getAsJson(url + '/api/room/create');
        const {roomId} = createRoomResult;

        // join to room
        await util.getAsJson(url + path.join('/api/room/join/', roomId, userA.userId, userA.socket.id));
        await util.getAsJson(url + path.join('/api/room/join/', roomId, userB.userId, userB.socket.id));

        userA.socket.disconnect();

        await util.sleep(1e3); // wait for socket disconnect

        assert(userB.messages.length === 2); // join B, disconnect A
        assert.jsonSchema(userB.messages[1], userDisconnectedFromRoomMessage);

        await util.getAsJson(url + path.join('/api/room/leave/', roomId, userA.userId));
        await util.getAsJson(url + path.join('/api/room/leave/', roomId, userB.userId));

        userB.socket.disconnect();
    });
});
