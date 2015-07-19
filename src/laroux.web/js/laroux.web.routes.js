/*jslint node: true */
/*global $l, location, addEventListener, removeEventListener */
'use strict';

// routes - partially taken from 'routie' project
//          can be found at: https://github.com/jgallen23/routie
//          see laroux.web.routes.LICENSE file for details
let web_routes = {
    map: {},
    attached: false,
    current: null,

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
        web_routes.addNamed(null, path, callback);
    },

    addNamed: function (name, path, callback) {
        if (!(path in web_routes.map)) {
            let converted = web_routes.regexConverter(path);

            web_routes.map[path] = {
                name: name,
                callback: callback,
                params: {},
                keys: converted.keys,
                regex: converted.regex
            };
        } else {
            web_routes.map[path].callback = callback;
        }
    },

    get: function (path) {
        for (let item in web_routes.map) {
            if (!web_routes.map.hasOwnProperty(item)) {
                continue;
            }

            let route = web_routes.map[item],
                match = route.regex.exec(path);

            if (!match) {
                continue;
            }

            let params = {};
            for (let i = 1, length = match.length; i < length; i++) {
                let key = route.keys[i - 1];

                if (key !== undefined) {
                    params[key.name] = (typeof match[i] === 'string') ? decodeURIComponent(match[i]) : match[i];
                }
            }

            return {
                route: item,
                resolved: path,
                params: params,
                callback: route.callback
            };
        }

        return null;
    },

    getNamed: function (name, params) {
        for (let item in web_routes.map) {
            if (!web_routes.map.hasOwnProperty(item)) {
                continue;
            }

            let route = web_routes.map[item],
                path = item;

            for (let i = 0, length = route.keys.length; i < length; i++) {
                let key = route.keys[i];

                path = path.replace(':' + key.name, params[key.name] || '');
            }

            if (route.name == name) {
                return {
                    route: item,
                    resolved: path,
                    params: params,
                    callback: route.callback
                };
            }
        }

        return null;
    },

    link: function (name, params) {
        let route = web_routes.getNamed(name, params);

        if (route === null) {
            return null;
        }

        return route.resolved;
    },

    exec: function (route) {
        let previous = web_routes.current,
            args = $l.map(
                route.params,
                value => value
            );

        web_routes.current = route;
        args.push({
            previous: previous,
            current: web_routes.current
        });

        return route.callback.apply(global, args);
    },

    go: function (path, silent) {
        let attached = web_routes.attached;

        if (silent && attached) {
            web_routes.detach();
        }

        setTimeout(function () {
            location.hash = path;

            if (silent && attached) {
                setTimeout(function () {
                    web_routes.attach();
                }, 1);
            }
        }, 1);
    },

    goNamed: function (name, params, silent) {
        let path = web_routes.link(name, params);

        if (path === null) {
            return null;
        }

        web_routes.go(path, silent);
    },

    reload: function () {
        let hash = location.hash.substring(1),
            route = web_routes.get(hash);

        if (route === null) {
            return;
        }

        web_routes.exec(route);
    },

    attach: function () {
        addEventListener('hashchange', web_routes.reload, false);
        web_routes.attached = true;
    },

    detach: function () {
        removeEventListener('hashchange', web_routes.reload);
        web_routes.attached = false;
    }
};

$l.ready(web_routes.attach);

export default web_routes;
