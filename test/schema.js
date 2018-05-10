import messageConst from './../module/room/message.js';

export const meta = {
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

export const state = {
    type: 'object',
    required: ['state', 'meta'],
    properties: {
        state: {
            type: 'string' // user's type
        },
        meta
    }
};

export const stateArraySchema = {
    type: 'array',
    uniqueItems: true,
    items: state
};

export const createRoom = {
    type: 'object',
    required: ['roomId'],
    properties: {
        roomId: {
            type: 'string'
        }
    }
};

export const getRoomIds = {
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

export const joinIntoRoom = {
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

export const joinIntoRoomMessage = {
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

export const leaveFromRoom = {
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

export const leaveFromRoomMessage = {
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

export const takeTurn = {
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

export const takeTurnMessage = {
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

export const dropTurn = {
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

export const dropTurnMessage = {
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

export const pushState = {
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

export const pushStateFail = {
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

export const pushStateMessage = {
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

export const getStates = {
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

export const userDisconnectedFromRoomMessage = {
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
