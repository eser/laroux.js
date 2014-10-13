(function(laroux) {
    "use strict";

    // timers
    laroux.timers = {
        data: [],

        set: function(timer) {
            laroux.timers.data.push(timer);
        },

        remove: function(id) {
            var targetKey = null;

            for (var key in laroux.timers.data) {
                if (!laroux.timers.data.hasOwnProperty(key)) {
                    continue;
                }

                var keyObj = laroux.timers.data[key];

                if (typeof keyObj.id != 'undefined' && keyObj.id == id) {
                    targetKey = key;
                    break;
                }
            }

            if (targetKey !== null) {
                laroux.timers.data.splice(targetKey, 1);
                return true;
            }

            return false;
        },

        ontick: function() {
            var removeKeys = [];
            for (var key in laroux.timers.data) {
                if (!laroux.timers.data.hasOwnProperty(key)) {
                    continue;
                }

                var keyObj = laroux.timers.data[key];

                if (typeof keyObj.timeoutR == 'undefined') {
                    keyObj.timeoutR = keyObj.timeout - 1;
                } else {
                    keyObj.timeoutR -= 1;
                }

                if (keyObj.timeoutR < 0) {
                    var result = keyObj.ontick(keyObj.state);

                    if (result !== false && typeof keyObj.reset != 'undefined' && keyObj.reset) {
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
        setInterval(laroux.timers.ontick, 1);
    });

})(this.laroux);
