/* global setTimeout */
const {localRequest} = require('./../module/local-request');
const {LocalSocketIoClient} = require('./../module/local-socket-io-client');

module.exports.getAsJson = url => {
    return new Promise((resolve, reject) => {
        localRequest
            .get(url, (error, response, body) => error ? reject(error) : resolve(JSON.parse(body)));
    });
};

module.exports.postAsJson = (url, params) => {
    return new Promise((resolve, reject) => {
        localRequest
            .post(url, params,
                (error, response, body) => error ? reject(error) : resolve(JSON.parse(body)));
    });
};

module.exports.createUser = () => {
    const clientData = {
        userId: '',
        socket: null,
        messages: []
    };

    return new Promise((resolve, reject) => {
        const options = {
            transports: ['websocket'],
            'force new connection': true
        };

        const localSocketIoClient = new LocalSocketIoClient();

        localSocketIoClient.connect('http://localhost:' + getServerOptions().port, options);

        localSocketIoClient.on('message', message => clientData.messages.push(message));

        localSocketIoClient.on('connect', () => {
            Object.assign(clientData, {
                socket: localSocketIoClient,
                userId: 'user-id-' + localSocketIoClient.id
            });
            resolve(clientData);
        });
    });
};

function getServerOptions() {
    return {
        port: 3080,
        'static': 'static' // optional parameter here
    };
}

module.exports.getServerOptions = getServerOptions;

function sleep(timeout) {
    return new Promise(resolve => setTimeout(resolve, timeout));
}

module.exports.sleep = sleep;
