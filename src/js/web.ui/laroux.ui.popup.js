/*jslint node: true */
/*global $l */
'use strict';

import ui from './laroux.ui.js';

let laroux = $l,
	css = laroux.css,
    dom = laroux.dom,
    helpers = laroux,
    timers = laroux.timers;

let popup = {
    defaultTimeout: 500,

    createBox: function (id, xclass, message) {
        return dom.createElement('DIV', { id: id, 'class': xclass },
            message
        );
    },

    msgbox: function (timeout, message) {
        var id = helpers.getUniqueId();
        var obj = popup.createBox(id, 'laroux-msgbox', message);
        ui.floatContainer.appendChild(obj);

        css.setProperty(obj, { opacity: 1 });

        timers.set({
            timeout: timeout,
            reset: false,
            ontick: function (x) {
                // css.setProperty(x, {opacity: 0});
                dom.remove(x);
            },
            state: obj
        });
    },

    init: function () {
        ui.popupFunc = function (message) {
            popup.msgbox(popup.defaultTimeout, message);
        };
    }
};

export default popup;
