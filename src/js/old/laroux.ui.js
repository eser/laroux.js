(function () {
    'use strict';

    // ui
    laroux.ns('laroux.ui', {
        floatContainer: null,

        createFloatContainer: function () {
            if (!laroux.ui.floatContainer) {
                laroux.ui.floatContainer = laroux.dom.createElement('DIV', { 'class': 'larouxFloatDiv' });
                document.body.insertBefore(laroux.ui.floatContainer, document.body.firstChild);
            }
        },

        init: function () {
            laroux.ui.createFloatContainer();
            laroux.ui.loading.init();
            laroux.ui.dynamicDates.init();
        }
    });

    // laroux.ready(laroux.ui.init);

}).call(this);
