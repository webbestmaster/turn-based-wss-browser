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
const getStatesSchema = require('./../../schema').getStates;

describe('GET /api/room/get-all-states/:roomId', () => {
    let server = null;

    beforeEach(() => {
        server = new Server(serverOptions);
        return server.run();
    });

    afterEach(() => server.destroy());

    it('get all states', async () => {
        const userA = await util.createUser();

        const createRoomResult = await util.getAsJson(url + '/api/room/create');
        const {roomId} = createRoomResult;

        // join to room
        await util.getAsJson(url + path.join('/api/room/join/', roomId, userA.userId, userA.socket.id));

        // take turn
        await util.getAsJson(url + path.join('/api/room/take-turn/', roomId, userA.userId));

        // get all states
        let getAllStatesResult = await util.getAsJson(url + path.join('/api/room/get-all-states/', roomId));

        assert(getAllStatesResult.states.length === 2);
        assert(getAllStatesResult.roomId === roomId);

        // push states by userA
        await util.postAsJson(url + path.join('/api/room/push-state/', roomId, userA.userId), {state: 'state-1'});
        await util.postAsJson(url + path.join('/api/room/push-state/', roomId, userA.userId), {state: 'state-2'});
        await util.postAsJson(url + path.join('/api/room/push-state/', roomId, userA.userId), {state: 'state-3'});
        await util.postAsJson(url + path.join('/api/room/push-state/', roomId, userA.userId), {state: 'state-4'});

        // get all states again
        getAllStatesResult = await util.getAsJson(url + path.join('/api/room/get-all-states/', roomId));
        assert(getAllStatesResult.roomId, roomId);
        assert(getAllStatesResult.states.length === 6); // join, take, push x 4
        assert.jsonSchema({
            roomId,
            states: [
                getAllStatesResult.states[2],
                getAllStatesResult.states[3],
                getAllStatesResult.states[4],
                getAllStatesResult.states[5]
            ]
        }, getStatesSchema);

        userA.socket.disconnect();
    });
});
