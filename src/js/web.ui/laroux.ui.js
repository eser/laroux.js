/*jslint node: true */
/*global $l, alert, document */
'use strict';

import ui_popup from './laroux.ui.popup.js';

let laroux = $l,
    dom = laroux.dom,
    helpers = laroux;

let ui = {
    popup: ui_popup,

    floatContainer: null,
    popupFunc: helpers.bindContext(alert, global),

    createFloatContainer: function () {
        if (!ui.floatContainer) {
            ui.floatContainer = dom.createElement('DIV', { id: 'laroux-floatdiv', 'class': 'laroux-floatdiv' });
            document.body.insertBefore(ui.floatContainer, document.body.firstChild);
        }
    }
};

laroux.extend({
    ui
});

laroux.ready(ui.createFloatContainer);

export default ui;
