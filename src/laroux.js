(function(global) {
    'use strict';

    // core
    var laroux = function(selector, parent) {
        if (selector instanceof Array) {
            var elements;
            if (typeof parent == 'undefined') {
                elements = document.querySelectorAll(selector);
            } else {
                elements = parent.querySelectorAll(selector);
            }

            return Array.prototype.slice.call(elements);
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

        if (typeof parent == 'undefined') {
            return document.querySelector(selector);
        }

        return parent.querySelector(selector);
    };

    laroux.id = function(selector, parent) {
        if (typeof parent == 'undefined') {
            return document.getElementById(selector);
        }

        return parent.getElementById(selector);
    };

    laroux.baseLocation = '';
    laroux.selectedMaster = '';
    laroux.popupFunc = alert;
    laroux.readyPassed = false;

    laroux.contentBegin = function(masterName, locationUrl) {
        laroux.baseLocation = locationUrl;
        laroux.selectedMaster = masterName;
    };

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
        for (var key in arr) {
            if (fnc(key, arr[key]) === false) {
                break;
            }
        }

        return arr;
    };

    laroux.map = function(arr, fnc) {
        var results = [];

        /*
        // FIXME: non-chrome optimization
        if (typeof arr.length != 'undefined') {
            for (var i = arr.length; i >= 0; i--) {
                var result = fnc(arr[i], i);
                if (result === false) {
                    break;
                }

                if (typeof result !== 'undefined') {
                    results.unshift(result);
                }
            }

            return results;
        }
        */

        for (var key in arr) {
            var result = fnc(arr[key], key);
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
        for (var i = arr.length - 1; i >= 0; i--) {
            if (fnc(i, arr[i]) === false) {
                break;
            }
        }

        return arr;
    };

    laroux.amap = function(arr, fnc) {
        var results = [];

        for (var i = arr.length - 1; i >= 0; i--) {
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
