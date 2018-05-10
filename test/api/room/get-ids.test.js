/* global describe, it, before, after, beforeEach, afterEach */
const chai = require('chai');
const assert = chai.assert;
const Server = require('./../../../module/server').Server;
const util = require('./../../util');
const serverOptions = util.getServerOptions();
const url = 'http://localhost:' + serverOptions.port;

chai.use(require('chai-json-schema'));

// self variables
const getRoomIdsSchema = require('./../../schema').getRoomIds;

describe('GET /api/room/get-ids', () => {
    let server = null;

    beforeEach(() => {
        server = new Server(serverOptions);
        return server.run();
    });

    afterEach(() => server.destroy());

    it('get room ids', async () => {
        await util.getAsJson(url + '/api/room/create');
        await util.getAsJson(url + '/api/room/create');
        await util.getAsJson(url + '/api/room/create');
        await util.getAsJson(url + '/api/room/create');
        await util.getAsJson(url + '/api/room/create');

        const roomsIdsData = await util.getAsJson(url + '/api/room/get-ids');

        const roomIds = roomsIdsData.roomIds;

        assert(roomIds.length === 5); // see above - exact 5 rooms
        assert.jsonSchema(roomsIdsData, getRoomIdsSchema);
    });
});
