(function(laroux) {
    "use strict";

    // triggers
    laroux.triggers = {
        delegates: [],
        list: [],

        set: function(condition, fnc, obj) {
            for (var key in condition) {
                if (!condition.hasOwnProperty(key)) {
                    continue;
                }

                if (laroux.triggers.list.indexOf(condition[key]) == -1) {
                    laroux.triggers.list.push(condition[key]);
                }
            }

            laroux.triggers.delegates.push({
                condition: condition,
                fnc: fnc,
                obj: obj
            });
        },

        ontrigger: function(triggerName, eventArgs) {
            var eventIdx = laroux.triggers.list.indexOf(triggerName);
            if (eventIdx != -1) {
                laroux.triggers.list.splice(eventIdx, 1);
            }

            var removeKeys = [];
            for (var key in laroux.triggers.delegates) {
                if (!laroux.triggers.delegates.hasOwnProperty(key)) {
                    continue;
                }

                var count = 0;
                var keyObj = laroux.triggers.delegates[key];

                for (var conditionKey in keyObj.condition) {
                    if (!keyObj.condition.hasOwnProperty(conditionKey)) {
                        continue;
                    }

                    var conditionObj = keyObj.condition[conditionKey];

                    if (laroux.triggers.list.indexOf(conditionObj) != -1) {
                        count++;
                        // break;
                    }
                }

                if (count === 0) {
                    keyObj.fnc(keyObj.obj, eventArgs);
                    removeKeys.unshift(key);
                }
            }

            for (var key2 in removeKeys) {
                if (!removeKeys.hasOwnProperty(key2)) {
                    continue;
                }

                laroux.triggers.delegates.splice(removeKeys[key2], 1);
            }

            console.log('trigger name: ' + triggerName);
        }
    };

})(this.laroux);
