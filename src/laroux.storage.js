(function(laroux) {
    "use strict";

    // storage
    laroux.storage = {
        data: null,

        init: function() {
            if (typeof parent != 'undefined' && typeof parent.frames.hidden != 'undefined') {
                if (typeof parent.frames.hidden.storage == 'undefined') {
                    parent.frames.hidden.storage = new laroux.stack();
                }

                laroux.storage.data = parent.frames.hidden.storage;
                return;
            }

            // default with noframe
            laroux.storage.data = new laroux.stack();
        }
    };

})(this.laroux);
