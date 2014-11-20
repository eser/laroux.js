(function(laroux) {
    "use strict";

    // requires $l.helpers

    // triggers
    laroux.triggers = {
        delegates: [],
        list: [],

        set: function(condition, fnc, state) {
            var conditions = laroux.helpers.getAsArray(condition);

            for (var key in conditions) {
                if (!conditions.hasOwnProperty(key)) {
                    continue;
                }

                if (laroux.triggers.list.indexOf(conditions[key]) == -1) {
                    laroux.triggers.list.push(conditions[key]);
                }
            }

            laroux.triggers.delegates.push({
                conditions: conditions,
                fnc: fnc,
                state: state
            });
        },

        ontrigger: function(triggerName, args) {
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

                for (var conditionKey in keyObj.conditions) {
                    if (!keyObj.conditions.hasOwnProperty(conditionKey)) {
                        continue;
                    }

                    var conditionObj = keyObj.conditions[conditionKey];

                    if (laroux.triggers.list.indexOf(conditionObj) != -1) {
                        count++;
                        // break;
                    }
                }

                if (count === 0) {
                    keyObj.fnc(
                        {
                            state: keyObj.state,
                            args: laroux.helpers.getAsArray(args)
                        }
                    );
                    removeKeys.unshift(key);
                }
            }

            for (var key2 in removeKeys) {
                if (!removeKeys.hasOwnProperty(key2)) {
                    continue;
                }

                laroux.triggers.delegates.splice(removeKeys[key2], 1);
            }

            // console.log('trigger name: ' + triggerName);
        }
    };

})(this.laroux);
