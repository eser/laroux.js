/*jslint node: true */
/*global $l */
'use strict';

let web_mvvm = {
    apps: {},
    pauseUpdate: false,

    init: function (element, model) {
        if (element.constructor === String) {
            element = $l.dom.selectById(element);
        }

        // if (model.constructor !== types.Observable) {
        //     model = new types.Observable(model);
        // }

        let appKey = element.getAttribute('id');

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

    rebind: function (appKey) {
        let app = web_mvvm.apps[appKey];
        /*jslint nomen: true */
        app.modelKeys = $l.getKeysRecursive(app.model); // FIXME: works only for $l.types.Observable
        app.boundElements = {};
        app.eventElements = [];

        web_mvvm.scanElements(app, app.element);
        web_mvvm.update(appKey);

        let callback = function (ev, elem) {
            let binding = web_mvvm.bindStringParser(elem.getAttribute('lr-event'));
            // web_mvvm.pauseUpdate = true;
            for (let item in binding) {
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

        for (let i = 0, length = app.eventElements.length; i < length; i++) {
            $l.dom.setEvent(
                app.eventElements[i].element,
                app.eventElements[i].binding[null],
                callback
            );
        }
    },

    scanElements: function (app, element) {
        for (let i = 0, atts = element.attributes, m = atts.length; i < m; i++) {
            if (atts[i].name === 'lr-bind') {
                let binding1 = web_mvvm.bindStringParser(atts[i].value);

                for (let item in binding1) {
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
                let binding2 = web_mvvm.bindStringParser(atts[i].value);

                app.eventElements.push({
                    element: element,
                    binding: binding2
                });
            }
        }

        for (let j = 0, chldrn = element.childNodes, n = chldrn.length; j < n; j++) {
            if (chldrn[j].nodeType === 1) {
                web_mvvm.scanElements(app, chldrn[j]);
            }
        }
    },

    update: function (appKey, keys) {
        let app = web_mvvm.apps[appKey];

        if (typeof keys === 'undefined') {
            keys = app.modelKeys;
        }

        for (let i = 0, length1 = keys.length; i < length1; i++) {
            if (!(keys[i] in app.boundElements)) {
                continue;
            }

            let boundElement = app.boundElements[keys[i]],
                value = $l.getElement(app.model, keys[i]);

            if (value instanceof Function) {
                value = value.call(app.model);
            }

            for (let j = 0, length2 = boundElement.length; j < length2; j++) {
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

    bindStringParser: function (text) {
        let lastBuffer = null,
            buffer = '',
            state = 0,
            result = {};

        for (let i = 0, length = text.length; i < length; i++) {
            let curr = text.charAt(i);

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

export default web_mvvm;
