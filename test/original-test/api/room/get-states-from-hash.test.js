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
const stateSchema = require('./../../schema').state;

describe('GET /api/room/get-states-from-hash/:roomId/:hash', () => {
    let server = null;

    beforeEach(() => {
        server = new Server(serverOptions);
        return server.run();
    });

    afterEach(() => server.destroy());

    it('get states from hash', async () => { // eslint-disable-line max-statements
        const userA = await util.createUser();

        const createRoomResult = await util.getAsJson(url + '/api/room/create');
        const {roomId} = createRoomResult;

        // join to room
        await util.getAsJson(url + path.join('/api/room/join/', roomId, userA.userId, userA.socket.id));

        // take turn
        await util.getAsJson(url + path.join('/api/room/take-turn/', roomId, userA.userId));

        // get states from not-exists-hash and no states
        const notExistHash = 'not-exists-hash';
        let getStatesFromNotExistsHash = await util
            .getAsJson(url + path.join('/api/room/get-states-from-hash/', roomId, notExistHash));

        assert(getStatesFromNotExistsHash.states === null);

        // push states by userA
        const pushStateResultA = await util
            .postAsJson(url + path.join('/api/room/push-state/', roomId, userA.userId), {state: 'state-a'});

        assert.jsonSchema(pushStateResultA.states.last, stateSchema);

        const pushStateResultB = await util
            .postAsJson(url + path.join('/api/room/push-state/', roomId, userA.userId), {state: 'state-b'});

        assert.jsonSchema(pushStateResultB.states.last, stateSchema);

        const pushStateResultC = await util
            .postAsJson(url + path.join('/api/room/push-state/', roomId, userA.userId), {state: 'state-c'});

        assert.jsonSchema(pushStateResultC.states.last, stateSchema);

        const pushStateResultD = await util
            .postAsJson(url + path.join('/api/room/push-state/', roomId, userA.userId), {state: 'state-d'});

        assert.jsonSchema(pushStateResultD.states.last, stateSchema);

        // get states from not-exists-hash again
        getStatesFromNotExistsHash = await util
            .getAsJson(url + path.join('/api/room/get-states-from-hash/', roomId, notExistHash));

        assert(getStatesFromNotExistsHash.states === null);

        // get states from last push state
        const getStatesFromHashD = await util
            .getAsJson(url + path.join('/api/room/get-states-from-hash/',
                roomId,
                pushStateResultD.states.last.meta.hash));

        assert.deepEqual(getStatesFromHashD.states, []);

        // get states from second push state
        const getStatesFromHashB = await util
            .getAsJson(url + path.join('/api/room/get-states-from-hash/',
                roomId,
                pushStateResultB.states.last.meta.hash));

        assert(getStatesFromHashB.states.length === 2);
        assert.deepEqual(getStatesFromHashB.states[0].state, 'state-c');
        assert.deepEqual(getStatesFromHashB.states[1].state, 'state-d');
        assert.jsonSchema(getStatesFromHashB, getStatesSchema);

        // get all states again
        const getAllStatesResult = await util.getAsJson(url + path.join('/api/room/get-all-states/', roomId));

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
