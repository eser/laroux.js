import laroux from '../laroux.js';

import helpers from '../laroux.helpers.js';

export default (function () {
    'use strict';

    // routes - partially taken from 'routie' project
    //          can be found at: https://github.com/jgallen23/routie
    let routes = {
        map: {},
        attached: false,

        regexConverter: function (path, sensitive, strict) {
            let keys = [],
                regexString = path
                .concat(strict ? '' : '/?')
                .replace(/\/\(/g, '(?:/')
                .replace(/\+/g, '__plus__')
                .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?/g, function (_, slash, format, key, capture, optional) {
                    keys.push({ name: key, optional: !!optional });
                    slash = slash || '';

                    return '' + (optional ? '' : slash) + '(?:' + (optional ? slash : '') + (format || '') +
                        (capture || (format && '([^/.]+?)' || '([^/]+?)')) + ')' + (optional || '');
                })
                .replace(/([\/.])/g, '\\$1')
                .replace(/__plus__/g, '(.+)')
                .replace(/\*/g, '(.*)');

            return {
                regex: new RegExp('^' + regexString + '$', sensitive ? '' : 'i'),
                keys: keys
            };
        },

        add: function (path, callback) {
            routes.addNamed(null, path, callback);
        },

        addNamed: function (name, path, callback) {
            if (!(path in routes.map)) {
                let converted = routes.regexConverter(path);

                routes.map[path] = {
                    name: name,
                    callback: callback,
                    params: {},
                    keys: converted.keys,
                    regex: converted.regex
                };
            } else {
                routes.map[path].callback = callback;
            }
        },

        get: function (path) {
            for (let item in routes.map) {
                if (!routes.map.hasOwnProperty(item)) {
                    continue;
                }

                let route = routes.map[item],
                    match = route.regex.exec(path);

                if (!match) {
                    continue;
                }

                let params = {};
                for (let i = 1, length = match.length; i < length; i++) {
                    let key = route.keys[i - 1];

                    if (key !== undefined) {
                        params[key.name] = (typeof match[i] == 'string') ? decodeURIComponent(match[i]) : match[i];
                    }
                }

                return {
                    route: item,
                    params: params,
                    callback: route.callback
                };
            }

            return null;
        },

        exec: function (path) {
            let route = routes.get(path);

            if (route === null) {
                return null;
            }

            return route.callback.apply(
                global,
                helpers.map(
                    route.params,
                    value => value
                )
            );
        },

        go: function (path, silent) {
            let attached = routes.attached;

            if (silent && attached) {
                routes.detach();
            }

            setTimeout(function () {
                global.location.hash = path;

                if (silent && attached) {
                    setTimeout(function () {
                        routes.attach();
                    }, 1);
                }
            }, 1);
        },

        reload: function () {
            let hash = location.hash.substring(1);
            routes.exec(hash);
        },

        attach: function () {
            global.addEventListener('hashchange', routes.reload, false);
            routes.attached = true;
        },

        detach: function () {
            global.removeEventListener('hashchange', routes.reload);
            routes.attached = false;
        }
    };

    laroux.ready(routes.attach);

    return routes;

})();
