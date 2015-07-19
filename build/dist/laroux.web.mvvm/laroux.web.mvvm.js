/**
 * laroux.js - A jquery substitute for modern browsers (laroux.web.mvvm bundle)
 *
 * @version v2.2.0
 * @link https://larukedi.github.io/laroux.js
 * @license Apache-2.0
 */
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*jslint node: true */
/*global $l */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
var web_mvvm = {
    apps: {},
    pauseUpdate: false,

    init: function init(element, model) {
        if (element.constructor === String) {
            element = $l.dom.selectById(element);
        }

        // if (model.constructor !== types.Observable) {
        //     model = new types.Observable(model);
        // }

        var appKey = element.getAttribute('id');

        model.on(function (event) {
            if (!web_mvvm.pauseUpdate) {
                web_mvvm.update(appKey); // , [event.key]
            }
        });

        web_mvvm.apps[appKey] = {
            element: element,
            model: model // ,
            // modelKeys: null,
            // boundElements: null,
            // eventElements: null
        };

        web_mvvm.rebind(appKey);
    },

    rebind: function rebind(appKey) {
        var app = web_mvvm.apps[appKey];
        /*jslint nomen: true */
        app.modelKeys = $l.getKeysRecursive(app.model); // FIXME: works only for $l.types.Observable
        app.boundElements = {};
        app.eventElements = [];

        web_mvvm.scanElements(app, app.element);
        web_mvvm.update(appKey);

        var callback = function callback(ev, elem) {
            var binding = web_mvvm.bindStringParser(elem.getAttribute('lr-event'));
            // web_mvvm.pauseUpdate = true;
            for (var item in binding) {
                if (item === null || !binding.hasOwnProperty(item)) {
                    continue;
                }

                if (binding[item].charAt(0) === '\'') {
                    app.model[item] = binding[item].substring(1, binding[item].length - 1);
                } else if (binding[item].substring(0, 5) === 'attr.') {
                    app.model[item] = elem.getAttribute(binding[item].substring(5));
                } else if (binding[item].substring(0, 5) === 'prop.') {
                    app.model[item] = elem[binding[item].substring(5)];
                }
            }
            // web_mvvm.pauseUpdate = false;
        };

        for (var i = 0, _length = app.eventElements.length; i < _length; i++) {
            $l.dom.setEvent(app.eventElements[i].element, app.eventElements[i].binding[null], callback);
        }
    },

    scanElements: function scanElements(app, element) {
        for (var i = 0, atts = element.attributes, m = atts.length; i < m; i++) {
            if (atts[i].name === 'lr-bind') {
                var binding1 = web_mvvm.bindStringParser(atts[i].value);

                for (var item in binding1) {
                    if (!binding1.hasOwnProperty(item)) {
                        continue;
                    }

                    if (app.boundElements[binding1[item]] === undefined) {
                        app.boundElements[binding1[item]] = [];
                    }

                    app.boundElements[binding1[item]].push({
                        element: element,
                        target: item
                    });
                }
            } else if (atts[i].name === 'lr-event') {
                var binding2 = web_mvvm.bindStringParser(atts[i].value);

                app.eventElements.push({
                    element: element,
                    binding: binding2
                });
            }
        }

        for (var j = 0, chldrn = element.childNodes, n = chldrn.length; j < n; j++) {
            if (chldrn[j].nodeType === 1) {
                web_mvvm.scanElements(app, chldrn[j]);
            }
        }
    },

    update: function update(appKey, keys) {
        var app = web_mvvm.apps[appKey];

        if (typeof keys === 'undefined') {
            keys = app.modelKeys;
        }

        for (var i = 0, length1 = keys.length; i < length1; i++) {
            if (!(keys[i] in app.boundElements)) {
                continue;
            }

            var boundElement = app.boundElements[keys[i]],
                value = $l.getElement(app.model, keys[i]);

            if (value instanceof Function) {
                value = value.call(app.model);
            }

            for (var j = 0, length2 = boundElement.length; j < length2; j++) {
                if (boundElement[j].target.substring(0, 6) === 'style.') {
                    boundElement[j].element.style[boundElement[j].target.substring(6)] = value;
                } else if (boundElement[j].target.substring(0, 5) === 'attr.') {
                    // FIXME removeAttribute on null value?
                    boundElement[j].element.setAttribute(boundElement[j].target.substring(5), value);
                } else if (boundElement[j].target.substring(0, 5) === 'prop.') {
                    // FIXME removeAttribute on null value?
                    boundElement[j].element[boundElement[j].target.substring(5)] = value;
                }
            }
        }
    },

    bindStringParser: function bindStringParser(text) {
        var lastBuffer = null,
            buffer = '',
            state = 0,
            result = {};

        for (var i = 0, _length2 = text.length; i < _length2; i++) {
            var curr = text.charAt(i);

            if (state === 0) {
                if (curr === ':') {
                    state = 1;
                    lastBuffer = buffer.trim();
                    buffer = '';
                    continue;
                }
            }

            if (curr === ',') {
                state = 0;
                result[lastBuffer] = buffer.trim();
                buffer = '';
                continue;
            }

            buffer += curr;
        }

        if (buffer.length > 0) {
            result[lastBuffer] = buffer.trim();
        }

        return result;
    }
};

$l.extendNs('web.mvvm', web_mvvm);

exports['default'] = web_mvvm;
module.exports = exports['default'];
},{}]},{},[1]);
