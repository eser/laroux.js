(function(laroux) {
    'use strict';

    // requires $l.dom
    // requires $l.helpers

    // mvc
    laroux.mvc = {
        appObjects: [],

        init: function() {
            var apps = laroux.dom.select('*[lr-app]');

            for (var app in apps) {
                laroux.mvc.appObjects.push({
                    app: apps[app].getAttribute('lr-app'),
                    element: apps[app],
                    model: {},
                    cachedNodes: null
                });
            }
        },

        scanElement: function(element, keys, nodes) {
            for (var i = 0, atts = element.attributes, m = atts.length; i < m; i++) {
                for (var item1 in keys) {
                    var findStr1 = '{{' + keys[item1] + '}}';

                    if (atts[i].value.indexOf(findStr1) !== -1) {
                        nodes.push({node: atts[i], key: keys[item1], value: atts[i].value});
                    }
                }
            }

            for (var j = 0, chldrn = element.childNodes, n = chldrn.length; j < n; j++) {
                for (var item2 in keys) {
                    var findStr2 = '{{' + keys[item2] + '}}';

                    if (chldrn[j].nodeType === 3) {
                        if (chldrn[j].textContent.indexOf(findStr2) !== -1) {
                            nodes.push({node: chldrn[j], key: keys[item2], value: chldrn[j].textContent});
                        }
                        continue;
                    }
                }

                if (chldrn[j].nodeType === 1) {
                    laroux.mvc.scanElement(chldrn[j], keys, nodes);
                }
            }
        },

        update: function() {
            for (var appObject in laroux.mvc.appObjects) {
                var selectedappObject = laroux.mvc.appObjects[appObject];
                laroux.mvc.updateApp(selectedappObject);
            }
        },

        updateApp: function(appObject, keys) {
            if (appObject.controller !== undefined) {
                appObject.controller(appObject.model);
            }

            if (appObject.cachedNodes === null) {
                appObject.cachedNodes = [];
                var objectKeys = laroux.helpers.getKeysRecursive(appObject.model);
                laroux.mvc.scanElement(appObject.element, objectKeys, appObject.cachedNodes);
            }

            for (var i1 in appObject.cachedNodes) {
                var item1 = appObject.cachedNodes[i1];

                if (keys !== undefined && keys.indexOf(item1.key) === -1) {
                    continue;
                }

                if (item1.node instanceof Attr) {
                    item1.node.value = item1.value;
                } else {
                    item1.node.textContent = item1.value;
                }
            }

            for (var i2 in appObject.cachedNodes) {
                var item2 = appObject.cachedNodes[i2];

                if (keys !== undefined && keys.indexOf(item2.key) === -1) {
                    continue;
                }

                var findStr = '{{' + item2.key + '}}';
                var objectValue = laroux.helpers.getElement(appObject.model, item2.key);

                if (item2.node instanceof Attr) {
                    item2.node.value = item2.node.value.replace(findStr, objectValue);
                } else {
                    item2.node.textContent = item2.node.textContent.replace(findStr, objectValue);
                }
            }
        },

        observer: function(changes) {
            var updates = {};
            for (var change in changes) {
                if (changes[change].type == 'update') {
                    for (var appObject in laroux.mvc.appObjects) {
                        var selectedAppObject = laroux.mvc.appObjects[appObject];

                        if (selectedAppObject.model == changes[change].object) {
                            if (!(selectedAppObject.app in updates)) {
                                updates[selectedAppObject.app] = {app: selectedAppObject, keys: [changes[change].name]};
                            } else {
                                updates[selectedAppObject.app].keys.push(changes[change].name);
                            }
                        }
                    }
                }
            }

            for (var update in updates) {
                laroux.mvc.updateApp(updates[update].app, updates[update].keys);
            }
        },

        bind: function(app, model, controller) {
            if (controller === undefined) {
                controller = window[app];
            }

            for (var appObject in laroux.mvc.appObjects) {
                var selectedAppObject = laroux.mvc.appObjects[appObject];

                if (selectedAppObject.app == app) {
                    selectedAppObject.model = model;
                    selectedAppObject.controller = controller;

                    laroux.mvc.updateApp(selectedAppObject);
                }
            }

            Object.observe(model, laroux.mvc.observer);
        }
    };

})(this.laroux);
