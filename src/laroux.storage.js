(function(laroux) {
    "use strict";

    // storage
    laroux.storage = {
        data: [], // default with noframe

        install: function() {
            if (typeof parent != 'undefined' && typeof parent.frames.hidden != 'undefined') {
                if (typeof parent.frames.hidden.storage == 'undefined') {
                    parent.frames.hidden.storage = [];
                }

                laroux.storage.data = parent.frames.hidden.storage;
            }
        },

        flush: function() {
            laroux.storage.data.length = 0;
        },

        exists: function(key) {
            return (typeof laroux.storage.data[key] != 'undefined');
        },

        set: function(key, value) {
            laroux.storage.data[key] = value;
        },

        get: function(key, value) {
            return laroux.storage.data[key];
        }
    };

})(this.laroux);
