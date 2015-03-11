(function () {
    'use strict';

    // web
    laroux.ns('laroux', {
        cached: {
            single: {},
            array: {},
            id: {}
        },

        c: function (selector) {
            if (selector instanceof Array) {
                return laroux.cached.array[selector] || (
                    laroux.cached.array[selector] = laroux.toArray(
                        document.querySelectorAll(selector)
                    )
                );
            }

            return laroux.cached.single[selector] || (
                laroux.cached.single[selector] = document.querySelector(selector)
            );
        },

        id: function (selector, parent) {
            return (parent || document).getElementById(selector);
        },

        idc: function (selector) {
            return laroux.cached.id[selector] ||
                (laroux.cached.id[selector] = document.getElementById(selector));
        },

        readyPassed: false,

        ready: function (fnc) {
            if (!laroux.readyPassed) {
                laroux.events.add('ContentLoaded', fnc);
                return;
            }

            fnc();
        }
    });

    document.addEventListener(
        'DOMContentLoaded',
        function () {
            if (!laroux.readyPassed) {
                laroux.events.invoke('ContentLoaded');
                setInterval(laroux.timers.ontick, 100);
                laroux.touch.init();
                laroux.readyPassed = true;
            }
        }
    );

}).call(this);
