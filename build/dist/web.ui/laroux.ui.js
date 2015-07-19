/**
 * laroux.js - A jquery substitute for modern browsers (web.ui bundle)
 *
 * @version v2.2.0
 * @link https://larukedi.github.io/laroux.js
 * @license Apache-2.0
 */
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

var laroux = $l,
    dom = laroux.dom,
    helpers = laroux;

var ui = {
    popup: _larouxUiPopupJs2['default'],

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
},{"./laroux.ui.popup.js":2}],2:[function(require,module,exports){
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
        var id = helpers.getUniqueId();
        var obj = popup.createBox(id, 'laroux-msgbox', message);
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

exports['default'] = popup;
module.exports = exports['default'];
},{"./laroux.ui.js":1}]},{},[1]);
