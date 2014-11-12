(function(laroux) {
    "use strict";

    // anim
    laroux.anim = {
        // { object, property, from, to, time, unit }
        set: function(newanim) {
            newanim.startTime = new Date();

            if (typeof newanim.unit == 'undefined') {
                newanim.unit = '';
            }

            if (typeof newanim.from != 'undefined' && newanim.from !== null) {
                newanim.from = newanim.object[newanim.property];
            }

            // if (typeof newanim.id == 'undefined') {
            //     newanim.id = laroux.helpers.getUniqueId();
            // }

            laroux.timers.set({
                // id: newanim.id,
                timeout: 25,
                reset: true,
                ontick: laroux.anim.ontick,
                state: newanim
            });
        },

        ontick: function(newanim) {
            var step = Math.min(1, (new Date().getTime() - newanim.startTime) / newanim.time);
            var diff = newanim.to - newanim.from;

            newanim.object[newanim.property] = (newanim.from + step * diff) + newanim.unit;
            if (step === 1) {
                return false;
            }
        }
    };

})(this.laroux);