/*jslint node: true */
/*global $l, document, navigator */
'use strict';

// touch - partially taken from 'tocca.js' project
//         can be found at: https://github.com/GianlucaGuarini/Tocca.js
//         see laroux.web.touch.LICENSE file for details
let web_touch = {
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

        web_touch.pos = [event.pageX, event.pageY];
    },

    init: function () {
        let events = [
            0,
            (navigator.msPointerEnabled) ? 2 : 1,
            3
        ];

        for (let i = 0, length = events.length; i < length; i++) {
            $l.web.dom.setEventSingle(document, web_touch.events.start[events[i]], web_touch.onstart);
            $l.web.dom.setEventSingle(document, web_touch.events.end[events[i]], web_touch.onend);
            $l.web.dom.setEventSingle(document, web_touch.events.move[events[i]], web_touch.locatePointer);
        }
    },

    onstart: function (event) {
        web_touch.locatePointer(event);
        web_touch.cached = [web_touch.pos[0], web_touch.pos[1]];
        web_touch.touchStarted = Date.now();
        /*jslint plusplus: true */
        web_touch.tapCount++;

        let callback = function () {
            if (web_touch.cached[0] >= web_touch.pos[0] - web_touch.precision &&
                    web_touch.cached[0] <= web_touch.pos[0] + web_touch.precision &&
                    web_touch.cached[1] >= web_touch.pos[1] - web_touch.precision &&
                    web_touch.cached[1] <= web_touch.pos[1] + web_touch.precision) {
                if (web_touch.touchStarted === null) {
                    $l.web.dom.dispatchEvent(
                        event.target,
                        (web_touch.tapCount === 2) ? 'dbltap' : 'tap',
                        {
                            innerEvent: event,
                            x: web_touch.pos[0],
                            y: web_touch.pos[1]
                        }
                    );

                    web_touch.tapCount = 0;
                    return;
                }

                if (Date.now() - web_touch.touchStarted > web_touch.longTapTreshold) {
                    $l.web.dom.dispatchEvent(
                        event.target,
                        'longtap',
                        {
                            innerEvent: event,
                            x: web_touch.pos[0],
                            y: web_touch.pos[1]
                        }
                    );

                    web_touch.touchStarted = null;
                    web_touch.tapCount = 0;
                    return;
                }

                web_touch.tapTimer = setTimeout(callback, web_touch.tapTreshold);
                return;
            }

            web_touch.tapCount = 0;
        };

        clearTimeout(web_touch.tapTimer);
        web_touch.tapTimer = setTimeout(callback, web_touch.tapTreshold);
    },

    onend: function (event) {
        let delta = [
                web_touch.pos[0] - web_touch.cached[0],
                web_touch.pos[1] - web_touch.cached[1]
            ],
            data = {
                innerEvent: event,
                x: web_touch.pos[0],
                y: web_touch.pos[1],
                distance: {
                    x: Math.abs(delta[0]),
                    y: Math.abs(delta[1])
                }
            };

        web_touch.touchStarted = null;

        if (delta[0] <= -web_touch.swipeTreshold) {
            $l.web.dom.dispatchEvent(event.target, 'swiperight', data);
        }

        if (delta[0] >= web_touch.swipeTreshold) {
            $l.web.dom.dispatchEvent(event.target, 'swipeleft', data);
        }

        if (delta[1] <= -web_touch.swipeTreshold) {
            $l.web.dom.dispatchEvent(event.target, 'swipedown', data);
        }

        if (delta[1] >= web_touch.swipeTreshold) {
            $l.web.dom.dispatchEvent(event.target, 'swipeup', data);
        }
    }
};

$l.ready(web_touch.init);

export default web_touch;
