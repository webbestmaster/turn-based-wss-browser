const roomMaster = require('./../../../room/master').roomMaster;
const error = require('./../error.json');

module.exports = (req, res) => {
    const {params} = req;
    const {roomId, hash} = params;

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


    const states = room.getStatesFromHash(hash);

    res.json({
        roomId,
        states
    });
};
