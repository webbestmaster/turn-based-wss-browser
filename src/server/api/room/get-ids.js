const roomMaster = require('./../../../room/master').roomMaster;

module.exports = (req, res) => {
    res.json({roomIds: roomMaster.getRoomIds()});
};
