module.exports = (function () {
    'use strict';

    var laroux_dom = require('./laroux.dom.js');

    // touch - partially taken from 'tocca.js' project
    //         can be found at: https://github.com/GianlucaGuarini/Tocca.js
    var laroux_touch = {
        touchStarted: null,
        swipeTreshold: 80,
        precision: 30,
        tapCount: 0,
        tapTreshold: 200,
        longTapTreshold: 800,
        tapTimer: null,
        pos: null,
        cached: null,

        events: {
            start: ['touchstart', 'pointerdown', 'MSPointerDown', 'mousedown'],
            end: ['touchend', 'pointerup', 'MSPointerUp', 'mouseup'],
            move: ['touchmove', 'pointermove', 'MSPointerMove', 'mousemove']
        },

        locatePointer: function (event) {
            if (event.targetTouches) {
                event = event.targetTouches[0];
            }

            laroux_touch.pos = [event.pageX, event.pageY];
        },

        init: function () {
            var events = [
                0,
                (navigator.msPointerEnabled) ? 2 : 1,
                3
            ];

            for (var i = 0, length = events.length; i < length; i++) {
                laroux_dom.setEventSingle(document, laroux_touch.events.start[events[i]], laroux_touch.onstart);
                laroux_dom.setEventSingle(document, laroux_touch.events.end[events[i]], laroux_touch.onend);
                laroux_dom.setEventSingle(document, laroux_touch.events.move[events[i]], laroux_touch.locatePointer);
            }
        },

        onstart: function (event) {
            laroux_touch.locatePointer(event);
            laroux_touch.cached = [laroux_touch.pos[0], laroux_touch.pos[1]];
            laroux_touch.touchStarted = Date.now();
            /*jslint plusplus: true */
            laroux_touch.tapCount++;

            var fnc = function () {
                if (laroux_touch.cached[0] >= laroux_touch.pos[0] - laroux_touch.precision &&
                        laroux_touch.cached[0] <= laroux_touch.pos[0] + laroux_touch.precision &&
                        laroux_touch.cached[1] >= laroux_touch.pos[1] - laroux_touch.precision &&
                        laroux_touch.cached[1] <= laroux_touch.pos[1] + laroux_touch.precision) {
                    if (laroux_touch.touchStarted === null) {
                        laroux_dom.dispatchEvent(
                            event.target,
                            (laroux_touch.tapCount === 2) ? 'dbltap' : 'tap',
                            {
                                innerEvent: event,
                                x: laroux_touch.pos[0],
                                y: laroux_touch.pos[1]
                            }
                        );

                        laroux_touch.tapCount = 0;
                        return;
                    }

                    if (Date.now() - laroux_touch.touchStarted > laroux_touch.longTapTreshold) {
                        laroux_dom.dispatchEvent(
                            event.target,
                            'longtap',
                            {
                                innerEvent: event,
                                x: laroux_touch.pos[0],
                                y: laroux_touch.pos[1]
                            }
                        );

                        laroux_touch.touchStarted = null;
                        laroux_touch.tapCount = 0;
                        return;
                    }

                    laroux_touch.tapTimer = setTimeout(fnc, laroux_touch.tapTreshold);
                    return;
                }

                laroux_touch.tapCount = 0;
            };

            clearTimeout(laroux_touch.tapTimer);
            laroux_touch.tapTimer = setTimeout(fnc, laroux_touch.tapTreshold);
        },

        onend: function (event) {
            var delta = [
                    laroux_touch.pos[0] - laroux_touch.cached[0],
                    laroux_touch.pos[1] - laroux_touch.cached[1]
                ],
                data = {
                    innerEvent: event,
                    x: laroux_touch.pos[0],
                    y: laroux_touch.pos[1],
                    distance: {
                        x: Math.abs(delta[0]),
                        y: Math.abs(delta[1])
                    }
                };

            laroux_touch.touchStarted = null;

            if (delta[0] <= -laroux_touch.swipeTreshold) {
                laroux_dom.dispatchEvent(event.target, 'swiperight', data);
            }

            if (delta[0] >= laroux_touch.swipeTreshold) {
                laroux_dom.dispatchEvent(event.target, 'swipeleft', data);
            }

            if (delta[1] <= -laroux_touch.swipeTreshold) {
                laroux_dom.dispatchEvent(event.target, 'swipedown', data);
            }

            if (delta[1] >= laroux_touch.swipeTreshold) {
                laroux_dom.dispatchEvent(event.target, 'swipeup', data);
            }
        }
    };

    return laroux_touch;

}());
