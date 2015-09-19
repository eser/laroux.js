/**
 * laroux.js - A jquery substitute for modern browsers (laroux-node bundle)
 *
 * @version v2.2.0
 * @link https://eserozvataf.github.io/laroux.js
 * @license Apache-2.0
 */
/*jslint node: true */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _larouxAjaxJs = require('./laroux.ajax.js');

var _larouxAjaxJs2 = _interopRequireDefault(_larouxAjaxJs);

var _larouxPromiseObjectJs = require('./laroux.promiseObject.js');

var _larouxPromiseObjectJs2 = _interopRequireDefault(_larouxPromiseObjectJs);

var _larouxHelpersJs = require('./laroux.helpers.js');

var _larouxHelpersJs2 = _interopRequireDefault(_larouxHelpersJs);

var require_ = function require_() {
    var name = undefined,
        requirements = undefined,
        callback = undefined;

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
    }

    if (args.length >= 3) {
        name = args[0];
        requirements = args[1];
        callback = args[2];
    } else if (args.length === 2) {
        if (args[0].constructor === Array) {
            name = null;
            requirements = args[0];
            callback = args[1];
        } else {
            name = args[0];
            requirements = [];
            callback = args[1];
        }
    } else {
        name = null;
        requirements = [];
        callback = args[0];
    }

    var dependencies = [];
    for (var i = 0, _length = requirements.length; i < _length; i++) {
        var requirement = requirements[i];

        if (!(requirement in require_.modules)) {
            throw new Error('dependency not loaded: ' + requirement + '.');
        }

        dependencies.push(require_.modules[requirement]);
    }

    var result = undefined;
    if (callback.constructor === _larouxPromiseObjectJs2['default']) {
        dependencies.push(callback);

        result = _larouxPromiseObjectJs2['default'].all(dependencies);
    } else if (callback.constructor === String) {
        if ('require' in global) {
            result = _larouxPromiseObjectJs2['default'].all(dependencies).then(function (dependencies) {
                return require(callback);
            });
        } else {
            (function () {
                var script = undefined;

                var promise = _larouxAjaxJs2['default'].fetch(callback).then(function (response) {
                    return response.text();
                }).then(function (text) {
                    script = text;
                    return text;
                });

                dependencies.push(promise);

                result = _larouxPromiseObjectJs2['default'].all(dependencies).then(function (dependencies) {
                    return _larouxHelpersJs2['default'].executeScript.call(global, script);
                });
            })();
        }
    } else {
        result = _larouxPromiseObjectJs2['default'].all(dependencies).then(function (dependencies) {
            return callback.apply(global, dependencies);
        });
    }

    if (name !== null) {
        require_.modules[name] = result;
    }

    return result;
};

require_.modules = {};

exports['default'] = require_;
module.exports = exports['default'];