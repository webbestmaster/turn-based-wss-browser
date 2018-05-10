const messageConst = require('./../module/room/message.json');


const meta = {
    type: 'object',
    required: ['order', 'timestamp', 'hash'],
    properties: {
        order: {
            type: 'number'
        },
        timestamp: {
            type: 'number'
        },
        hash: {
            type: 'string'
        }
    }
};

module.exports.meta = meta;


const state = {
    type: 'object',
    required: ['state', 'meta'],
    properties: {
        state: {
            type: 'string' // user's type
        },
        meta
    }
};

module.exports.state = state;


const stateArraySchema = {
    type: 'array',
    uniqueItems: true,
    items: state
};

module.exports.stateArraySchema = stateArraySchema;


const createRoom = {
    type: 'object',
    required: ['roomId'],
    properties: {
        roomId: {
            type: 'string'
        }
    }
};

module.exports.createRoom = createRoom;


const getRoomIds = {
    type: 'object',
    required: ['roomIds'],
    properties: {
        roomIds: {
            type: 'array',
            uniqueItems: true,
            items: {
                type: 'string'
            }
        }
    }
};

module.exports.getRoomIds = getRoomIds;


const joinIntoRoom = {
    type: 'object',
    required: ['type', 'roomId', 'userId', 'socketId'],
    properties: {
        type: {
            'enum': [messageConst.type.joinIntoRoom]
        },
        roomId: {
            type: 'string'
        },
        userId: {
            type: 'string'
        },
        socketId: {
            type: 'string'
        }
    }
};

module.exports.joinIntoRoom = joinIntoRoom;


const joinIntoRoomMessage = {
    type: 'object',
    required: ['type', 'roomId', 'states'],
    properties: {
        type: {
            'enum': [messageConst.type.joinIntoRoom]
        },
        roomId: {
            type: 'string'
        },
        states: {
            type: 'object',
            required: ['last', 'length'],
            properties: {
                last: {
                    type: 'object',
                    required: joinIntoRoom.required.concat('meta'),
                    properties: Object.assign({},
                        {properties: joinIntoRoom.properties},
                        {meta}
                    )
                },
                length: {
                    type: 'number'
                }
            }
        }
    }
};

module.exports.joinIntoRoomMessage = joinIntoRoomMessage;


const leaveFromRoom = {
    type: 'object',
    required: ['type', 'roomId', 'userId'],
    properties: {
        type: {
            'enum': [messageConst.type.leaveFromRoom]
        },
        roomId: {
            type: 'string'
        },
        userId: {
            type: 'string'
        }
    }
};

module.exports.leaveFromRoom = leaveFromRoom;


const leaveFromRoomMessage = {
    type: 'object',
    required: ['type', 'roomId', 'states'],
    properties: {
        type: {
            'enum': [messageConst.type.leaveFromRoom]
        },
        roomId: {
            type: 'string'
        },
        states: {
            type: 'object',
            required: ['last', 'length'],
            properties: {
                last: {
                    type: 'object',
                    required: leaveFromRoom.required.concat('meta'),
                    properties: Object.assign({},
                        {properties: leaveFromRoom.properties},
                        {meta}
                    )
                },
                length: {
                    type: 'number'
                }
            }
        }
    }
};

module.exports.leaveFromRoomMessage = leaveFromRoomMessage;


const takeTurn = {
    type: 'object',
    required: ['type', 'roomId', 'activeUserId'],
    properties: {
        type: {
            'enum': [messageConst.type.takeTurn]
        },
        roomId: {
            type: 'string'
        },
        activeUserId: {
            type: 'string'
        }
    }
};

module.exports.takeTurn = takeTurn;


const takeTurnMessage = {
    type: 'object',
    required: ['type', 'roomId', 'states'],
    properties: {
        type: {
            'enum': [messageConst.type.takeTurn]
        },
        roomId: {
            type: 'string'
        },
        states: {
            type: 'object',
            required: ['last', 'length'],
            properties: {
                last: {
                    type: 'object',
                    required: takeTurn.required.concat('meta'),
                    properties: Object.assign({},
                        {properties: takeTurn.properties},
                        {meta}
                    )
                },
                length: {
                    type: 'number'
                }
            }
        }
    }
};

module.exports.takeTurnMessage = takeTurnMessage;


const dropTurn = {
    type: 'object',
    required: ['type', 'roomId', 'activeUserId'],
    properties: {
        type: {
            'enum': [messageConst.type.dropTurn]
        },
        roomId: {
            type: 'string'
        },
        activeUserId: {
            type: 'string'
        }
    }
};

module.exports.dropTurn = dropTurn;


const dropTurnMessage = {
    type: 'object',
    required: ['type', 'roomId', 'states'],
    properties: {
        type: {
            'enum': [messageConst.type.dropTurn]
        },
        roomId: {
            type: 'string'
        },
        states: {
            type: 'object',
            required: ['last', 'length'],
            properties: {
                last: {
                    type: 'object',
                    required: dropTurn.required.concat('meta'),
                    properties: Object.assign({},
                        {properties: dropTurn.properties},
                        {meta}
                    )
                },
                length: {
                    type: 'number'
                }
            }
        }
    }
};

module.exports.dropTurnMessage = dropTurnMessage;


const pushState = {
    type: 'object',
    required: ['type', 'roomId', 'states'],
    properties: {
        type: {
            'enum': [messageConst.type.pushState]
        },
        roomId: {
            type: 'string'
        },
        states: {
            type: 'object',
            required: ['last', 'length'],
            properties: {
                last: state,
                length: {
                    type: 'number'
                }
            }
        }
    }
};

module.exports.pushState = pushState;


const pushStateFail = {
    type: 'object',
    required: ['type', 'roomId', 'states'],
    properties: {
        type: {
            'enum': [messageConst.type.pushState]
        },
        roomId: {
            type: 'string'
        },
        states: {
            'enum': [null]
        }
    }
};

module.exports.pushStateFail = pushStateFail;


const pushStateMessage = {
    type: 'object',
    required: ['type', 'roomId', 'states'],
    properties: {
        type: {
            'enum': [messageConst.type.pushState]
        },
        roomId: {
            type: 'string'
        },
        states: {
            type: 'object',
            required: ['last', 'length'],
            properties: {
                last: {
                    type: 'object',
                    required: ['type', 'state', 'meta'],
                    properties: {
                        type: {
                            'enum': [messageConst.type.pushState]
                        },
                        state: {
                            type: 'string'
                        },
                        meta
                    }
                },
                length: {
                    type: 'number'
                }
            }
        }
    }
};

module.exports.pushStateMessage = pushStateMessage;


const getStates = {
    type: 'object',
    required: ['roomId', 'states'],
    properties: {
        roomId: {
            type: 'string'
        },
        states: {
            type: 'array',
            uniqueItems: true,
            items: state
        }
    }
};

module.exports.getStates = getStates;


const userDisconnectedFromRoomMessage = {
    type: 'object',
    required: ['type', 'roomId', 'states'],
    properties: {
        type: {
            'enum': [messageConst.type.userDisconnected]
        },
        roomId: {
            type: 'string'
        },
        states: {
            type: 'object',
            required: ['last', 'length'],
            properties: {
                last: {
                    type: 'object',
                    required: ['type', 'roomId', 'userId', 'meta'],
                    properties: {
                        type: {
                            'enum': [messageConst.type.userDisconnected]
                        },
                        roomId: {
                            type: 'string'
                        },
                        userId: {
                            type: 'string'
                        },
                        meta
                    }
                },
                length: {
                    type: 'number'
                }
            }
        }
    }
};

module.exports.userDisconnectedFromRoomMessage = userDisconnectedFromRoomMessage;
