(function (laroux) {
    'use strict';

    // requires $l.dom

    // touch - partially taken from 'tocca.js' project
    //         can be found at: https://github.com/GianlucaGuarini/Tocca.js
    laroux.touch = {
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

            laroux.touch.pos = [event.pageX, event.pageY];
        },

        onstart: function (event) {
            laroux.touch.locatePointer(event);
            laroux.touch.cached = [laroux.touch.pos[0], laroux.touch.pos[1]];
            laroux.touch.touchStarted = Date.now();
            /*jslint plusplus: true */
            laroux.touch.tapCount++;

            var fnc = function () {
                if (laroux.touch.cached[0] >= laroux.touch.pos[0] - laroux.touch.precision &&
                        laroux.touch.cached[0] <= laroux.touch.pos[0] + laroux.touch.precision &&
                        laroux.touch.cached[1] >= laroux.touch.pos[1] - laroux.touch.precision &&
                        laroux.touch.cached[1] <= laroux.touch.pos[1] + laroux.touch.precision) {
                    if (laroux.touch.touchStarted === null) {
                        laroux.dom.dispatchEvent(
                            event.target,
                            (laroux.touch.tapCount === 2) ? 'dbltap' : 'tap',
                            {
                                innerEvent: event,
                                x: laroux.touch.pos[0],
                                y: laroux.touch.pos[1]
                            }
                        );

                        laroux.touch.tapCount = 0;
                        return;
                    }

                    if (Date.now() - laroux.touch.touchStarted > laroux.touch.longTapTreshold) {
                        laroux.dom.dispatchEvent(
                            event.target,
                            'longtap',
                            {
                                innerEvent: event,
                                x: laroux.touch.pos[0],
                                y: laroux.touch.pos[1]
                            }
                        );

                        laroux.touch.touchStarted = null;
                        laroux.touch.tapCount = 0;
                        return;
                    }

                    laroux.tapTimer = setTimeout(fnc, laroux.touch.tapTreshold);
                    return;
                }

                laroux.touch.tapCount = 0;
            };

            clearTimeout(laroux.tapTimer);
            laroux.tapTimer = setTimeout(fnc, laroux.touch.tapTreshold);
        },

        onend: function (event) {
            var delta = [
                    laroux.touch.pos[0] - laroux.touch.cached[0],
                    laroux.touch.pos[1] - laroux.touch.cached[1]
                ],
                data = {
                    innerEvent: event,
                    x: laroux.touch.pos[0],
                    y: laroux.touch.pos[1],
                    distance: {
                        x: Math.abs(delta[0]),
                        y: Math.abs(delta[1])
                    }
                };

            laroux.touch.touchStarted = null;

            if (delta[0] <= -laroux.touch.swipeTreshold) {
                laroux.dom.dispatchEvent(event.target, 'swiperight', data);
            }

            if (delta[0] >= laroux.touch.swipeTreshold) {
                laroux.dom.dispatchEvent(event.target, 'swipeleft', data);
            }

            if (delta[1] <= -laroux.touch.swipeTreshold) {
                laroux.dom.dispatchEvent(event.target, 'swipedown', data);
            }

            if (delta[1] >= laroux.touch.swipeTreshold) {
                laroux.dom.dispatchEvent(event.target, 'swipeup', data);
            }
        }
    };

    laroux.ready(function () {
        var events = [
            0,
            (navigator.msPointerEnabled) ? 2 : 1,
            3
        ];

        for (var i = 0, length = events.length; i < length; i++) {
            laroux.dom.setEventSingle(document, laroux.touch.events.start[events[i]], laroux.touch.onstart);
            laroux.dom.setEventSingle(document, laroux.touch.events.end[events[i]], laroux.touch.onend);
            laroux.dom.setEventSingle(document, laroux.touch.events.move[events[i]], laroux.touch.locatePointer);
        }
    });

}(this.laroux));
