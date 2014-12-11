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

    laroux.extend = function() {
        Array.prototype.unshift.call(arguments, laroux);
        laroux.extendObject.apply(this, arguments);
    };

    laroux.extendObject = function() {
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

    laroux.map = function(arr, fnc, dontSkipReturns, testOwnProperties) {
        var results = [];

        for (var item in arr) {
            if (testOwnProperties && !arr.hasOwnProperty(item)) {
                continue;
            }

            var result = fnc(arr[item], item);
            if (result === false) {
                break;
            }

            if (!dontSkipReturns && result !== undefined) {
                results.push(result);
            }
        }

        return results;
    };

    laroux.index = function(arr, value, testOwnProperties) {
        for (var item in arr) {
            if (testOwnProperties && !arr.hasOwnProperty(item)) {
                continue;
            }

            if (arr[item] === object) {
                return item;
            }
        }

        return null;
    };

    laroux.aeach = function(arr, fnc) {
        for (var i = 0, length = arr.length; i < length; i++) {
            if (fnc(i, arr[i]) === false) {
                break;
            }
        }

        return arr;
    };

    laroux.amap = function(arr, fnc, dontSkipReturns) {
        var results = [];

        for (var i = 0, length = arr.length; i < length; i++) {
            var result = fnc(arr[i], i);
            if (result === false) {
                break;
            }

            if (!dontSkipReturns && result !== undefined) {
                results.unshift(result);
            }
        }

        return results;
    };

    laroux.aindex = function(arr, value, start) {
        for (var i = (start || 0), length = arr.length; i < length; i++) {
            if (arr[i] === object) {
                return i;
            }
        }

        return -1;
    };

    // initialization
    // if (typeof module !== 'undefined' && module.exports !== undefined) {
    //     module.exports = laroux;
    // } else {
    //     global.$l = global.laroux = laroux;
    // }
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
