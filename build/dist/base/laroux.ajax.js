/**
 * laroux.js - A jquery substitute for modern browsers (base bundle)
 *
 * @version v2.2.0
 * @link https://larukedi.github.io/laroux.js
 * @license Apache-2.0
 */
/*jslint node: true */
/*global fetch, Headers, Request, Response, Blob, FormData, FileReader, XMLHttpRequest */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _larouxHelpersJs = require('./laroux.helpers.js');

var _larouxHelpersJs2 = _interopRequireDefault(_larouxHelpersJs);

var _larouxPromiseObjectJs = require('./laroux.promiseObject.js');

var _larouxPromiseObjectJs2 = _interopRequireDefault(_larouxPromiseObjectJs);

// ajax - partially taken from 'window.fetch polyfill' project
//        can be found at: https://github.com/github/fetch
//        see laroux.ajax.LICENSE file for details
var fetchPolyfill = function fetchPolyfill(request, init) {
    // TODO: Request constructor should accept input, init
    if (init || request.constructor !== RequestPolyfill) {
        request = new RequestPolyfill(request, init);
    }

    return new _larouxPromiseObjectJs2['default'](function (resolve, reject) {
        var xhr = new XMLHttpRequest();

        xhr.onload = function () {
            var status = xhr.status === 1223 ? 204 : xhr.status;
            if (status < 100 || status >= 600) {
                reject(new TypeError('Network request failed'));
                return;
            }

            var options = {
                status: status,
                statusText: xhr.statusText,
                headers: new HeadersPolyfill()
            },
                allHeaders = xhr.getAllResponseHeaders(),
                pairs = allHeaders.trim().split('\n');

            pairs.forEach(function (header) {
                var split = header.trim().split(':'),
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

var HeadersPolyfill = (function () {
    function HeadersPolyfill(headers) {
        _classCallCheck(this, HeadersPolyfill);

        this.map = {};

        this['delete'] = this._delete;

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

    _createClass(HeadersPolyfill, [{
        key: 'normalizeName',
        value: function normalizeName(name) {
            if (name.constructor !== String) {
                name = name.toString();
            }

            if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
                throw new TypeError('Invalid character in header field name');
            }

            return name.toLowerCase();
        }
    }, {
        key: 'normalizeValue',
        value: function normalizeValue(value) {
            if (value.constructor !== String) {
                value = value.toString();
            }

            return value.toLowerCase();
        }
    }, {
        key: 'append',
        value: function append(name, value) {
            name = this.normalizeName(name);

            if (!(name in this.map)) {
                this.map[name] = [];
            }

            this.map[name].push(this.normalizeValue(value));
        }
    }, {
        key: '_delete',
        value: function _delete(name) {
            delete this.map[this.normalizeName(name)];
        }
    }, {
        key: 'get',
        value: function get(name) {
            var values = this.map[this.normalizeName(name)];
            return values ? values[0] : null;
        }
    }, {
        key: 'getAll',
        value: function getAll(name) {
            return this.map[this.normalizeName(name)] || [];
        }
    }, {
        key: 'has',
        value: function has(name) {
            return this.normalizeName(name) in this.map;
        }
    }, {
        key: 'set',
        value: function set(name, value) {
            this.map[this.normalizeName(name)] = [this.normalizeValue(value)];
        }
    }, {
        key: 'forEach',
        value: function forEach(callback, context) {
            Object.getOwnPropertyNames(this.map).forEach(function (name) {
                this.map[name].forEach(function (value) {
                    callback.call(context, value, name, this);
                }, this);
            }, this);
        }
    }]);

    return HeadersPolyfill;
})();

var Body = (function () {
    function Body() {
        _classCallCheck(this, Body);

        this.bodyUsed = false;
    }

    _createClass(Body, [{
        key: 'blob',
        value: function blob() {
            var rejected = this.consumed();
            if (rejected) {
                return rejected;
            }

            if (this.content instanceof Blob) {
                return _larouxPromiseObjectJs2['default'].resolve(this.content);
            }

            if (this.content instanceof FormData) {
                throw new Error('could not read FormData body as blob');
            }

            return _larouxPromiseObjectJs2['default'].resolve(new Blob([this.content]));
        }
    }, {
        key: 'arrayBuffer',
        value: function arrayBuffer() {
            return this.blob().then();
        }
    }, {
        key: 'text',
        value: function text() {
            var rejected = this.consumed();
            if (rejected) {
                return rejected;
            }

            if (this.content instanceof Blob) {
                return this.readBlobAsText(this.content);
            }

            if (this.content instanceof FormData) {
                throw new Error('could not read FormData body as text');
            }

            return _larouxPromiseObjectJs2['default'].resolve(this.content);
        }
    }, {
        key: 'formData',
        value: function formData() {
            return this.text().then(this.decode);
        }
    }, {
        key: 'json',
        value: function json() {
            return this.text().then(JSON.parse);
        }
    }, {
        key: 'consumed',
        value: function consumed() {
            if (this.bodyUsed) {
                return _larouxPromiseObjectJs2['default'].reject(new TypeError('Already read'));
            }

            this.bodyUsed = true;
        }
    }, {
        key: 'readBlobAsArrayBuffer',
        value: function readBlobAsArrayBuffer(blob) {
            var reader = new FileReader();
            reader.readAsArrayBuffer(blob);

            return this.fileReaderReady(reader);
        }
    }, {
        key: 'readBlobAsText',
        value: function readBlobAsText(blob) {
            var reader = new FileReader();
            reader.readAsText(blob);

            return this.fileReaderReady(reader);
        }
    }, {
        key: 'fileReaderReady',
        value: function fileReaderReady(reader) {
            return new _larouxPromiseObjectJs2['default'](function (resolve, reject) {
                reader.onload = function () {
                    resolve(reader.result);
                };

                reader.onerror = function () {
                    reject(reader.error);
                };
            });
        }
    }]);

    return Body;
})();

var RequestPolyfill = (function (_Body) {
    function RequestPolyfill(url, options) {
        _classCallCheck(this, RequestPolyfill);

        _get(Object.getPrototypeOf(RequestPolyfill.prototype), 'constructor', this).call(this);

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

    _inherits(RequestPolyfill, _Body);

    return RequestPolyfill;
})(Body);

var ResponsePolyfill = (function (_Body2) {
    function ResponsePolyfill(body, options) {
        _classCallCheck(this, ResponsePolyfill);

        _get(Object.getPrototypeOf(ResponsePolyfill.prototype), 'constructor', this).call(this);

        if (options === undefined) {
            options = {};
        }

        this.type = 'default';
        this.url = options.url || '';
        this.status = options.status;
        this.ok = this.status >= 200 && this.status < 300;
        this.statusText = options.statusText;
        this.headers = options.headers.constructor === HeadersPolyfill ? options.headers : new HeadersPolyfill(options.headers);

        this.content = body;
    }

    _inherits(ResponsePolyfill, _Body2);

    return ResponsePolyfill;
})(Body);

var fetchExist = ('fetch' in global);

var ajax = {
    fetch: fetchExist ? _larouxHelpersJs2['default'].bindContext(fetch, global) : fetchPolyfill,
    Headers: fetchExist ? Headers : HeadersPolyfill,
    Request: fetchExist ? Request : RequestPolyfill,
    Response: fetchExist ? Response : ResponsePolyfill
};

exports['default'] = ajax;
module.exports = exports['default'];