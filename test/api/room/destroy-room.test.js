/* global describe, it, before, after, beforeEach, afterEach */
const chai = require('chai');
const assert = chai.assert;
const Server = require('./../../../module/server').Server;
const util = require('./../../util');
const serverOptions = util.getServerOptions();
const url = 'http://localhost:' + serverOptions.port;
const sinon = require('sinon');

chai.use(require('chai-json-schema'));

// self variables
const path = require('path');
const roomConfig = require('./../../../module/room/config-data');

describe('destroy room', () => {
    let server = null;
    let clock = null;

    beforeEach(() => {
        clock = sinon.useFakeTimers();
        server = new Server(serverOptions);
        return server.run();
    });

    afterEach(() => {
        return server.destroy()
            .then(() => clock.restore());
    });

    it('destroy room by timer if just created room has no players', async () => {
        const user = await util.createUser();

        await util.getAsJson(url + '/api/room/create');
        await util.getAsJson(url + '/api/room/create');
        await util.getAsJson(url + '/api/room/create');

        let roomsIdsData = await util.getAsJson(url + '/api/room/get-ids');

        assert(roomsIdsData.roomIds.length === 3);

        const roomId = roomsIdsData.roomIds[1];

        await util
            .getAsJson(url + path.join('/api/room/join/', roomId, user.userId, user.socket.id));

        clock.tick(roomConfig.timers.onCreateRoom.time + 1e3);

        roomsIdsData = await util.getAsJson(url + '/api/room/get-ids');

        assert.deepEqual(roomsIdsData.roomIds, [roomId]);

        user.socket.disconnect();
    });

    it('destroy room on LEAVE all players (imminently)', async () => {
        const user = await util.createUser();
        const createRoomResult = await util.getAsJson(url + '/api/room/create'); // room 1
        const {roomId} = createRoomResult;

        await util.getAsJson(url + '/api/room/create'); // room 2
        await util.getAsJson(url + '/api/room/create'); // room 3

        await util
            .getAsJson(url + path.join('/api/room/join/', roomId, user.userId, user.socket.id));

        await util
            .getAsJson(url + path.join('/api/room/leave/', roomId, user.userId)); // destroy 1st room

        const roomsIdsData = await util.getAsJson(url + '/api/room/get-ids');

        assert(roomsIdsData.roomIds.length === 2);
        assert(roomsIdsData.roomIds.every(existsRoomId => existsRoomId !== roomId));
        user.socket.disconnect();
    });

    // f****ck, I did NOT done it without util.sleep()
    it('destroy room on DISCONNECT all players (by timing)', async () => {
        clock.restore();

        const user = await util.createUser();
        const createRoomResult = await util.getAsJson(url + '/api/room/create');
        const {roomId} = createRoomResult;

        // join to room
        await util.getAsJson(url + path.join('/api/room/join/', roomId, user.userId, user.socket.id));

        await util.sleep(1e3);

        user.socket.disconnect();

        await util.sleep(roomConfig.timers.onUserDisconnect.time + 1e3);

        const roomsIdsData = await util.getAsJson(url + '/api/room/get-ids');

        assert(roomsIdsData.roomIds.length === 0);
    }).timeout(roomConfig.timers.onUserDisconnect.time * 2);
});
