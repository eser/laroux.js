(function(global) {
    'use strict';

    // core
    var laroux = function(selector, parent) {
        if (selector instanceof Array) {
            return Array.prototype.slice.call(
                (parent || document).querySelectorAll(selector)
            );
        }

        /*
        // FIXME: non-chrome optimization
        var re = /^#([^\+\>\[\]\.# ]*)$/.exec(selector);
        if (re) {
            if (typeof parent == 'undefined') {
                return document.getElementById(re[1]);
            }

            return parent.getElementById(re[1]);
        }
        */

        return (parent || document).querySelector(selector);
    };

    laroux.id = function(selector, parent) {
        return (parent || document).getElementById(selector);
    };

    laroux.idcs = {};
    laroux.idc = function(selector) {
        return laroux.idcs[selector] ||
            (laroux.idcs[selector] = document.getElementById(selector));
    };

    laroux.parent = global;
    laroux.popupFunc = alert;
    laroux.readyPassed = false;

    laroux.contentEnd = function() {
        if (!laroux.readyPassed) {
            laroux.events.invoke('contentEnd');
            laroux.readyPassed = true;
        }
    };

    laroux.ready = function(fnc) {
        if (!laroux.readyPassed) {
            laroux.events.add('contentEnd', fnc);
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

    laroux.each = function(arr, fnc) {
        for (var item in arr) {
            if (fnc(item, arr[item]) === false) {
                break;
            }
        }

        return arr;
    };

    laroux.map = function(arr, fnc) {
        var results = [];

        for (var item in arr) {
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
        for (var i = arr.length; i--; ) {
            if (fnc(i, arr[i]) === false) {
                break;
            }
        }

        return arr;
    };

    laroux.amap = function(arr, fnc) {
        var results = [];

        for (var i = arr.length; i--; ) {
            var result = fnc(arr[i], i);
            if (result === false) {
                break;
            }

            if (typeof result !== 'undefined') {
                results.unshift(result);
            }
        }

        return results;
    };

    // initialization
    global.$l = global.laroux = laroux;

    document.addEventListener('DOMContentLoaded', laroux.contentEnd);

})(this);
