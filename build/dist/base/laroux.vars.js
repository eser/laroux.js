/**
 * laroux.js - A jquery substitute for modern browsers (base bundle)
 *
 * @version v2.0.0
 * @link https://larukedi.github.io/laroux.js
 * @license Apache-2.0
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

exports['default'] = (function () {
    'use strict';

    var vars = {
        cookiePath: '/',

        getCookie: function getCookie(name, defaultValue) {
            var re = new RegExp(encodeURIComponent(name) + '=[^;]+', 'i'),
                match = document.cookie.match(re);

            if (!match) {
                return defaultValue || null;
            }

            return decodeURIComponent(match[0].split('=')[1]);
        },

        setCookie: function setCookie(name, value, expires, path) {
            var expireValue = '';
            if (expires) {
                expireValue = '; expires=' + expires.toGMTString();
            }

            document.cookie = encodeURIComponent(name) + '=' + encodeURIComponent(value) + expireValue + '; path=' + (path || vars.cookiePath);
        },

        removeCookie: function removeCookie(name, path) {
            document.cookie = encodeURIComponent(name) + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=' + (path || vars.cookiePath);
        },

        getLocal: function getLocal(name, defaultValue) {
            if (!(name in localStorage)) {
                return defaultValue || null;
            }

            return JSON.parse(localStorage[name]);
        },

        setLocal: function setLocal(name, value) {
            localStorage[name] = JSON.stringify(value);
        },

        removeLocal: function removeLocal(name) {
            delete localStorage[name];
        },

        getSession: function getSession(name, defaultValue) {
            if (!(name in sessionStorage)) {
                return defaultValue || null;
            }

            return JSON.parse(sessionStorage[name]);
        },

        setSession: function setSession(name, value) {
            sessionStorage[name] = JSON.stringify(value);
        },

        removeSession: function removeSession(name) {
            delete sessionStorage[name];
        }
    };

    return vars;
})();

module.exports = exports['default'];