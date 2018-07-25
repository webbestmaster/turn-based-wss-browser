// @flow

const {roomMaster} = require('./../../../room/master');
const {LocalExpressRequest} = require('./../../../local-express/request');
const {LocalExpressResponse} = require('./../../../local-express/response');
const error = require('./../error-data.js');
const messageConst = require('./../../../room/message-data.js');

module.exports = (req: LocalExpressRequest, res: LocalExpressResponse) => {
    const {params, body} = req;
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

    const lastState = room.pushState(userId, body);

    if (lastState === null) {
        res.json({
            type: messageConst.type.pushState,
            roomId,
            states: null
        });
        return;
    }

    res.json({
        type: messageConst.type.pushState,
        roomId,
        states: {
            last: lastState,
            length: room.getStates().length
        }
    });
};
