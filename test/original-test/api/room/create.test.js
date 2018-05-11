/* global describe, it, before, after, beforeEach, afterEach */
const chai = require('chai');
const assert = chai.assert;
const Server = require('./../../../module/server').Server;
const util = require('./../../util');
const serverOptions = util.getServerOptions();
const url = 'http://localhost:' + serverOptions.port;

chai.use(require('chai-json-schema'));

// self variables
const createRoomSchema = require('./../../schema').createRoom;

describe('GET /api/room/create', () => {
    let server = null;

    beforeEach(() => {
        server = new Server(serverOptions);
        return server.run();
    });

    afterEach(() => server.destroy());

    it('create a room', async () => {
        const createRoomResult = await util.getAsJson(url + '/api/room/create');

        assert(typeof createRoomResult.roomId === 'string');
        assert.jsonSchema(createRoomResult, createRoomSchema);
    });
});
