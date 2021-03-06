// @flow

const roomMaster = require('./../../../room/master').roomMaster;
const {LocalExpressRequest} = require('./../../../local-express/request');
const {LocalExpressResponse} = require('./../../../local-express/response');
const error = require('./../error-data.js');
const messageConst = require('./../../../room/message-data.js');

module.exports = (req: LocalExpressRequest, res: LocalExpressResponse) => {
    const {params} = req;
    const {roomId, userId} = params;

    const room = roomMaster.getRoomById(roomId);

    if (!room) {
        res.json({
            error: {
                id: error.ROOM_NOT_FOUND.id,
                message: error.ROOM_NOT_FOUND.message.replace('{{roomId}}', roomId)
            }
        });
        return;
    }

    const activeUserId = room.giveTurn(userId);

    res.json({
        type: messageConst.type.takeTurn,
        roomId,
        activeUserId
    });
};
