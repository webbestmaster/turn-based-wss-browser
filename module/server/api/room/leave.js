const roomMaster = require('./../../../room/master').roomMaster;
const error = require('./../error.json');
const messageConst = require('./../../../room/message.json');

module.exports = (req, res) => {
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


    room.leave(userId);

    res.json({
        type: messageConst.type.leaveFromRoom,
        roomId,
        userId
    });
};
