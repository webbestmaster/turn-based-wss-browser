// @flow

const Stopwatch = require('timer-stopwatch');
const roomConfig = require('./config-data.js');
const {Room} = require('./index');
const timersConfig = roomConfig.timers;

function bindTimers(room: Room) {
    const attr = room.getAttr();
    const {timers} = attr;

    // on create room
    const onCreateRoomTimer = new Stopwatch(timersConfig.onCreateRoom.time);

    timers.onCreateRoom = onCreateRoomTimer;

    onCreateRoomTimer.start();

    onCreateRoomTimer.onDone(() => {
        if (room.getConnections().length === 0) {
            room.destroy();
            return;
        }
        onCreateRoomTimer.stop();
    });
}

module.exports.bindTimers = bindTimers;
