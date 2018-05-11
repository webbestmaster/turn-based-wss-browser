const roomMaster = require('./../../../room/master').roomMaster;
const error = require('../error-data.js');

module.exports = (req, res) => {
    const {params} = req;
    const {roomId, count} = params;

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


    const lastStates = room.getLastStates(count);

    res.json({
        roomId,
        states: lastStates
    });
};
