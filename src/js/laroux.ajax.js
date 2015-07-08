/*jslint node: true */
/*global fetch, Headers, Request, Response, Blob, FormData, FileReader, XMLHttpRequest */
'use strict';

import helpers from './laroux.helpers.js';
import PromiseObject from './laroux.promiseObject.js';

// ajax - partially taken from 'window.fetch polyfill' project
//        can be found at: https://github.com/github/fetch
//        see laroux.ajax.LICENSE file for details
let fetchPolyfill = function (request, init) {
    // TODO: Request constructor should accept input, init
    if (init || request.constructor !== RequestPolyfill) {
        request = new RequestPolyfill(request, init);
    }

    return new PromiseObject(function (resolve, reject) {
        let xhr = new XMLHttpRequest();

        xhr.onload = function () {
            let status = (xhr.status === 1223) ? 204 : xhr.status;
            if (status < 100 || status >= 600) {
                reject(new TypeError('Network request failed'));
                return;
            }

            let options = {
                status: status,
                statusText: xhr.statusText,
                headers: new HeadersPolyfill()
            },
                allHeaders = xhr.getAllResponseHeaders(),
                pairs = allHeaders.trim().split('\n');

            pairs.forEach(function (header) {
                let split = header.trim().split(':'),
                    key = split.shift().trim(),
                    value = split.join(':').trim();

                options.headers.append(key, value);
            });

            if ('responseURL' in xhr) {
                options.url = xhr.responseURL;
            } else if (options.headers.has('X-Request-URL')) {
                // Avoid security warnings on getResponseHeader when not allowed by CORS
                options.url = options.headers.get('X-Request-URL');
            } else {
                options.url = null;
            }

            resolve(new ResponsePolyfill(xhr.response || xhr.responseText, options));
        };

        xhr.onerror = function () {
            reject(new TypeError('Network request failed'));
        };

        xhr.open(request.method, request.url, true);

        if (request.credentials === 'include') {
            xhr.withCredentials = true;
        }

        if ('Blob' in global && 'responseType' in xhr) {
            xhr.responseType = 'blob';
        }

        request.headers.forEach(function (value, name) {
            xhr.setRequestHeader(name, value);
        });

        xhr.send(request.content);
    });
};

class HeadersPolyfill {
    constructor(headers) {
        this.map = {};

        this.delete = this._delete;

        if (headers !== undefined) {
            if (headers.constructor === HeadersPolyfill) {
                headers.forEach(function (value, name) {
                    this.append(name, value);
                }, this);

                return;
            }

            Object.getOwnPropertyNames(headers).forEach(function (name) {
                this.append(name, headers[name]);
            }, this);
        }
    }

    normalizeName(name) {
        if (name.constructor !== String) {
            name = name.toString();
        }

        if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
            throw new TypeError('Invalid character in header field name');
        }

        return name.toLowerCase();
    }

    normalizeValue(value) {
        if (value.constructor !== String) {
            value = value.toString();
        }

        return value.toLowerCase();
    }

    append(name, value) {
        name = this.normalizeName(name);

        if (!(name in this.map)) {
            this.map[name] = [];
        }

        this.map[name].push(this.normalizeValue(value));
    }

    _delete(name) {
        delete this.map[this.normalizeName(name)];
    }

    get(name) {
        let values = this.map[this.normalizeName(name)];
        return values ? values[0] : null;
    }

    getAll(name) {
        return this.map[this.normalizeName(name)] || [];
    }

    has(name) {
        return this.normalizeName(name) in this.map;
    }

    set(name, value) {
        this.map[this.normalizeName(name)] = [this.normalizeValue(value)];
    }

    forEach(callback, context) {
        Object.getOwnPropertyNames(this.map).forEach(function (name) {
            this.map[name].forEach(function (value) {
                callback.call(context, value, name, this);
            }, this);
        }, this);
    }
}

class Body {
    constructor() {
        this.bodyUsed = false;
    }

    blob() {
        let rejected = this.consumed();
        if (rejected) {
            return rejected;
        }

        if (this.content instanceof Blob) {
            return PromiseObject.resolve(this.content);
        }

        if (this.content instanceof FormData) {
            throw new Error('could not read FormData body as blob');
        }

        return PromiseObject.resolve(new Blob([this.content]));
    }

    arrayBuffer() {
        return this.blob().then();
    }

    text() {
        let rejected = this.consumed();
        if (rejected) {
            return rejected;
        }

        if (this.content instanceof Blob) {
            return this.readBlobAsText(this.content);
        }

        if (this.content instanceof FormData) {
            throw new Error('could not read FormData body as text');
        }

        return PromiseObject.resolve(this.content);
    }

    formData() {
        return this.text().then(this.decode);
    }

    json() {
        return this.text().then(JSON.parse);
    }

    consumed() {
        if (this.bodyUsed) {
            return PromiseObject.reject(new TypeError('Already read'));
        }

        this.bodyUsed = true;
    }

    readBlobAsArrayBuffer(blob) {
        let reader = new FileReader();
        reader.readAsArrayBuffer(blob);

        return this.fileReaderReady(reader);
    }

    readBlobAsText(blob) {
        let reader = new FileReader();
        reader.readAsText(blob);

        return this.fileReaderReady(reader);
    }

    fileReaderReady(reader) {
        return new PromiseObject(function (resolve, reject) {
            reader.onload = function () {
                resolve(reader.result);
            };

            reader.onerror = function () {
                reject(reader.error);
            };
        });
    }
}

class RequestPolyfill extends Body {
    constructor(url, options) {
        super();

        if (options === undefined) {
            options = {};
        }

        this.url = url;
        this.credentials = options.credentials || 'omit';
        this.headers = new HeadersPolyfill(options.headers);
        this.method = options.method || 'GET';
        this.mode = options.mode || null;
        this.referrer = null;

        if (options.body) {
            this.content = options.body;
        }
    }
}

class ResponsePolyfill extends Body {
    constructor(body, options) {
        super();

        if (options === undefined) {
            options = {};
        }

        this.type = 'default';
        this.url = options.url || '';
        this.status = options.status;
        this.ok = (this.status >= 200 && this.status < 300);
        this.statusText = options.statusText;
        this.headers = (options.headers.constructor === HeadersPolyfill) ? options.headers : new HeadersPolyfill(options.headers);

        this.content = body;
    }
}

let fetchExist = ('fetch' in global);

export default {
    fetch: fetchExist ? helpers.bindContext(fetch, global) : fetchPolyfill,
    Headers: fetchExist ? Headers : HeadersPolyfill,
    Request: fetchExist ? Request : RequestPolyfill,
    Response: fetchExist ? Response : ResponsePolyfill
};
