class Socket {
    constructor() {
        const socket = this;

        socket.callbackList = [];
    }

    on(eventName, callback) {
        const socket = this;

        socket.callbackList.push([eventName, callback]);
    }

    trigger(eventName, args) {
        const socket = this;

        setTimeout(
            () => socket.callbackList
                .filter(eventData => eventData[0] === eventName)
                .forEach(eventData => eventData[1](...args)),
            0);
    }
}

const socketMap = {};

const socketIoClient = {
    connect(url, options) {
        const newSocket = socketMap.hasOwnProperty(url) ? socketMap[url] : new Socket();

        socketMap[url] = newSocket;

        setTimeout(() => newSocket.trigger('connect', []), 0);

        return newSocket;
    }
};

export default socketIoClient;
