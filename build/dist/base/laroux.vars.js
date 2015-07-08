/**
 * laroux.js - A jquery substitute for modern browsers (base bundle)
 *
 * @version v2.2.0
 * @link https://larukedi.github.io/laroux.js
 * @license Apache-2.0
 */
/*jslint node: true */
/*global document, localStorage, sessionStorage */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _larouxHelpersJs = require('./laroux.helpers.js');

var _larouxHelpersJs2 = _interopRequireDefault(_larouxHelpersJs);

var vars = {
    storages: {
        cookie: {
            defaultPath: '/',

            get: function get(name, defaultValue) {
                var re = new RegExp(encodeURIComponent(name) + '=[^;]+', 'i'),
                    match = document.cookie.match(re);

                if (!match) {
                    return defaultValue || null;
                }

                return decodeURIComponent(match[0].split('=')[1]);
            },

            set: function set(name, value, expires, path) {
                var expireValue = '';
                if (expires) {
                    expireValue = '; expires=' + expires.toGMTString();
                }

                document.cookie = encodeURIComponent(name) + '=' + encodeURIComponent(value) + expireValue + '; path=' + (path || vars.storages.cookie.defaultPath);
            },

            remove: function remove(name, path) {
                document.cookie = encodeURIComponent(name) + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=' + (path || vars.storages.cookie.defaultPath);
            }
        },

        local: {
            get: function get(name, defaultValue) {
                if (!(name in localStorage)) {
                    return defaultValue || null;
                }

                return JSON.parse(localStorage[name]);
            },

            set: function set(name, value) {
                localStorage[name] = JSON.stringify(value);
            },

            remove: function remove(name) {
                delete localStorage[name];
            }
        },

        session: {
            get: function get(name, defaultValue) {
                if (!(name in sessionStorage)) {
                    return defaultValue || null;
                }

                return JSON.parse(sessionStorage[name]);
            },

            set: function set(name, value) {
                sessionStorage[name] = JSON.stringify(value);
            },

            remove: function remove(name) {
                delete sessionStorage[name];
            }
        }
    },

    get: function get(storage) {
        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            args[_key - 1] = arguments[_key];
        }

        return vars.storages[storage].get.apply(this, args);
    },

    set: function set(storage) {
        for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
            args[_key2 - 1] = arguments[_key2];
        }

        return vars.storages[storage].set.apply(this, args);
    },

    remove: function remove(storage) {
        for (var _len3 = arguments.length, args = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
            args[_key3 - 1] = arguments[_key3];
        }

        return vars.storages[storage].remove.apply(this, args);
    }
};

exports['default'] = vars;
module.exports = exports['default'];