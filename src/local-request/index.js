// @flow

/* global setTimeout */

/* eslint consistent-this: ["error", "localRequest"] */
const {localMaster} = require('./../local-master');

import type {PushedStateType} from './../room';

export type RequestCallBackType = (error: Error | null, response: mixed, body: string) => void;

function request(requestType: 'get' | 'post',
                 url: string, form: PushedStateType, requestCallBack: RequestCallBackType) {
    setTimeout((): void => localMaster.triggerHttp(requestType, url, form, requestCallBack), 0);
}

function get(url: string, form: PushedStateType, requestCallBack: RequestCallBackType) {
    request('get', url, form, requestCallBack);
}

module.exports.get = get;

function post(url: string, form: PushedStateType, requestCallBack: RequestCallBackType) {
    request('post', url, form, requestCallBack);
}

module.exports.post = post;
