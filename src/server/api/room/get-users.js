// @flow

const roomMaster = require('./../../../room/master').roomMaster;
const {LocalExpressRequest} = require('./../../../local-express/request');
const {LocalExpressResponse} = require('./../../../local-express/response');
const {RoomConnection} = require('./../../../room/room-connection');
const error = require('./../error-data.js');

type ServerUserType = {|
    userId: string,
    socketId: string,
    type: 'human' | 'bot'
|};

module.exports = (req: LocalExpressRequest, res: LocalExpressResponse) => {
    const {params} = req;
    const {roomId} = params;

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

    res.json({
        roomId,
        users: room.getConnections().map((connection: RoomConnection): ServerUserType => ({
            userId: connection.getUserId(),
            socketId: connection.getSocketId(),
            type: connection.getType()
        }))
    });
};
