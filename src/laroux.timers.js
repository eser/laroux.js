(function(laroux) {
    "use strict";

    // timers
    laroux.timers = {
        data: [],

        set: function(timer) {
            laroux.timers.data.push(timer);
        },

        ontick: function() {
            var removeKeys = [];
            for (var key in laroux.timers.data) {
                if (!laroux.timers.data.hasOwnProperty(key)) {
                    continue;
                }

                var keyObj = laroux.timers.data[key];

                if (typeof keyObj.timeoutR == 'undefined') {
                    keyObj.timeoutR = keyObj.timeout - 0.5;
                } else {
                    keyObj.timeoutR -= 0.5;
                }

                if (keyObj.timeoutR < 0) {
                    keyObj.ontick(keyObj.state);

                    if (typeof keyObj.reset != 'undefined' && keyObj.reset) {
                        keyObj.timeoutR = keyObj.timeout;
                    } else {
                        removeKeys.unshift(key);
                    }
                }
            }

            for (var key2 in removeKeys) {
                if (!removeKeys.hasOwnProperty(key2)) {
                    continue;
                }

                laroux.timers.data.splice(removeKeys[key2], 1);
            }
        }
    };

    laroux.ready(function() {
        setInterval(laroux.timers.ontick, 500);
    });

})(this.laroux);
