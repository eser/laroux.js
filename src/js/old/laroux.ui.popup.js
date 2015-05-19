(function () {
    'use strict';

    // ui.popup
    laroux.ns('laroux.ui.popup', {
        defaultTimeout: 500,

        createBox: function (id, xclass, message) {
            return laroux.dom.createElement('DIV', { id: id, 'class': xclass }, message);
        },

        msgbox: function (timeout, message) {
            var id = laroux.getUniqueId(),
                obj = laroux.ui.popup.createBox(id, 'larouxMsgBox', message);

            laroux.ui.floatContainer.appendChild(obj);
            laroux.css.setProperty(obj, { opacity: 1 });

            laroux.timers.set({
                timeout: timeout,
                reset: false,
                ontick: function (x) {
                    // laroux.css.setProperty(x, { opacity: 0 });
                    laroux.dom.remove(x);
                },
                state: obj
            });
        }
    });

}).call(this);
