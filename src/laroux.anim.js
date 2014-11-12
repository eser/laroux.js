(function(laroux) {
    "use strict";

    // anim
    laroux.anim = {
        data: [],

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
            newanim.startTime = null;

            if (typeof newanim.unit == 'undefined' || newanim.unit === null) {
                newanim.unit = '';
            }

            if (typeof newanim.from == 'undefined' || newanim.from === null) {
                newanim.from = newanim.object[newanim.property];
            }

            if (typeof newanim.reset == 'undefined' || newanim.reset === null) {
                newanim.reset = false;
            }

            // if (typeof newanim.id == 'undefined') {
            //     newanim.id = laroux.helpers.getUniqueId();
            // }

            laroux.anim.data.push(newanim);
            if (laroux.anim.data.length === 1) {
                requestAnimationFrame(laroux.anim.onframe);
            }
        },

        remove: function(id) {
            var targetKey = null;

            for (var key in laroux.anim.data) {
                if (!laroux.anim.data.hasOwnProperty(key)) {
                    continue;
                }

                var keyObj = laroux.anim.data[key];

                if (typeof keyObj.id != 'undefined' && keyObj.id == id) {
                    targetKey = key;
                    break;
                }
            }

            if (targetKey !== null) {
                laroux.anim.data.splice(targetKey, 1);
                return true;
            }

            return false;
        },

        onframe: function(timestamp) {
            var removeKeys = [];
            for (var key in laroux.anim.data) {
                if (!laroux.anim.data.hasOwnProperty(key)) {
                    continue;
                }

                var keyObj = laroux.anim.data[key];
                if (keyObj.startTime === null) {
                    keyObj.startTime = timestamp;
                }

                var result = laroux.anim.step(keyObj, timestamp);

                if (result === false) {
                    removeKeys.unshift(key);
                } else if (timestamp > keyObj.startTime + keyObj.time) {
                    if (keyObj.reset) {
                        keyObj.startTime = timestamp;
                        keyObj.object[keyObj.property] = keyObj.from;
                    } else {
                        removeKeys.unshift(key);
                    }
                }
            }

            for (var key2 in removeKeys) {
                if (!removeKeys.hasOwnProperty(key2)) {
                    continue;
                }

                laroux.anim.data.splice(removeKeys[key2], 1);
            }

            if (laroux.anim.data.length > 0) {
                requestAnimationFrame(laroux.anim.onframe);
            }
        },

        step: function(newanim, timestamp) {
            var finishT = newanim.startTime + newanim.time,
                shift = (timestamp > finishT) ? 1 : (timestamp - newanim.startTime) / newanim.time;

            newanim.object[newanim.property] = laroux.anim.fx.interpolate(
                newanim.from,
                newanim.to,
                laroux.anim.fx.easing(shift)
            ) + newanim.unit;
        }
    };

})(this.laroux);