/*jslint node: true */
/*global $l */
'use strict';

import web_ui from './laroux.web.ui.js';

let web_ui_popup = {
    defaultTimeout: 500,

    createBox: function (id, xclass, message) {
        return $l.web.dom.createElement('DIV', { id: id, 'class': xclass },
            message
        );
    },

    msgbox: function (timeout, message) {
        let id = $l.getUniqueId(),
            obj = web_ui_popup.createBox(id, 'laroux-msgbox laroux-fade', message);

        web_ui.floatContainer.appendChild(obj);

        $l.web.css.setProperty(obj, { opacity: 1 });

        $l.timers.set({
            timeout: timeout,
            reset: false,
            ontick: function (x) {
                // $l.web.css.setProperty(x, {opacity: 0});
                $l.web.dom.remove(x);
            },
            state: obj
        });
    },

    init: function () {
        web_ui.popupFunc = function (message) {
            web_ui_popup.msgbox(web_ui_popup.defaultTimeout, message);
        };
    }
};

$l.ready(web_ui_popup.init);

export default web_ui_popup;
