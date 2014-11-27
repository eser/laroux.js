(function(laroux) {
    'use strict';

    // requires $l.dom
    // requires $l.helpers

    // mvc
    laroux.mvc = {
        appObjects: [],

        init: function() {
            var apps = laroux.dom.select('*[lr-app]');

            for (var i = 0, length = apps.length; i < length; i++) {
                laroux.mvc.appObjects.push({
                    app: apps[i].getAttribute('lr-app'),
                    element: apps[i],
                    model: {},
                    cachedNodes: null,
                    boundElements: null
                });
            }
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

            var selectedApp = laroux.mvc.appObjects[appId];
            var selectedBind = selectedApp.boundElements[bindId];

            // Object.unobserve(selectedApp.model, laroux.mvc.observer);
            selectedApp.model[selectedBind.key] = laroux.mvc.getRelatedValue(element);
            // Object.observe(selectedApp.model, laroux.mvc.observer);
        },

        scanElements: function(element, keys, appObject) {
            for (var i = 0, atts = element.attributes, m = atts.length; i < m; i++) {
                if (atts[i].name == 'lr-bind') {
                    var boundElement = {
                        element: element,
                        key: atts[i].value
                    };

                    appObject.boundElements.push(boundElement);
                }

                for (var item1 in keys) {
                    if (!keys.hasOwnProperty(item1)) {
                        continue;
                    }

                    var findStr1 = '{{' + keys[item1] + '}}';

                    if (atts[i].value.indexOf(findStr1) !== -1) {
                        appObject.cachedNodes.push({node: atts[i], key: keys[item1], value: atts[i].value});
                    }
                }
            }

            for (var j = 0, chldrn = element.childNodes, n = chldrn.length; j < n; j++) {
                for (var item2 in keys) {
                    if (!keys.hasOwnProperty(item2)) {
                        continue;
                    }

                    var findStr2 = '{{' + keys[item2] + '}}';

                    if (chldrn[j].nodeType === 3) {
                        if (chldrn[j].textContent.indexOf(findStr2) !== -1) {
                            appObject.cachedNodes.push({node: chldrn[j], key: keys[item2], value: chldrn[j].textContent});
                        }
                        continue;
                    }
                }

                if (chldrn[j].nodeType === 1) {
                    laroux.mvc.scanElements(chldrn[j], keys, appObject);
                }
            }
        },

        update: function() {
            for (var i = 0, length = laroux.mvc.appObjects.length; i < length; i++) {
                laroux.mvc.updateApp(i);
            }
        },

        updateApp: function(appObjectKey, keys) {
            var appObject = laroux.mvc.appObjects[appObjectKey];

            // Object.unobserve(appObject.model, laroux.mvc.observer);

            if (appObject.controller !== undefined) {
                appObject.controller(appObject.model);
            }

            if (appObject.cachedNodes === null) {
                for (var i1 in appObject.boundElements) {
                    if (!appObject.boundElements.hasOwnProperty(i1)) {
                        continue;
                    }

                    var item1 = appObject.boundElements[i1];

                    laroux.dom.unsetEvent(
                        item1.element,
                        laroux.mvc.getRelatedEventName(item1.element),
                        laroux.mvc.onBoundFieldChange
                    );
                    item1.element.removeAttribute('lr-app-id');
                    item1.element.removeAttribute('lr-bind-id');
                }

                appObject.cachedNodes = [];
                appObject.boundElements = [];
                var objectKeys = laroux.helpers.getKeysRecursive(appObject.model);
                laroux.mvc.scanElements(appObject.element, objectKeys, appObject);

                for (var i2 in appObject.boundElements) {
                    if (!appObject.boundElements.hasOwnProperty(i2)) {
                        continue;
                    }

                    var item2 = appObject.boundElements[i2];
                    var value = laroux.mvc.getRelatedValue(item2.element, true);
                    if (value !== null) {
                        appObject.model[item2.key] = value;
                    }

                    laroux.dom.setEvent(
                        item2.element,
                        laroux.mvc.getRelatedEventName(item2.element),
                        laroux.mvc.onBoundFieldChange
                    );
                    item2.element.setAttribute('lr-app-id', appObjectKey);
                    item2.element.setAttribute('lr-bind-id', i2);
                }
            }

            for (var i3 in appObject.cachedNodes) {
                if (!appObject.cachedNodes.hasOwnProperty(i3)) {
                    continue;
                }

                var item3 = appObject.cachedNodes[i3];

                if (keys !== undefined && keys.indexOf(item3.key) === -1) {
                    continue;
                }

                if (item3.node instanceof Attr) {
                    item3.node.value = item3.value;
                } else {
                    item3.node.textContent = item3.value;
                }
            }

            for (var i4 in appObject.cachedNodes) {
                if (!appObject.cachedNodes.hasOwnProperty(i4)) {
                    continue;
                }

                var item4 = appObject.cachedNodes[i4];

                if (keys !== undefined && keys.indexOf(item4.key) === -1) {
                    continue;
                }

                var findStr = '{{' + item4.key + '}}';
                var objectValue = laroux.helpers.getElement(appObject.model, item4.key);

                if (item4.node instanceof Attr) {
                    item4.node.value = item4.node.value.replace(findStr, objectValue);
                } else {
                    item4.node.textContent = item4.node.textContent.replace(findStr, objectValue);
                }
            }

            for (var i5 in appObject.boundElements) {
                if (!appObject.boundElements.hasOwnProperty(i5)) {
                    continue;
                }

                var item5 = appObject.boundElements[i5];

                if (keys !== undefined && keys.indexOf(item5.key) === -1) {
                    continue;
                }

                laroux.mvc.setRelatedValue(item5.element, appObject.model[item5.key]);
            }

            // Object.observe(appObject.model, laroux.mvc.observer);
        },

        observer: function(changes) {
            var updates = {};
            for (var change in changes) {
                if (!changes.hasOwnProperty(change)) {
                    continue;
                }

                if (changes[change].type == 'update') {
                    for (var i = 0, length = laroux.mvc.appObjects.length; i < length; i++) {
                        var selectedAppObject = laroux.mvc.appObjects[i];

                        if (selectedAppObject.model == changes[change].object) {
                            if (!(selectedAppObject.app in updates)) {
                                updates[selectedAppObject.app] = {appKey: i, app: selectedAppObject, keys: [changes[change].name]};
                            } else {
                                updates[selectedAppObject.app].keys.push(changes[change].name);
                            }
                        }
                    }
                }
            }

            for (var update in updates) {
                if (!updates.hasOwnProperty(update)) {
                    continue;
                }

                laroux.mvc.updateApp(updates[update].appKey, updates[update].keys);
            }
        },

        bind: function(app, model, controller) {
            if (controller === undefined) {
                controller = laroux.parent[app];
            }

            for (var i = 0, length = laroux.mvc.appObjects.length; i < length; i++) {
                var selectedAppObject = laroux.mvc.appObjects[i];

                if (selectedAppObject.app == app) {
                    selectedAppObject.model = model;
                    selectedAppObject.controller = controller;

                    laroux.mvc.updateApp(i);
                }
            }

            Object.observe(model, laroux.mvc.observer);
        }
    };

})(this.laroux);
