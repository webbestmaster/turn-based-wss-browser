/* global setTimeout */
// const request = require('request');
import socketIoClient from './../module/socket/client.js';

export function getAsJson(url) {
    return new Promise((resolve, reject) =>
        request(url, (error, response, body) => error ? reject(error) : resolve(JSON.parse(body))));
}

export function postAsJson(url, params) {
    return new Promise((resolve, reject) =>
        request.post(
            {
                url,
                form: params
            },
            (error, response, body) => error ? reject(error) : resolve(JSON.parse(body))));
}

export function createUser() {
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

        const socket = socketIoClient.connect('http://localhost:' + getServerOptions().port, options);

        socket.on('message', message => clientData.messages.push(message));

        socket.on('connect', () => {
            Object.assign(clientData, {
                socket,
                userId: 'user-id-' + socket.id
            });
            resolve(clientData);
        });
    });
}

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
