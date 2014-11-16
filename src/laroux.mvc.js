(function(laroux) {
    "use strict";

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
                for (var key1 in keys) {
                    var findStr1 = '{{' + keys[key1] + '}}';

                    if (atts[i].value.indexOf(findStr1) !== -1) {
                        nodes.push({ node: atts[i], key: keys[key1], value: atts[i].value });
                    }
                }
            }

            for (var j = 0, chldrn = element.childNodes, n = chldrn.length; j < n; j++) {
                for (var key2 in keys) {
                    var findStr2 = '{{' + keys[key2] + '}}';

                    if (chldrn[j].nodeType === 3) {
                        if (chldrn[j].textContent.indexOf(findStr2) !== -1) {
                            nodes.push({ node: chldrn[j], key: keys[key2], value: chldrn[j].textContent });
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
            var controller = window[appObject.app];

            if (typeof controller != 'undefined') {
                controller(appObject.model);
            }

            if (appObject.cachedNodes === null) {
                appObject.cachedNodes = [];
                laroux.mvc.scanElement(appObject.element, Object.keys(appObject.model), appObject.cachedNodes);
            }

            for (var i in appObject.cachedNodes) {
                var item = appObject.cachedNodes[i];

                if (typeof keys != 'undefined' && keys.indexOf(item.key) === -1) {
                    continue;
                }

                var findStr = '{{' + item.key + '}}';

                if (item.node instanceof Attr) {
                    item.node.value = item.value.replace(findStr, appObject.model[item.key]);
                } else {
                    item.node.textContent = item.value.replace(findStr, appObject.model[item.key]);
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
                            if (typeof updates[selectedAppObject.app] == 'undefined') {
                                updates[selectedAppObject.app] = { app: selectedAppObject, keys: [changes[change].name] };
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

        bind: function(app, model) {
            for (var appObject in laroux.mvc.appObjects) {
                var selectedAppObject = laroux.mvc.appObjects[appObject];

                if (selectedAppObject.app == app) {
                    selectedAppObject.model = model;
                }
            }

            Object.observe(model, laroux.mvc.observer);
            laroux.mvc.update();
        }
    };

})(this.laroux);
