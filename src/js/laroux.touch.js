import dom from './laroux.dom.js';

export default (function () {
    'use strict';

    // touch - partially taken from 'tocca.js' project
    //         can be found at: https://github.com/GianlucaGuarini/Tocca.js
    var touch = {
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

            touch.pos = [event.pageX, event.pageY];
        },

        init: function () {
            var events = [
                0,
                (navigator.msPointerEnabled) ? 2 : 1,
                3
            ];

            for (var i = 0, length = events.length; i < length; i++) {
                dom.setEventSingle(document, touch.events.start[events[i]], touch.onstart);
                dom.setEventSingle(document, touch.events.end[events[i]], touch.onend);
                dom.setEventSingle(document, touch.events.move[events[i]], touch.locatePointer);
            }
        },

        onstart: function (event) {
            touch.locatePointer(event);
            touch.cached = [touch.pos[0], touch.pos[1]];
            touch.touchStarted = Date.now();
            /*jslint plusplus: true */
            touch.tapCount++;

            var fnc = function () {
                if (touch.cached[0] >= touch.pos[0] - touch.precision &&
                        touch.cached[0] <= touch.pos[0] + touch.precision &&
                        touch.cached[1] >= touch.pos[1] - touch.precision &&
                        touch.cached[1] <= touch.pos[1] + touch.precision) {
                    if (touch.touchStarted === null) {
                        dom.dispatchEvent(
                            event.target,
                            (touch.tapCount === 2) ? 'dbltap' : 'tap',
                            {
                                innerEvent: event,
                                x: touch.pos[0],
                                y: touch.pos[1]
                            }
                        );

                        touch.tapCount = 0;
                        return;
                    }

                    if (Date.now() - touch.touchStarted > touch.longTapTreshold) {
                        dom.dispatchEvent(
                            event.target,
                            'longtap',
                            {
                                innerEvent: event,
                                x: touch.pos[0],
                                y: touch.pos[1]
                            }
                        );

                        touch.touchStarted = null;
                        touch.tapCount = 0;
                        return;
                    }

                    touch.tapTimer = setTimeout(fnc, touch.tapTreshold);
                    return;
                }

                touch.tapCount = 0;
            };

            clearTimeout(touch.tapTimer);
            touch.tapTimer = setTimeout(fnc, touch.tapTreshold);
        },

        onend: function (event) {
            var delta = [
                    touch.pos[0] - touch.cached[0],
                    touch.pos[1] - touch.cached[1]
                ],
                data = {
                    innerEvent: event,
                    x: touch.pos[0],
                    y: touch.pos[1],
                    distance: {
                        x: Math.abs(delta[0]),
                        y: Math.abs(delta[1])
                    }
                };

            touch.touchStarted = null;

            if (delta[0] <= -touch.swipeTreshold) {
                dom.dispatchEvent(event.target, 'swiperight', data);
            }

            if (delta[0] >= touch.swipeTreshold) {
                dom.dispatchEvent(event.target, 'swipeleft', data);
            }

            if (delta[1] <= -touch.swipeTreshold) {
                dom.dispatchEvent(event.target, 'swipedown', data);
            }

            if (delta[1] >= touch.swipeTreshold) {
                dom.dispatchEvent(event.target, 'swipeup', data);
            }
        }
    };

    // laroux.ready(touch.init);

    return touch;

})();
