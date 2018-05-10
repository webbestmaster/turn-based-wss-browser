/* global chai, describe, it, before, after, beforeEach, afterEach */
import {Server} from './../../../module/server/index.js';
import util from './../../util.js';

const {assert} = chai;
const serverOptions = util.getServerOptions();
const url = 'http://localhost:' + serverOptions.port;

// self variables
import roomSchema from './../../schema.js';

const createRoomSchema = roomSchema.createRoom;

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
