// @flow

/* eslint consistent-this: ["error", "roomMaster"] */

const find = require('lodash/find');

class RoomMaster {
    constructor() {
        const roomMaster = this;

        roomMaster._attr = { // eslint-disable-line no-underscore-dangle, id-match
            rooms: []
        };
    }

    push(room) {
        const roomMaster = this;
        const rooms = roomMaster.getRooms();

        rooms.push(room);
    }

    removeRoomById(roomId) {
        const roomMaster = this;
        const rooms = roomMaster.getRooms();

        const roomToRemove = find(rooms, room => room.getId() === roomId);

        if (!roomToRemove) {
            console.log('WARNING ---> room is not exists, room id is: ' + roomId);
            return;
        }

        const roomToRemoveIndex = rooms.indexOf(roomToRemove);

        rooms.splice(roomToRemoveIndex, 1);
    }

    getRoomById(roomId) {
        const roomMaster = this;
        const rooms = roomMaster.getRooms();

        return find(rooms, room => room.getId() === roomId);
    }

    getRoomIds() {
        const roomMaster = this;
        const rooms = roomMaster.getRooms();

        return rooms.map(room => room.getId());
    }

    getRooms() {
        return this.getAttr().rooms;
    }

    getAttr() {
        return this._attr; // eslint-disable-line no-underscore-dangle, id-match
    }

    destroy() {
        const roomMaster = this;
        const attr = roomMaster.getAttr();
        const {rooms} = attr;

        while (rooms.length) {
            rooms[rooms.length - 1].destroy();
        }

        if (roomMaster.getAttr().rooms.length !== 0) {
            console.error('--- ERROR ---> roomMaster.getAttr().rooms.length !== 0');
        }
    }
}

module.exports.RoomMaster = RoomMaster;
module.exports.roomMaster = new RoomMaster();
