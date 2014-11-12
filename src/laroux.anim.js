(function(laroux) {
    "use strict";

    // anim
    laroux.anim = {
        fx: {
            interpolate: function (source, target, shift) {
                return (source + (target - source) * shift);
            },

            easing: function (pos) {
                return (-Math.cos(pos * Math.PI) / 2) + 0.5;
            }
        },

        // { object, property, from, to, time, unit }
        set: function(newanim) {
            newanim.startTime = Date.now();

            if (typeof newanim.unit == 'undefined' || newanim.unit === null) {
                newanim.unit = '';
            }

            if (typeof newanim.from == 'undefined' || newanim.from === null) {
                newanim.from = newanim.object[newanim.property];
            }

            // if (typeof newanim.id == 'undefined') {
            //     newanim.id = laroux.helpers.getUniqueId();
            // }

            laroux.timers.set({
                // id: newanim.id,
                timeout: 1,
                reset: true,
                ontick: laroux.anim.ontick,
                state: newanim
            });
        },

        ontick: function(newanim) {
            var now = Date.now(),
                finishT = newanim.startTime + newanim.time,
                shift = (now > finishT) ? 1 : (now - newanim.startTime) / newanim.time;

            newanim.object[newanim.property] = laroux.anim.fx.interpolate(
                newanim.from,
                newanim.to,
                laroux.anim.fx.easing(shift)
            ) + newanim.unit;

            if (now > finishT) {
                return false;
            }
        }
    };

})(this.laroux);