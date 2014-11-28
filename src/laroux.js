(function(global) {
    'use strict';

    // core
    var laroux = function(selector, parent) {
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

    laroux.cached = {
        single: {},
        array: {},
        id: {}
    };

    laroux.c = function(selector) {
        if (selector instanceof Array) {
            return laroux.cached.array[selector] || (
                laroux.cached.array[selector] = laroux.helpers.toArray(
                    document.querySelectorAll(selector)
                )
            );
        }

        return laroux.cached.single[selector] || (
            laroux.cached.single[selector] = document.querySelector(selector)
        );
    };

    laroux.id = function(selector, parent) {
        return (parent || document).getElementById(selector);
    };

    laroux.idc = function(selector) {
        return laroux.cached.id[selector] ||
            (laroux.cached.id[selector] = document.getElementById(selector));
    };

    laroux.parent = global;
    laroux.popupFunc = alert;
    laroux.readyPassed = false;

    laroux.ready = function(fnc) {
        if (!laroux.readyPassed) {
            laroux.events.add('ContentLoaded', fnc);
            return;
        }

        fnc();
    };

    laroux.extend = function(obj) {
        for (var name in obj) {
            if (laroux.hasOwnProperty(name)) {
                continue;
            }

            laroux[name] = obj[name];
        }
    };

    laroux.each = function(arr, fnc, testOwnProperties) {
        for (var item in arr) {
            if (testOwnProperties && !arr.hasOwnProperty(item)) {
                continue;
            }

            if (fnc(item, arr[item]) === false) {
                break;
            }
        }

        return arr;
    };

    laroux.map = function(arr, fnc, testOwnProperties) {
        var results = [];

        for (var item in arr) {
            if (testOwnProperties && !arr.hasOwnProperty(item)) {
                continue;
            }

            var result = fnc(arr[item], item);
            if (result === false) {
                break;
            }

            if (typeof result !== 'undefined') {
                results.push(result);
            }
        }

        return results;
    };

    laroux.aeach = function(arr, fnc) {
        for (var i = 0, length = arr.length; i < length; i++) {
            if (fnc(i, arr[i]) === false) {
                break;
            }
        }

        return arr;
    };

    laroux.amap = function(arr, fnc) {
        var results = [];

        for (var i = 0, length = arr.length; i < length; i++) {
            var result = fnc(arr[i], i);
            if (result === false) {
                break;
            }

            if (result !== undefined) {
                results.unshift(result);
            }
        }

        return results;
    };

    // initialization
    global.$l = global.laroux = laroux;

    document.addEventListener(
        'DOMContentLoaded',
        function() {
            if (!laroux.readyPassed) {
                laroux.events.invoke('ContentLoaded');
                laroux.readyPassed = true;
            }
        }
    );

})(this);
