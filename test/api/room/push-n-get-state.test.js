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
const pushStateSchema = require('./../../schema').pushState;
const pushStateFailSchema = require('./../../schema').pushStateFail;
const stateSchema = require('./../../schema').state;
const stateArraySchema = require('./../../schema').stateArraySchema;
const pushStateMessageSchema = require('./../../schema').pushStateMessage;
const messageConst = require('./../../../module/room/message-data');

describe('POST /api/room/push-state/:roomId/:userId', () => {
    let server = null;

    beforeEach(() => {
        server = new Server(serverOptions);
        return server.run();
    });

    afterEach(() => server.destroy());

    it('push state', async () => { // eslint-disable-line max-statements
        const userA = await util.createUser();
        const userB = await util.createUser();

        const createRoomResult = await util.getAsJson(url + '/api/room/create');
        const {roomId} = createRoomResult;

        // join to room
        await util.getAsJson(url + path.join('/api/room/join/', roomId, userA.userId, userA.socket.id));
        await util.getAsJson(url + path.join('/api/room/join/', roomId, userB.userId, userB.socket.id));

        // push state by userA before take turn
        let pushStateResult = await util
            .postAsJson(url + path.join('/api/room/push-state/', roomId, userA.userId), {state: 'state-1'});

        assert(pushStateResult.type === messageConst.type.pushState);
        assert(pushStateResult.roomId === roomId);
        assert(pushStateResult.states === null);
        assert.jsonSchema(pushStateResult, pushStateFailSchema);
        assert(userA.messages.length === 2); // join userA, join userB
        assert(userB.messages.length === 1); // join userA

        // take turn
        await util.getAsJson(url + path.join('/api/room/take-turn/', roomId, userA.userId));

        // push state by userA
        pushStateResult = await util
            .postAsJson(url + path.join('/api/room/push-state/', roomId, userA.userId), {state: 'state-1'});

        assert(pushStateResult.type === messageConst.type.pushState);
        assert(pushStateResult.roomId === roomId);
        assert.jsonSchema(pushStateResult, pushStateSchema);
        assert(pushStateResult.states.length === 4); // join userA, join userB, take A, push A
        assert.jsonSchema(pushStateResult.states.last, stateSchema);

        assert(userA.messages.length === 4); // join userA, join userB, take A, push A
        assert(userB.messages.length === 3); // join userB, take A, push A

        assert.jsonSchema(userA.messages[3], pushStateMessageSchema);
        assert.jsonSchema(userB.messages[2], pushStateMessageSchema);

        let getStatesResult = await util
            .getAsJson(url + path.join('/api/room/get-last-states/', roomId, '/' + 1));

        assert(getStatesResult.states[0].state === 'state-1');
        assert(pushStateResult.roomId === roomId);
        assert(getStatesResult.states.length === 1); // see path.join('/api/room/get-last-states/', roomId, '/' + 1)
        assert.jsonSchema(getStatesResult.states, stateArraySchema);

        // push state by userB without turn
        pushStateResult = await util
            .postAsJson(url + path.join('/api/room/push-state/', roomId, userB.userId), {state: 'state-2'});
        assert(pushStateResult.roomId === roomId);
        assert(pushStateResult.states === null);
        assert.jsonSchema(pushStateResult, pushStateFailSchema);

        // no new states
        assert(userA.messages.length === 4); // join userA, join userB, take A, push A
        assert(userB.messages.length === 3); // join userB, take A, push A

        // check state did not push
        getStatesResult = await util
            .getAsJson(url + path.join('/api/room/get-last-states/', roomId, '/' + 1));

        assert(getStatesResult.states[0].state === 'state-1');
        assert.jsonSchema(getStatesResult.states, stateArraySchema);

        // leave turn by userA
        await util.getAsJson(url + path.join('/api/room/drop-turn/', roomId, userA.userId));

        // push state by userB with turn
        pushStateResult = await util
            .postAsJson(url + path.join('/api/room/push-state/', roomId, userB.userId), {state: 'state-2'});

        assert(pushStateResult.states.length === 7); // join userA, join userB, take A, push A, drop A, take B, push B
        assert(userA.messages.length === 7); // join userA, join userB, take A, push A, drop A, take B, push B
        assert(userB.messages.length === 6); // join userB, take A, push A, drop A, take B, push B

        getStatesResult = await util
            .getAsJson(url + path.join('/api/room/get-last-states/', roomId, '/' + 4)); // reverse - push A, drop A, take B, push B

        assert(getStatesResult.states[0].state, 'state-1');
        assert(getStatesResult.states[3].state, 'state-2');
        assert.jsonSchema([getStatesResult.states[0], getStatesResult.states[3]], stateArraySchema);

        getStatesResult = await util
            .getAsJson(url + path.join('/api/room/get-last-states/', roomId, '/' + 1000));

        assert(getStatesResult.states.length === 7);

        userA.socket.disconnect();
        userB.socket.disconnect();
    });
});
