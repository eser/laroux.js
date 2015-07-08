/*jslint node: true */
/*global document, requestAnimationFrame, scrollTo */
'use strict';

import css from './laroux.css.js';
import helpers from '../laroux.helpers.js';
import PromiseObject from '../laroux.promiseObject.js';

let anim = {
    data: [],

    fx: {
        interpolate: function (source, target, shift) {
            return (source + (target - source) * shift);
        },

        easing: function (pos) {
            return (-Math.cos(pos * Math.PI) / 2) + 0.5;
        }
    },

    // {object, property, from, to, time, unit, reset}
    set: function (newanim) {
        newanim.deferred = new PromiseObject(function (resolve, reject) {
            newanim.deferredResolve = resolve;
            newanim.deferredReject = reject;
        });

        newanim.startTime = undefined;

        if (newanim.unit === null || newanim.unit === undefined) {
            newanim.unit = '';
        }

        if (newanim.from === null || newanim.from === undefined) {
            if (newanim.object === document.body && newanim.property === 'scrollTop') {
                newanim.from = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;
            } else {
                newanim.from = newanim.object[newanim.property];
            }
        }

        if (newanim.from.constructor === String) {
            newanim.from = Number(newanim.from);
        }

        // if (newanim.id === undefined) {
        //     newanim.id = helpers.getUniqueId();
        // }

        anim.data.push(newanim);
        if (anim.data.length === 1) {
            requestAnimationFrame(anim.onframe);
        }

        return newanim.deferred;
    },

    setCss: function (newanim) {
        if (newanim.from === null || newanim.from === undefined) {
            newanim.from = css.getProperty(newanim.object, newanim.property);
        }

        newanim.object = newanim.object.style;
        newanim.property = helpers.camelCase(newanim.property);

        return anim.set(newanim);
    },

    remove: function (id) {
        let targetKey = null;

        for (let item in anim.data) {
            if (!anim.data.hasOwnProperty(item)) {
                continue;
            }

            let currentItem = anim.data[item];

            if (currentItem.id !== undefined && currentItem.id == id) {
                targetKey = item;
                break;
            }
        }

        if (targetKey !== null) {
            let deferred = anim.data[targetKey];

            deferred.deferredReject('stop');

            anim.data.splice(targetKey, 1);
            return true;
        }

        return false;
    },

    onframe: function (timestamp) {
        let removeKeys = [];

        for (let item in anim.data) {
            if (!anim.data.hasOwnProperty(item)) {
                continue;
            }

            let currentItem = anim.data[item];
            if (currentItem.startTime === undefined) {
                currentItem.startTime = timestamp;
            }

            anim.step(currentItem, timestamp);

            if (timestamp > currentItem.startTime + currentItem.time) {
                if (currentItem.reset === true) {
                    currentItem.startTime = timestamp;
                    if (currentItem.object === document.body && currentItem.property === 'scrollTop') {
                        scrollTo(0, currentItem.from);
                        // setTimeout(function () { scrollTo(0, currentItem.from); }, 1);
                    } else {
                        currentItem.object[currentItem.property] = currentItem.from;
                    }
                } else {
                    removeKeys = helpers.prependArray(removeKeys, item);
                    currentItem.deferredResolve();
                }
            }
        }

        for (let item2 in removeKeys) {
            if (!removeKeys.hasOwnProperty(item2)) {
                continue;
            }

            anim.data.splice(removeKeys[item2], 1);
        }

        if (anim.data.length > 0) {
            requestAnimationFrame(anim.onframe);
        }
    },

    step: function (newanim, timestamp) {
        let finishT = newanim.startTime + newanim.time,
            shift = (timestamp > finishT) ? 1 : (timestamp - newanim.startTime) / newanim.time;

        let value = anim.fx.interpolate(
            newanim.from,
            newanim.to,
            anim.fx.easing(shift)
        ) + newanim.unit;

        if (newanim.object === document.body && newanim.property === 'scrollTop') {
            scrollTo(0, value);
            // setTimeout(function () { scrollTo(0, value); }, 1);
        } else {
            newanim.object[newanim.property] = value;
        }
    }
};

export default anim;
