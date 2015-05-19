/**
 * laroux.js - A jquery substitute for modern browsers (base bundle)
 *
 * @version v2.0.0
 * @link https://larukedi.github.io/laroux.js
 * @license Apache-2.0
 */
'use strict';

(function () {
    'use strict';

    var top = typeof global !== 'undefined' ? global : window;

    // core
    top.laroux = function () {};
    if (top.$l === undefined) {
        top.$l = laroux;
    }

    laroux.extendObject = function () {
        var target = Array.prototype.shift.call(arguments),
            isArray = target instanceof Array;

        for (var item in arguments) {
            for (var name in arguments[item]) {
                // if (isArray) {
                //     target.push(arguments[item][name]);
                //     continue;
                // }

                /* target[name].constructor === Object */
                if (target.hasOwnProperty(name) && target[name] instanceof Object) {
                    laroux.extendObject(target[name], arguments[item][name]);
                    continue;
                }

                target[name] = arguments[item][name];
            }
        }
    };

    laroux.toArray = function (obj) {
        var length = obj.length,
            items = new Array(length);

        for (var i = 0; i < length; i++) {
            items[i] = obj[i];
        }
        return items;
    };

    laroux.ns = function (path, obj) {
        var pathSlices = path.split('.'),
            parent = top;

        for (var i = 0, length1 = pathSlices.length; i < length1; i++) {
            var current = pathSlices[i];

            if (parent[current] === undefined) {
                parent[current] = {};
            }

            parent = parent[current];
        }

        if (obj !== undefined) {
            laroux.extendObject(parent, obj);
        }

        return parent;
    };
}).call(undefined);