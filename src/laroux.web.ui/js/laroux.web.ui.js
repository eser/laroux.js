/*jslint node: true */
/*global $l, alert, document */
'use strict';

import web_ui_popup from './laroux.web.ui.popup.js';
import web_ui_loading from './laroux.web.ui.loading.js';
import web_ui_dynamicDates from './laroux.web.ui.dynamicDates.js';
import web_ui_scrollView from './laroux.web.ui.scrollView.js';

let web_ui = {
    popup: web_ui_popup,
    loading: web_ui_loading,
    dynamicDates: web_ui_dynamicDates,
    scrollView: web_ui_scrollView,

    floatContainer: null,
    popupFunc: $l.bindContext(alert, global),

    createFloatContainer: function () {
        if (!web_ui.floatContainer) {
            web_ui.floatContainer = $l.web.dom.createElement('DIV', { id: 'laroux-floatdiv', 'class': 'laroux-floatdiv' });
            document.body.insertBefore(web_ui.floatContainer, document.body.firstChild);
        }
    }
};

$l.ready(web_ui.createFloatContainer);

$l.extendNs('web.ui', web_ui);

export default web_ui;
