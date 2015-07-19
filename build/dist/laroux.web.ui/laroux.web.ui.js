/**
 * laroux.js - A jquery substitute for modern browsers (laroux.web.ui bundle)
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
var web_ui_dynamicDates = {
    updateDatesElements: null,

    updateDates: function updateDates() {
        if (web_ui_dynamicDates.updateDatesElements === null) {
            web_ui_dynamicDates.updateDatesElements = $l.dom.select('*[data-epoch]');
        }

        for (var item in web_ui_dynamicDates.updateDatesElements) {
            if (!web_ui_dynamicDates.updateDatesElements.hasOwnProperty(item)) {
                continue;
            }

            var obj = web_ui_dynamicDates.updateDatesElements[item];
            // bitshifting (str >> 0) used instead of parseInt(str, 10)
            var date = new Date((obj.getAttribute('data-epoch') >> 0) * 1000);

            $l.dom.replace(obj, $l.intl.shortDate(date));

            obj.setAttribute('title', $l.intl.longDate(date));
        }
    },

    init: function init() {
        $l.timers.set({
            timeout: 500,
            reset: true,
            ontick: web_ui_dynamicDates.updateDates
        });
    }
};

$l.ready(web_ui_dynamicDates.init);

exports['default'] = web_ui_dynamicDates;
module.exports = exports['default'];
},{}],2:[function(require,module,exports){
(function (global){
/*jslint node: true */
/*global $l, alert, document */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _larouxWebUiPopupJs = require('./laroux.web.ui.popup.js');

var _larouxWebUiPopupJs2 = _interopRequireDefault(_larouxWebUiPopupJs);

var _larouxWebUiLoadingJs = require('./laroux.web.ui.loading.js');

var _larouxWebUiLoadingJs2 = _interopRequireDefault(_larouxWebUiLoadingJs);

var _larouxWebUiDynamicDatesJs = require('./laroux.web.ui.dynamicDates.js');

var _larouxWebUiDynamicDatesJs2 = _interopRequireDefault(_larouxWebUiDynamicDatesJs);

var _larouxWebUiScrollViewJs = require('./laroux.web.ui.scrollView.js');

var _larouxWebUiScrollViewJs2 = _interopRequireDefault(_larouxWebUiScrollViewJs);

var web_ui = {
    popup: _larouxWebUiPopupJs2['default'],
    loading: _larouxWebUiLoadingJs2['default'],
    dynamicDates: _larouxWebUiDynamicDatesJs2['default'],
    scrollView: _larouxWebUiScrollViewJs2['default'],

    floatContainer: null,
    popupFunc: $l.bindContext(alert, global),

    createFloatContainer: function createFloatContainer() {
        if (!web_ui.floatContainer) {
            web_ui.floatContainer = $l.dom.createElement('DIV', { id: 'laroux-floatdiv', 'class': 'laroux-floatdiv' });
            document.body.insertBefore(web_ui.floatContainer, document.body.firstChild);
        }
    }
};

$l.ready(web_ui.createFloatContainer);

$l.extendNs('web.ui', web_ui);

exports['default'] = web_ui;
module.exports = exports['default'];
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./laroux.web.ui.dynamicDates.js":1,"./laroux.web.ui.loading.js":3,"./laroux.web.ui.popup.js":4,"./laroux.web.ui.scrollView.js":5}],3:[function(require,module,exports){
(function (global){
/*jslint node: true */
/*global $l, localStorage */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
var web_ui_loading = {
    elementSelector: null,
    element: null,
    defaultDelay: 1500,
    timer: null,

    killTimer: function killTimer() {
        clearTimeout(web_ui_loading.timer);
    },

    hide: function hide() {
        web_ui_loading.killTimer();

        $l.css.setProperty(web_ui_loading.element, { display: 'none' });
        localStorage.loadingIndicator = 'false';
    },

    show: function show(delay) {
        web_ui_loading.killTimer();

        if (delay === undefined) {
            delay = web_ui_loading.defaultDelay;
        }

        if (delay > 0) {
            setTimeout(function () {
                web_ui_loading.show(0);
            }, delay);
        } else {
            $l.css.setProperty(web_ui_loading.element, { display: 'block' });
            localStorage.loadingIndicator = 'true';
        }
    },

    init: function init() {
        if (web_ui_loading.element === null && web_ui_loading.elementSelector !== null) {
            web_ui_loading.element = $l.dom.selectSingle(web_ui_loading.elementSelector);
        }

        if (web_ui_loading.element !== null) {
            $l.dom.setEvent(global, 'load', web_ui_loading.hide);
            $l.dom.setEvent(global, 'beforeunload', web_ui_loading.show);

            if (localStorage.loadingIndicator !== undefined && localStorage.loadingIndicator == 'true') {
                web_ui_loading.show(0);
            } else {
                web_ui_loading.show();
            }
        }
    }
};

$l.ready(web_ui_loading.init);

exports['default'] = web_ui_loading;
module.exports = exports['default'];
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],4:[function(require,module,exports){
/*jslint node: true */
/*global $l */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _larouxWebUiJs = require('./laroux.web.ui.js');

var _larouxWebUiJs2 = _interopRequireDefault(_larouxWebUiJs);

var web_ui_popup = {
    defaultTimeout: 500,

    createBox: function createBox(id, xclass, message) {
        return $l.dom.createElement('DIV', { id: id, 'class': xclass }, message);
    },

    msgbox: function msgbox(timeout, message) {
        var id = $l.getUniqueId(),
            obj = web_ui_popup.createBox(id, 'laroux-msgbox laroux-fade', message);

        _larouxWebUiJs2['default'].floatContainer.appendChild(obj);

        $l.css.setProperty(obj, { opacity: 1 });

        $l.timers.set({
            timeout: timeout,
            reset: false,
            ontick: function ontick(x) {
                // $l.css.setProperty(x, {opacity: 0});
                $l.dom.remove(x);
            },
            state: obj
        });
    },

    init: function init() {
        _larouxWebUiJs2['default'].popupFunc = function (message) {
            web_ui_popup.msgbox(web_ui_popup.defaultTimeout, message);
        };
    }
};

$l.ready(web_ui_popup.init);

exports['default'] = web_ui_popup;
module.exports = exports['default'];
},{"./laroux.web.ui.js":2}],5:[function(require,module,exports){
(function (global){
/*jslint node: true */
/*global $l, localStorage */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
var web_ui_scrollView = {
    selectedElements: [],

    onhidden: function onhidden(elements) {
        $l.css.setProperty(elements, { opacity: 0 });
        $l.css.setTransition(elements, ['opacity']);
    },

    onreveal: function onreveal(elements) {
        $l.css.setProperty(elements, { opacity: 1 });
    },

    set: function set(element) {
        var elements = $l.getAsArray(element);

        for (var i = 0, _length = elements.length; i < _length; i++) {
            if (!$l.css.inViewport(elements[i])) {
                web_ui_scrollView.selectedElements.push(elements[i]);
            }
        }

        web_ui_scrollView.onhidden(web_ui_scrollView.selectedElements);
        $l.dom.setEvent(global, 'scroll', web_ui_scrollView.reveal);
    },

    reveal: function reveal() {
        var removeKeys = [],
            elements = [];

        $l.each(web_ui_scrollView.selectedElements, function (i, element) {
            if ($l.css.inViewport(element)) {
                removeKeys.unshift(i);
                elements.push(element);
            }
        });

        for (var item in removeKeys) {
            if (!removeKeys.hasOwnProperty(item)) {
                continue;
            }

            web_ui_scrollView.selectedElements.splice(removeKeys[item], 1);
        }

        if (web_ui_scrollView.selectedElements.length === 0) {
            $l.dom.unsetEvent(global, 'scroll', web_ui_scrollView.reveal);
        }

        if (elements.length > 0) {
            web_ui_scrollView.onreveal(elements);
        }
    }
};

// $l.ready(web_ui_scrollView.init);

exports['default'] = web_ui_scrollView;
module.exports = exports['default'];
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[2]);
