(function(laroux) {
    "use strict";

    // anim
    laroux.anim = {
        // { object, property, from, to, step }
        set: function(newanim) {
            if (typeof newanim.from != 'undefined' && newanim.from !== null) {
                newanim.object[targetProperty] = newanim.from;
            }

            // if (typeof newanim.id == 'undefined') {
            //     newanim.id = laroux.helpers.getUniqueId();
            // }

            laroux.timers.set({
                timeout: 1,
                reset: true,
                ontick: laroux.anim.ontick,
                state: newanim
            });
        },

        ontick: function(newanim) {
            var current = newanim.object[newanim.property];
            var diff = newanim.to - current;
            console.log(diff);

            if (diff === 0) {
                return false;
            }

            var step = (typeof newanim.step != 'undefined') ? newanim.step : 1;

            if (diff > 0) {
                newanim.object[newanim.property] += step;
            } else {
                newanim.object[newanim.property] -= step;
            }
        }
    };

})(this.laroux);
