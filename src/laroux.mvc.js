(function(laroux) {
    'use strict';

    // requires $l.dom
    // requires $l.helpers

    // mvc
    laroux.mvc = {
        apps: {},

        init: function(element, model) {
            var appKey = element.getAttribute('id');

            model.onupdate = function(event) {
                laroux.mvc.update(appKey, [event.key]);
            };

            laroux.mvc.apps[appKey] = {
                element: element,
                model: model // ,
                // modelKeys: null,
                // boundElements: null,
                // eventElements: null
            };

            laroux.mvc.rebind(appKey);
        },

        rebind: function(appKey) {
            var app = laroux.mvc.apps[appKey];
            app.modelKeys = laroux.helpers.getKeysRecursive(app.model._data); // FIXME: works only for $l.stack
            app.boundElements = [];
            app.eventElements = [];

            laroux.mvc.scanElements(app, app.element);
            laroux.mvc.update(appKey);
            // TODO: bind events for eventElements
        },

        scanElements: function(app, element) {
            for (var i = 0, atts = element.attributes, m = atts.length; i < m; i++) {
                if (atts[i].name == 'lr-bind') {
                    var binding = laroux.mvc.bindStringParser(atts[i].value);

                    for (var item in binding) {
                        if (!binding.hasOwnProperty(item)) {
                            continue;
                        }

                        if (app.boundElements[binding[item]] === undefined) {
                            app.boundElements[binding[item]] = [];
                        }

                        app.boundElements[binding[item]].push({
                            element: element,
                            target: item
                        });
                    }
                } else if (atts[i].name == 'lr-event') {
                    app.eventElements.push({
                        element: element,
                        event: atts[i].value
                    });
                }
            }

            for (var j = 0, chldrn = element.childNodes, n = chldrn.length; j < n; j++) {
                if (chldrn[j].nodeType === 1) {
                    laroux.mvc.scanElements(app, chldrn[j]);
                }
            }
        },

        update: function(appKey, keys) {
            var app = laroux.mvc.apps[appKey];

            if (typeof keys == 'undefined') {
                keys = app.modelKeys;
            }

            for (var i = 0, length1 = keys.length; i < length1; i++) {
                if (!(keys[i] in app.boundElements)) {
                    continue;
                }

                var boundElement = app.boundElements[keys[i]];

                for (var j = 0, length2 = boundElement.length; j < length2; j++) {
                    switch (boundElement[j].target) {
                        case 'content':
                            boundElement[j].element.textContent = laroux.helpers.getElement(app.model, keys[i]);
                            break;
                    }
                }
            }

/*
            if (app.cachedNodes === null) {
                for (var i1 in app.boundElements) {
                    if (!app.boundElements.hasOwnProperty(i1)) {
                        continue;
                    }

                    var item1 = app.boundElements[i1];

                    laroux.dom.unsetEvent(
                        item1.element,
                        laroux.mvc.getRelatedEventName(item1.element),
                        laroux.mvc.onBoundFieldChange
                    );
                    item1.element.removeAttribute('lr-app-id');
                    item1.element.removeAttribute('lr-bind-id');
                }

                app.cachedNodes = [];
                app.boundElements = [];
                laroux.mvc.scanElements(app, app.element);

                for (var i2 in app.boundElements) {
                    if (!app.boundElements.hasOwnProperty(i2)) {
                        continue;
                    }

                    var item2 = app.boundElements[i2];
                    var value = laroux.mvc.getRelatedValue(item2.element, true);
                    if (value !== null) {
                        app.model[item2.key] = value;
                    }

                    laroux.dom.setEvent(
                        item2.element,
                        laroux.mvc.getRelatedEventName(item2.element),
                        laroux.mvc.onBoundFieldChange
                    );
                    item2.element.setAttribute('lr-app-id', appKey);
                    item2.element.setAttribute('lr-bind-id', i2);
                }
            }

            for (var i3 in app.cachedNodes) {
                if (!app.cachedNodes.hasOwnProperty(i3)) {
                    continue;
                }

                var item3 = app.cachedNodes[i3];

                if (keys !== undefined && laroux.aindex(keys, item3.key) === -1) {
                    continue;
                }

                if (item3.node instanceof Attr) {
                    item3.node.value = item3.value;
                } else {
                    item3.node.textContent = item3.value;
                }
            }

            for (var i4 in app.cachedNodes) {
                if (!app.cachedNodes.hasOwnProperty(i4)) {
                    continue;
                }

                var item4 = app.cachedNodes[i4];

                if (keys !== undefined && laroux.aindex(keys, item4.key) === -1) {
                    continue;
                }

                var findStr = '{{' + item4.key + '}}';
                var objectValue = laroux.helpers.getElement(app.model, item4.key);

                if (item4.node instanceof Attr) {
                    item4.node.value = item4.node.value.replace(findStr, objectValue);
                } else {
                    item4.node.textContent = item4.node.textContent.replace(findStr, objectValue);
                }
            }

            for (var i5 in app.boundElements) {
                if (!app.boundElements.hasOwnProperty(i5)) {
                    continue;
                }

                var item5 = app.boundElements[i5];

                if (keys !== undefined && laroux.aindex(keys, item5.key) === -1) {
                    continue;
                }

                laroux.mvc.setRelatedValue(item5.element, app.model[item5.key]);
            }

            // Object.observe(app.model, laroux.mvc.observer);
*/
        },

        getRelatedEventName: function(element) {
            switch (element.tagName) {
                case 'INPUT':
                    switch (element.getAttribute('type').toUpperCase()) {
                        case 'BUTTON':
                        case 'SUBMIT':
                        case 'RESET':
                            return 'click';
                    }

                    // return 'change';
                    return 'keyup';

                case 'TEXTAREA':
                    // return 'change';
                    return 'keyup';

                case 'BUTTON':
                    return 'click';
            }

            return null;
        },

        getRelatedValue: function(element, initial) {
            switch (element.tagName) {
                case 'INPUT':
                    switch (element.getAttribute('type').toUpperCase()) {
                        case 'BUTTON':
                        case 'SUBMIT':
                        case 'RESET':
                            if (initial === true) {
                                return null;
                            }

                            return element.getAttribute('lr-value');

                        case 'CHECKBOX':
                        case 'RADIO':
                            return element.checked;
                    }

                    return element.value;

                case 'TEXTAREA':
                    return element.value;

                case 'BUTTON':
                    if (initial === true) {
                        return null;
                    }

                    return element.getAttribute('lr-value');
            }

            return null;
        },

        setRelatedValue: function(element, value) {
            switch (element.tagName) {
                case 'INPUT':
                    switch (element.getAttribute('type').toUpperCase()) {
                        case 'BUTTON':
                        case 'SUBMIT':
                        case 'RESET':
                            return;

                        case 'CHECKBOX':
                        case 'RADIO':
                            element.value = !!value;
                            return;
                    }

                    element.value = value;
                    return;

                case 'TEXTAREA':
                    element.value = value;
                    return;
            }
        },

        onBoundFieldChange: function(event, element) {
            var appId = element.getAttribute('lr-app-id');
            var bindId = element.getAttribute('lr-bind-id');

            var selectedApp = laroux.mvc.apps[appId];
            var selectedBind = selectedApp.boundElements[bindId];

            // Object.unobserve(selectedApp.model, laroux.mvc.observer);
            selectedApp.model[selectedBind.key] = laroux.mvc.getRelatedValue(element);
            // Object.observe(selectedApp.model, laroux.mvc.observer);
        },

        bindStringParser: function(text) {
            var lastBuffer = null,
                buffer = '',
                state = 0,
                result = {};

            for (var i = 0, length = text.length; i < length; i++) {
                var curr = text.charAt(i);

                if (state === 0) {
                    if (curr == ':') {
                        state = 1;
                        lastBuffer = buffer.trim();
                        buffer = '';
                        continue;
                    }
                }

                if (curr == ',') {
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

})(this.laroux);
