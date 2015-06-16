import dom from './laroux.dom.js';
import forms from './laroux.forms.js';

export default (function () {
    'use strict';

    // routes - partially taken from 'routie' project
    //          can be found at: https://github.com/jgallen23/routie
    let routes = {
        map: {},

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
                    callbacks: [callback],
                    params: {},
                    keys: converted.keys,
                    regex: converted.regex
                };
            } else {
                routes.map[path].callbacks.push(callback);
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
                    callbacks: route.callbacks
                };
            }

            return null;
        },

        reload: function () {
        },

        go: function (path) {

        }
    };

    return routes;

})();
