// @flow

const roomMaster = require('./../../../room/master').roomMaster;
const {LocalExpressRequest} = require('./../../../local-express/request');
const {LocalExpressResponse} = require('./../../../local-express/response');
const error = require('./../error-data.js');
const messageConst = require('./../../../room/message-data.js');

module.exports = (req: LocalExpressRequest, res: LocalExpressResponse) => {
    const {params} = req;
    const {type, roomId} = params;

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

    if (type === 'bot' || type === 'human') {
        const user = room.makeUser(type);

        res.json({
            type: messageConst.type.joinIntoRoom,
            roomId,
            userId: user.userId,
            socketId: user.socketId
        });

        return;
    }

    res.json({
        error: {
            id: error.WRONG_PARAMETERS.id,
            message: error.WRONG_PARAMETERS.message.replace('{{params}}', JSON.stringify(params))
        }
    });
};
