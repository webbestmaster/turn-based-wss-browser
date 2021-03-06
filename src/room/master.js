// @flow

/* eslint consistent-this: ["error", "roomMaster"] */

const find = require('lodash/find');

const {Room} = require('.');

type AttrType = {|
    +rooms: Array<Room>
|};

class RoomMaster {
    // eslint-disable-next-line no-underscore-dangle, id-match
    _attr: AttrType;
    constructor() {
        const roomMaster = this;

        // eslint-disable-next-line no-underscore-dangle, id-match
        roomMaster._attr = {
            rooms: []
        };
    }

    push(room: Room) {
        const roomMaster = this;
        const rooms = roomMaster.getRooms();

        rooms.push(room);
    }

    removeRoomById(roomId: string) {
        const roomMaster = this;
        const rooms = roomMaster.getRooms();

        const roomToRemove = find(rooms, (room: Room): boolean => room.getId() === roomId);

        if (!roomToRemove) {
            console.log('WARNING ---> room is not exists, room id is: ' + roomId);
            return;
        }

        const roomToRemoveIndex = rooms.indexOf(roomToRemove);

        rooms.splice(roomToRemoveIndex, 1);
    }

    getRoomById(roomId: string): Room | null {
        const roomMaster = this;
        const rooms = roomMaster.getRooms();

        return find(rooms, (room: Room): boolean => room.getId() === roomId) || null;
    }

    getRoomIds(): Array<string> {
        const roomMaster = this;
        const rooms = roomMaster.getRooms();

        return rooms.map((room: Room): string => room.getId());
    }

    getRooms(): Array<Room> {
        return this.getAttr().rooms;
    }

    getAttr(): AttrType {
        // eslint-disable-next-line no-underscore-dangle, id-match
        return this._attr;
    }

    destroy() {
        const roomMaster = this;
        const attr = roomMaster.getAttr();
        const {rooms} = attr;

        // eslint-disable-next-line no-loops/no-loops
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
