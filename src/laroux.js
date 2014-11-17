(function() {
    "use strict";

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

        if (typeof parent == 'undefined') {
            return document.querySelector(selector);
        }

        return parent.querySelector(selector);
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

        for (var key in arr) {
            var result = fnc(key, arr[key]);
            if (result === false) {
                break;
            }
            if (result !== null) {
                results.push(result);
            }
        }

        return results;
    };

    // initialization
    this.$l = this.laroux = laroux;

    document.addEventListener('DOMContentLoaded', laroux.contentEnd);

}).call(this);
