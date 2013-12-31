(function(laroux) {
    "use strict";

    // timers
    laroux.timers = {
        delegates: [],

        set: function(timeout, fnc, obj) {
            laroux.timers.delegates.push({
                timeout: timeout,
                fnc: fnc,
                obj: obj
            });
        },

        ontick: function() {
            var removeKeys = [];
            for (var key in laroux.timers.delegates) {
                if (!laroux.timers.delegates.hasOwnProperty(key)) {
                    continue;
                }

                var keyObj = laroux.timers.delegates[key];

                if (keyObj.timeout === null) {
                    keyObj.fnc(keyObj.obj);
                } else {
                    keyObj.timeout -= 0.5;

                    if (keyObj.timeout < 0) {
                        keyObj.fnc(keyObj.obj);
                        removeKeys.unshift(key);
                    }
                }
            }

            for (var key2 in removeKeys) {
                if (!removeKeys.hasOwnProperty(key2)) {
                    continue;
                }

                laroux.timers.delegates.splice(removeKeys[key2], 1);
            }
        }
    };

    laroux.ready(function() {
        window.setInterval(laroux.timers.ontick, 500);
    });

})(this.laroux);
