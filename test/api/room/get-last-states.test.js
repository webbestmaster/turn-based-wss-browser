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

describe('GET /api/room/get-last-states/:roomId/:count', () => {
    let server = null;

    beforeEach(() => {
        server = new Server(serverOptions);
        return server.run();
    });

    afterEach(() => server.destroy());

    it('get last states', async () => { // eslint-disable-line max-statements
        const userA = await util.createUser();

        const createRoomResult = await util.getAsJson(url + '/api/room/create');
        const {roomId} = createRoomResult;

        // join to room
        await util.getAsJson(url + path.join('/api/room/join/', roomId, userA.userId, userA.socket.id));

        // take turn
        await util.getAsJson(url + path.join('/api/room/take-turn/', roomId, userA.userId));

        // push state by userA
        let pushStateResult = await util
            .postAsJson(url + path.join('/api/room/push-state/', roomId, userA.userId), {state: 'state-1'});

        assert(pushStateResult.roomId === roomId);
        assert(pushStateResult.states.length === 3); // join, take, push

        let getStatesResult = await util
            .getAsJson(url + path.join('/api/room/get-last-states/', roomId, '/' + 1));

        assert(getStatesResult.states[0].state === 'state-1');
        assert.jsonSchema(getStatesResult, getStatesSchema);

        // push state by userA again
        pushStateResult = await util
            .postAsJson(url + path.join('/api/room/push-state/', roomId, userA.userId), {state: 'state-2'});
        assert(pushStateResult.states.length === 4); // join, take, push, push

        getStatesResult = await util
            .getAsJson(url + path.join('/api/room/get-last-states/', roomId, '/' + 2));

        assert(getStatesResult.states[0].state, 'state-1');
        assert(getStatesResult.states[1].state, 'state-2');
        assert.jsonSchema(getStatesResult, getStatesSchema);

        getStatesResult = await util
            .getAsJson(url + path.join('/api/room/get-last-states/', roomId, '/' + 1000));

        assert(pushStateResult.states.length === 4); // join, take, push, push
        assert(getStatesResult.states[2].state, 'state-1');
        assert(getStatesResult.states[3].state, 'state-2');
        assert.jsonSchema({
            roomId,
            states: [
                getStatesResult.states[2],
                getStatesResult.states[3]
            ]
        }, getStatesSchema);

        userA.socket.disconnect();
    });
});
