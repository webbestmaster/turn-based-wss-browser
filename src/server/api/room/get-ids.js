// @flow

const roomMaster = require('./../../../room/master').roomMaster;
const {LocalExpressRequest} = require('./../../../local-express/request');
const {LocalExpressResponse} = require('./../../../local-express/response');

module.exports = (req: LocalExpressRequest, res: LocalExpressResponse) => {
    res.json({roomIds: roomMaster.getRoomIds()});
};
