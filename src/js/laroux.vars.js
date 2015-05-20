import helpers from './laroux.helpers.js';

export default (function () {
    'use strict';

    var vars = {
        storages: {
            cookie: {
                defaultPath: '/',

                get: function (name, defaultValue) {
                    let re = new RegExp(encodeURIComponent(name) + '=[^;]+', 'i'),
                        match = document.cookie.match(re);

                    if (!match) {
                        return defaultValue || null;
                    }

                    return decodeURIComponent(match[0].split('=')[1]);
                },

                set: function (name, value, expires, path) {
                    let expireValue = '';
                    if (expires) {
                        expireValue = '; expires=' + expires.toGMTString();
                    }

                    document.cookie = encodeURIComponent(name) + '=' + encodeURIComponent(value) + expireValue + '; path=' + (path || vars.storages.cookie.defaultPath);
                },

                remove: function (name, path) {
                    document.cookie = encodeURIComponent(name) + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=' + (path || vars.storages.cookie.defaultPath);
                }
            },

            local: {
                get: function (name, defaultValue) {
                    if (!(name in localStorage)) {
                        return defaultValue || null;
                    }

                    return JSON.parse(localStorage[name]);
                },

                set: function (name, value) {
                    localStorage[name] = JSON.stringify(value);
                },

                remove: function (name) {
                    delete localStorage[name];
                }
            },

            session: {
                get: function (name, defaultValue) {
                    if (!(name in sessionStorage)) {
                        return defaultValue || null;
                    }

                    return JSON.parse(sessionStorage[name]);
                },

                set: function (name, value) {
                    sessionStorage[name] = JSON.stringify(value);
                },

                remove: function (name) {
                    delete sessionStorage[name];
                }
            }
        },
        storage: 'local',

        get: function () {
            let args = helpers.toArray(arguments),
                storage = args.shift();

            return vars.storages[storage].get.apply(this, args);
        },

        set: function () {
            let args = helpers.toArray(arguments),
                storage = args.shift();

            return vars.storages[storage].set.apply(this, args);
        },

        remove: function () {
            let args = helpers.toArray(arguments),
                storage = args.shift();

            return vars.storages[storage].remove.apply(this, args);
        }
    };

    return vars;

})();
