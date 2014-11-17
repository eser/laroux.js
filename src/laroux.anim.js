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

        // { object, property, from, to, time, unit, reset }
        set: function(newanim) {
            newanim.startTime = null;

            if (typeof newanim.unit == 'undefined' || newanim.unit === null) {
                newanim.unit = '';
            }

            if (typeof newanim.from == 'undefined' || newanim.from === null) {
                if (newanim.object === document.body && newanim.property == 'scrollTop') {
                    newanim.from = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;
                } else {
                    newanim.from = newanim.object[newanim.property];
                }
            }

            if (typeof newanim.from == 'string') {
                newanim.from = parseFloat(newanim.from);
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

        setCss: function(newanim) {
            if (typeof newanim.from == 'undefined' || newanim.from === null) {
                newanim.from = laroux.css.getProperty(newanim.object, newanim.property);
            }

            newanim.object = newanim.object.style;
            newanim.property = laroux.helpers.camelCase(newanim.property);

            laroux.anim.set(newanim);
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
                        if (newanim.object === document.body && newanim.property == 'scrollTop') {
                            scrollTo(document.body, keyObj.from);
                        } else {
                            keyObj.object[keyObj.property] = keyObj.from;
                        }
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

            var value = laroux.anim.fx.interpolate(
                newanim.from,
                newanim.to,
                laroux.anim.fx.easing(shift)
            ) + newanim.unit;

            if (newanim.object === document.body && newanim.property == 'scrollTop') {
                scrollTo(document.body, value);
            } else {
                newanim.object[newanim.property] = value;
            }
        }
    };

})(this.laroux);