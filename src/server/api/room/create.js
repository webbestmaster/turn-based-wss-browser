// @flow

const {Server} = require('./../../index');
const {LocalExpressRequest} = require('./../../../local-express/request');
const {LocalExpressResponse} = require('./../../../local-express/response');
const Room = require('./../../../room').Room;

module.exports = (req: LocalExpressRequest, res: LocalExpressResponse, server: Server) => {
    const room = new Room({server});

    res.json({roomId: room.getId()});
};
