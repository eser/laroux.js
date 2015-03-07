/* @if COMPAT==true */
// @include laroux.backward.js
/* @endif */

(function () {
    'use strict';

    var top = (typeof global !== 'undefined') ? global : window;

    // core
    /* @if ENV!='web' */
    top.laroux = function () {
    };
    /* @endif */
    /* @if ENV=='web' */
    top.laroux = function (selector, parent) {
        if (selector instanceof Array) {
            return laroux.helpers.toArray(
                (parent || document).querySelectorAll(selector)
            );
        }

        /*
        // FIXME: non-chrome optimization
        var re = /^#([^\+\>\[\]\.# ]*)$/.exec(selector);
        if (re) {
            if (parent === undefined) {
                return document.getElementById(re[1]);
            }

            return parent.getElementById(re[1]);
        }
        */

        return (parent || document).querySelector(selector);
    };
    /* @endif */

    if (top.$l === undefined) {
        top.$l = laroux;
    }

    laroux.helpers = {
        extendObject: function () {
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
                        extendObject(target[name], arguments[item][name]);
                        continue;
                    }

                    target[name] = arguments[item][name];
                }
            }
        },

        toArray: function (obj) {
            var length = obj.length,
                items = new Array(length);

            for (var i = 0; i < length; i++) {
                items[i] = obj[i];
            }
            return items;
        }
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
            laroux.helpers.extendObject(parent, obj);
        }

        return parent;
    };

}).call(this);
