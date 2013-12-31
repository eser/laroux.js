(function(laroux) {
    "use strict";

    // stack
    laroux.stack = function() {
        this.entries = {};

        this.add = function(id, entry) {
            this.entries[id] = entry;
        };

        this.addRange = function(entryArray) {
            for (var entry in entryArray) {
                if (!entryArray.hasOwnProperty(entry)) {
                    continue;
                }

                this.entries[entry] = entryArray[entry];
            }
        };

        this.clear = function() {
            this.entries = {};
        };

        this.length = function() {
            return Object.keys(this.entries).length;
        };
    };

})(this.laroux);
