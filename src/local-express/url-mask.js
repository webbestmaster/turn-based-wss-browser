// @flow

/* eslint consistent-this: ["error", "urlMask"] */

/* global URL */

type ConstructorOptionsType = {|
    +initialUrl: string
|};

type AttrType = {|
    ...ConstructorOptionsType,
    +mask: Array<string>
|};

class UrlMask {
    attr: AttrType;

    constructor(constructorOptions: ConstructorOptionsType) {
        const urlMask = this;

        urlMask.attr = {
            initialUrl: constructorOptions.initialUrl,
            mask: []
        };

        urlMask.makeMask();
    }

    makeMask() {
        const urlMask = this;
        const {mask, initialUrl} = urlMask.attr;

        const parts = initialUrl.split('/').filter((part: string): boolean => Boolean(part));

        mask.push(...parts);
    }

    isCover(url: string): boolean {
        const urlMask = this;
        const {mask} = urlMask.attr;

        const urlObject = new URL(url);
        const urlPartList = urlObject.pathname.split('/').filter((part: string): boolean => Boolean(part));

        if (urlPartList.length !== mask.length) {
            return false;
        }

        return urlPartList.every(
            (urlPart: string, partIndex: number): boolean => {
                const maskPart = mask[partIndex];

                if (!maskPart) {
                    console.error('here is should a maskPart');
                    return false;
                }

                if (maskPart.startsWith(':')) {
                    return true;
                }

                return urlPart === maskPart;
            }
        );
    }

    getParams(url: string): {+[key: string]: string} {
        const urlMask = this;

        const params = {};

        if (!urlMask.isCover(url)) {
            return params;
        }

        const {mask} = urlMask.attr;
        const urlObject = new URL(url);
        const urlPartList = urlObject.pathname.split('/').filter((part: string): boolean => Boolean(part));

        urlPartList.forEach((urlPart: string, partIndex: number) => {
            const maskPart = mask[partIndex];

            if (!maskPart) {
                console.error('here is should a maskPart');
                return;
            }

            if (!maskPart.startsWith(':')) {
                return;
            }

            const paramName = maskPart.slice(1);

            params[paramName] = urlPart;
        });

        return params;
    }
}

module.exports.UrlMask = UrlMask;
