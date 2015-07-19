/**
 * laroux.js - A jquery substitute for modern browsers (web.ui bundle)
 *
 * @version v2.2.0
 * @link https://larukedi.github.io/laroux.js
 * @license Apache-2.0
 */
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*jslint node: true */
/*global $l, localStorage */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _larouxUiJs = require('./laroux.ui.js');

var _larouxUiJs2 = _interopRequireDefault(_larouxUiJs);

var laroux = $l,
    css = laroux.css,
    dom = laroux.dom,
    intl = laroux.intl,
    timers = laroux.timers;

var dynamicDates = {
    updateDatesElements: null,

    updateDates: function updateDates() {
        if (dynamicDates.updateDatesElements === null) {
            dynamicDates.updateDatesElements = dom.select('*[data-epoch]');
        }

        for (var item in dynamicDates.updateDatesElements) {
            if (!dynamicDates.updateDatesElements.hasOwnProperty(item)) {
                continue;
            }

            var obj = dynamicDates.updateDatesElements[item];
            // bitshifting (str >> 0) used instead of parseInt(str, 10)
            var date = new Date((obj.getAttribute('data-epoch') >> 0) * 1000);

            dom.replace(obj, intl.shortDate(date));

            obj.setAttribute('title', intl.longDate(date));
        }
    },

    init: function init() {
        timers.set({
            timeout: 500,
            reset: true,
            ontick: dynamicDates.updateDates
        });
    }
};

laroux.ready(dynamicDates.init);

exports['default'] = dynamicDates;
module.exports = exports['default'];
},{"./laroux.ui.js":2}],2:[function(require,module,exports){
(function (global){
/*jslint node: true */
/*global $l, alert, document */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _larouxUiPopupJs = require('./laroux.ui.popup.js');

var _larouxUiPopupJs2 = _interopRequireDefault(_larouxUiPopupJs);

var _larouxUiLoadingJs = require('./laroux.ui.loading.js');

var _larouxUiLoadingJs2 = _interopRequireDefault(_larouxUiLoadingJs);

var _larouxUiDynamicDatesJs = require('./laroux.ui.dynamicDates.js');

var _larouxUiDynamicDatesJs2 = _interopRequireDefault(_larouxUiDynamicDatesJs);

var _larouxUiScrollViewJs = require('./laroux.ui.scrollView.js');

var _larouxUiScrollViewJs2 = _interopRequireDefault(_larouxUiScrollViewJs);

var laroux = $l,
    dom = laroux.dom,
    helpers = laroux;

var ui = {
    popup: _larouxUiPopupJs2['default'],
    loading: _larouxUiLoadingJs2['default'],
    dynamicDates: _larouxUiDynamicDatesJs2['default'],
    scrollView: _larouxUiScrollViewJs2['default'],

    floatContainer: null,
    popupFunc: helpers.bindContext(alert, global),

    createFloatContainer: function createFloatContainer() {
        if (!ui.floatContainer) {
            ui.floatContainer = dom.createElement('DIV', { id: 'laroux-floatdiv', 'class': 'laroux-floatdiv' });
            document.body.insertBefore(ui.floatContainer, document.body.firstChild);
        }
    }
};

laroux.extend({
    ui: ui
});

laroux.ready(ui.createFloatContainer);

exports['default'] = ui;
module.exports = exports['default'];
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./laroux.ui.dynamicDates.js":1,"./laroux.ui.loading.js":3,"./laroux.ui.popup.js":4,"./laroux.ui.scrollView.js":5}],3:[function(require,module,exports){
(function (global){
/*jslint node: true */
/*global $l, localStorage */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _larouxUiJs = require('./laroux.ui.js');

var _larouxUiJs2 = _interopRequireDefault(_larouxUiJs);

var laroux = $l,
    css = laroux.css,
    dom = laroux.dom;

var loading = {
    elementSelector: null,
    element: null,
    defaultDelay: 1500,
    timer: null,

    killTimer: function killTimer() {
        clearTimeout(loading.timer);
    },

    hide: function hide() {
        loading.killTimer();

        css.setProperty(loading.element, { display: 'none' });
        localStorage.loadingIndicator = 'false';
    },

    show: function show(delay) {
        loading.killTimer();

        if (delay === undefined) {
            delay = loading.defaultDelay;
        }

        if (delay > 0) {
            setTimeout(function () {
                loading.show(0);
            }, delay);
        } else {
            css.setProperty(loading.element, { display: 'block' });
            localStorage.loadingIndicator = 'true';
        }
    },

    init: function init() {
        if (loading.element === null && loading.elementSelector !== null) {
            loading.element = dom.selectSingle(loading.elementSelector);
        }

        if (loading.element !== null) {
            dom.setEvent(global, 'load', loading.hide);
            dom.setEvent(global, 'beforeunload', loading.show);

            if (localStorage.loadingIndicator !== undefined && localStorage.loadingIndicator == 'true') {
                loading.show(0);
            } else {
                loading.show();
            }
        }
    }
};

laroux.ready(loading.init);

exports['default'] = loading;
module.exports = exports['default'];
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./laroux.ui.js":2}],4:[function(require,module,exports){
/*jslint node: true */
/*global $l */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _larouxUiJs = require('./laroux.ui.js');

var _larouxUiJs2 = _interopRequireDefault(_larouxUiJs);

var laroux = $l,
    css = laroux.css,
    dom = laroux.dom,
    helpers = laroux,
    timers = laroux.timers;

var popup = {
    defaultTimeout: 500,

    createBox: function createBox(id, xclass, message) {
        return dom.createElement('DIV', { id: id, 'class': xclass }, message);
    },

    msgbox: function msgbox(timeout, message) {
        var id = helpers.getUniqueId(),
            obj = popup.createBox(id, 'laroux-msgbox laroux-fade', message);

        _larouxUiJs2['default'].floatContainer.appendChild(obj);

        css.setProperty(obj, { opacity: 1 });

        timers.set({
            timeout: timeout,
            reset: false,
            ontick: function ontick(x) {
                // css.setProperty(x, {opacity: 0});
                dom.remove(x);
            },
            state: obj
        });
    },

    init: function init() {
        _larouxUiJs2['default'].popupFunc = function (message) {
            popup.msgbox(popup.defaultTimeout, message);
        };
    }
};

laroux.ready(popup.init);

exports['default'] = popup;
module.exports = exports['default'];
},{"./laroux.ui.js":2}],5:[function(require,module,exports){
(function (global){
/*jslint node: true */
/*global $l, localStorage */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _larouxUiJs = require('./laroux.ui.js');

var _larouxUiJs2 = _interopRequireDefault(_larouxUiJs);

var laroux = $l,
    css = laroux.css,
    dom = laroux.dom,
    helpers = laroux,
    intl = laroux.intl,
    timers = laroux.timers;

var scrollView = {
    selectedElements: [],

    onhidden: function onhidden(elements) {
        css.setProperty(elements, { opacity: 0 });
        css.setTransition(elements, ['opacity']);
    },

    onreveal: function onreveal(elements) {
        css.setProperty(elements, { opacity: 1 });
    },

    set: function set(element) {
        var elements = helpers.getAsArray(element);

        for (var i = 0, length = elements.length; i < length; i++) {
            if (!css.inViewport(elements[i])) {
                scrollView.selectedElements.push(elements[i]);
            }
        }

        scrollView.onhidden(scrollView.selectedElements);
        dom.setEvent(global, 'scroll', scrollView.reveal);
    },

    reveal: function reveal() {
        var removeKeys = [],
            elements = [];

        helpers.each(scrollView.selectedElements, function (i, element) {
            if (css.inViewport(element)) {
                removeKeys.unshift(i);
                elements.push(element);
            }
        });

        for (var item in removeKeys) {
            if (!removeKeys.hasOwnProperty(item)) {
                continue;
            }

            scrollView.selectedElements.splice(removeKeys[item], 1);
        }

        if (scrollView.selectedElements.length === 0) {
            dom.unsetEvent(global, 'scroll', scrollView.reveal);
        }

        if (elements.length > 0) {
            scrollView.onreveal(elements);
        }
    }
};

// laroux.ready(scrollView.init);

exports['default'] = scrollView;
module.exports = exports['default'];
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./laroux.ui.js":2}]},{},[2]);
