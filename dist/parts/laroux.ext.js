(function(laroux) {
    'use strict';

    // requires $l.helpers
    // requires $l.css

    // anim
    laroux.anim = {
        data: [],

        fx: {
            interpolate: function (source, target, shift) {
                return (source + (target - source) * shift);
            },

            easing: function (pos) {
                return (-Math.cos(pos * Math.PI) / 2) + 0.5;
            }
        },

        // {object, property, from, to, time, unit, reset}
        set: function(newanim) {
            newanim.startTime = null;

            if (newanim.unit === undefined || newanim.unit === null) {
                newanim.unit = '';
            }

            if (newanim.from === undefined || newanim.from === null) {
                if (newanim.object === document.body && newanim.property == 'scrollTop') {
                    newanim.from = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;
                } else {
                    newanim.from = newanim.object[newanim.property];
                }
            }

            if (typeof newanim.from == 'string') {
                newanim.from = Number(newanim.from);
            }

            if (newanim.reset === undefined || newanim.reset === null) {
                newanim.reset = false;
            }

            // if (newanim.id === undefined) {
            //     newanim.id = laroux.helpers.getUniqueId();
            // }

            laroux.anim.data.push(newanim);
            if (laroux.anim.data.length === 1) {
                requestAnimationFrame(laroux.anim.onframe);
            }
        },

        setCss: function(newanim) {
            if (newanim.from === undefined || newanim.from === null) {
                newanim.from = laroux.css.getProperty(newanim.object, newanim.property);
            }

            newanim.object = newanim.object.style;
            newanim.property = laroux.helpers.camelCase(newanim.property);

            laroux.anim.set(newanim);
        },

        remove: function(id) {
            var targetKey = null;

            for (var item in laroux.anim.data) {
                if (!laroux.anim.data.hasOwnProperty(item)) {
                    continue;
                }

                var currentItem = laroux.anim.data[item];

                if (currentItem.id !== undefined && currentItem.id == id) {
                    targetKey = item;
                    break;
                }
            }

            if (targetKey !== null) {
                laroux.anim.data.splice(targetKey, 1);
                return true;
            }

            return false;
        },

        onframe: function(timestamp) {
            var removeKeys = [];
            for (var item in laroux.anim.data) {
                if (!laroux.anim.data.hasOwnProperty(item)) {
                    continue;
                }

                var currentItem = laroux.anim.data[item];
                if (currentItem.startTime === null) {
                    currentItem.startTime = timestamp;
                }

                var result = laroux.anim.step(currentItem, timestamp);

                if (result === false) {
                    removeKeys.unshift(item);
                } else if (timestamp > currentItem.startTime + currentItem.time) {
                    if (currentItem.reset) {
                        currentItem.startTime = timestamp;
                        if (newanim.object === document.body && newanim.property == 'scrollTop') {
                            scrollTo(0, currentItem.from);
                            // setTimeout(function() { scrollTo(0, currentItem.from); }, 1);
                        } else {
                            currentItem.object[currentItem.property] = currentItem.from;
                        }
                    } else {
                        removeKeys.unshift(item);
                    }
                }
            }

            for (var item2 in removeKeys) {
                if (!removeKeys.hasOwnProperty(item2)) {
                    continue;
                }

                laroux.anim.data.splice(removeKeys[item2], 1);
            }

            if (laroux.anim.data.length > 0) {
                requestAnimationFrame(laroux.anim.onframe);
            }
        },

        step: function(newanim, timestamp) {
            var finishT = newanim.startTime + newanim.time,
                shift = (timestamp > finishT) ? 1 : (timestamp - newanim.startTime) / newanim.time;

            var value = laroux.anim.fx.interpolate(
                newanim.from,
                newanim.to,
                laroux.anim.fx.easing(shift)
            ) + newanim.unit;

            if (newanim.object === document.body && newanim.property == 'scrollTop') {
                scrollTo(0, value);
                // setTimeout(function() { scrollTo(0, value); }, 1);
            } else {
                newanim.object[newanim.property] = value;
            }
        }
    };

})(this.laroux);
;(function(laroux) {
    'use strict';

    // date
    laroux.date = {
        shortDateFormat: 'dd.MM.yyyy',
        longDateFormat: 'dd MMMM yyyy',
        timeFormat: 'HH:mm',

        monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        monthsLong: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],

        strings: {
            now:     'now',
            later:   'later',
            ago:     'ago',
            seconds: 'seconds',
            aminute: 'a minute',
            minutes: 'minutes',
            ahour:   'a hour',
            hours:   'hours',
            aday:    'a day',
            days:    'days',
            aweek:   'a week',
            weeks:   'weeks',
            amonth:  'a month',
            months:  'months',
            ayear:   'a year',
            years:   'years'
        },

        parseEpoch: function(timespan, limitWithWeeks) {
            if (timespan < 60*1000) {
                timespan = Math.ceil(timespan / 1000);

                return timespan + ' ' + laroux.date.strings.seconds;
            }

            if (timespan < 60*60*1000) {
                timespan = Math.ceil(timespan / (60*1000));

                if (timespan == 1) {
                    return laroux.date.strings.aminute;
                }

                return timespan + ' ' + laroux.date.strings.minutes;
            }

            if (timespan < 24*60*60*1000) {
                timespan = Math.ceil(timespan / (60*60*1000));

                if (timespan == 1) {
                    return laroux.date.strings.ahour;
                }

                return timespan + ' ' + laroux.date.strings.hours;
            }

            if (timespan < 7*24*60*60*1000) {
                timespan = Math.ceil(timespan / (24*60*60*1000));

                if (timespan == 1) {
                    return laroux.date.strings.aday;
                }

                return timespan + ' ' + laroux.date.strings.days;
            }

            if (timespan < 4*7*24*60*60*1000) {
                timespan = Math.ceil(timespan / (7*24*60*60*1000));

                if (timespan == 1) {
                    return laroux.date.strings.aweek;
                }

                return timespan + ' ' + laroux.date.strings.weeks;
            }

            if (limitWithWeeks === true) {
                return null;
            }

            if (timespan < 30*7*24*60*60*1000) {
                timespan = Math.ceil(timespan / (30*24*60*60*1000));

                if (timespan == 1) {
                    return laroux.date.strings.amonth;
                }

                return timespan + ' ' + laroux.date.strings.months;
            }

            timespan = Math.ceil(timespan / (365*24*60*60*1000));

            if (timespan == 1) {
                return laroux.date.strings.ayear;
            }

            return timespan + ' ' + laroux.date.strings.years;
        },

        getCustomDateString: function(format, date) {
            var now = date || new Date();

            return format.replace(
                /yyyy|yy|MMMM|MMM|MM|M|dd|d|hh|h|HH|H|mm|m|ss|s|tt|t/g,
                function(match) {
                    switch (match) {
                        case 'yyyy':
                            return now.getFullYear();

                        case 'yy':
                            return now.getYear();

                        case 'MMMM':
                            return laroux.date.monthsLong[now.getMonth()];

                        case 'MMM':
                            return laroux.date.monthsShort[now.getMonth()];

                        case 'MM':
                            return ('0' + (now.getMonth() + 1)).substr(-2, 2);

                        case 'M':
                            return now.getMonth() + 1;

                        case 'dd':
                            return ('0' + now.getDate()).substr(-2, 2);

                        case 'd':
                            return now.getDate();

                        case 'hh':
                            var hour1 = now.getHours();
                            return ('0' + (((hour1 % 12) > 0) ? hour1 % 12 : 12)).substr(-2, 2);

                        case 'h':
                            var hour2 = now.getHours();
                            return ((hour2 % 12) > 0) ? hour2 % 12 : 12;

                        case 'HH':
                            return ('0' + now.getHours()).substr(-2, 2);

                        case 'H':
                            return now.getHours();

                        case 'mm':
                            return ('0' + now.getMinutes()).substr(-2, 2);

                        case 'm':
                            return now.getMinutes();

                        case 'ss':
                            return ('0' + now.getSeconds()).substr(-2, 2);

                        case 's':
                            return now.getSeconds();

                        case 'tt':
                            if (now.getHours() >= 12) {
                                return 'pm';
                            }

                            return 'am';

                        case 't':
                            if (now.getHours() >= 12) {
                                return 'p';
                            }

                            return 'a';
                    }

                    return match;
                }
            );
        },

        getDateDiffString: function(date) {
            var now = Date.now(),
                timespan = now - date.getTime(),
                absTimespan = Math.abs(timespan),
                past = (timespan > 0);

            if (absTimespan <= 3000) {
                return laroux.date.strings.now;
            }

            var timespanstring = laroux.date.parseEpoch(absTimespan, true);
            if (timespanstring !== null) {
                return timespanstring +
                    ' ' +
                    (past ?
                        laroux.date.strings.ago :
                        laroux.date.strings.later);
            }

            return laroux.date.getShortDateString(date, true);
        },

        getShortDateString: function(date, includeTime) {
            return laroux.date.getCustomDateString(
                includeTime ?
                    laroux.date.shortDateFormat + ' ' + laroux.date.timeFormat :
                    laroux.date.shortDateFormat,
                date
            );
        },

        getLongDateString: function(date, includeTime) {
            return laroux.date.getCustomDateString(
                includeTime ?
                    laroux.date.longDateFormat + ' ' + laroux.date.timeFormat :
                    laroux.date.longDateFormat,
                date
            );
        }
    };

})(this.laroux);
;(function(laroux) {
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
;(function(laroux) {
    'use strict';

    // stack
    laroux.stack = function(data, depth, top) {
        this._data = {};
        this._depth = depth;
        this._top = top || this;

        this.set = function(key, value) {
            // delete this[key];

            var type = typeof value;
            switch (type) {
                case 'function':
                    this._data[key] = value;

                    Object.defineProperty(
                        this,
                        key,
                        {
                            get: function() {
                                return this._data[key]();
                            }
                        }
                    );
                    break;

                default:
                    if (type == 'object') {
                        this._data[key] = new laroux.stack(
                            value,
                            this._depth ?
                                this._depth + '.' + key :
                                key,
                            this._top
                        );
                    } else {
                        this._data[key] = value;
                    }

                    Object.defineProperty(
                        this,
                        key,
                        {
                            get: function() {
                                return this._data[key];
                            },
                            set: function(newValue) {
                                var oldValue = this._data[key];
                                if (this._data[key] === newValue) {
                                    return;
                                }

                                // this.set(this, key, newValue);
                                this._data[key] = newValue;
                                this._top.onupdate(this, key, oldValue, newValue);
                            }
                        }
                    );
                    break;
            }
        };

        this.setRange = function(values) {
            for (var valueKey in values) {
                if (!values.hasOwnProperty(valueKey)) {
                    continue;
                }

                this.set(valueKey, values[valueKey]);
            }
        };

        this.get = function(key, defaultValue) {
            return this[key] || defaultValue || null;
        };

        this.getRange = function(keys) {
            var values = {};

            for (var item in keys) {
                if (!keys.hasOwnProperty(item)) {
                    continue;
                }

                values[keys[item]] = this[keys[item]];
            }

            return values;
        };

        this.keys = function() {
            return Object.keys(this._data);
        };

        this.length = function() {
            return Object.keys(this._data).length;
        };

        this.exists = function(key) {
            return (key in this._data);
        };

        this.remove = function(key) {
            if (key in this._data) {
                delete this[key];
            }

            delete this._data[key];
        };

        this.clear = function() {
            for (var item in this._data) {
                if (!this._data.hasOwnProperty(item)) {
                    continue;
                }

                delete this[item];
            }

            this._data = {};
        };

        this.onupdate = function(scope, key, oldValue, newValue) {
        };

        if (data) {
            this.setRange(data);
        }
    };

})(this.laroux);
;(function(laroux) {
    'use strict';

    // requires $l.dom

    // templates
    laroux.templates = {
        engines: {
            hogan: function(template, model, options) {
                var compiled = Hogan.compile(template, options);
                return compiled.render(model);
            },

            lodash: function(template, model, options) {
                var compiled = _.template(template, null, options);
                return compiled(model);
            }
        },
        engine: 'hogan',

        apply: function(element, model, options) {
            var content;

            if (chldrn[j].nodeType === 3) {
                content = element.textContent;
            } else {
                content = element.nodeValue;
            }

            return laroux.templates.engines[laroux.templates.engine](
                content,
                model,
                options
            );
        },

        insert: function(element, model, target, position, options) {
            var output = laroux.templates.apply(element, model, options);

            laroux.dom.insert(target, position || 'beforeend', output);
        },

        replace: function(element, model, target, options) {
            var output = laroux.templates.apply(element, model, options);

            laroux.dom.replace(target, output);
        }
    };

})(this.laroux);
;(function(laroux) {
    'use strict';

    // requires $l
    // requires $l.dom
    // requires $l.helpers
    // requires $l.css
    // requires $l.timers
    // requires $l.date

    // ui
    laroux.ui = {
        floatContainer: null,

        popup: {
            defaultTimeout: 500,

            createBox: function(id, xclass, message) {
                return laroux.dom.createElement('DIV', {id: id, 'class': xclass},
                    message
                );
            },

            msgbox: function(timeout, message) {
                var id = laroux.helpers.getUniqueId();
                var obj = laroux.ui.popup.createBox(id, 'laroux_msgbox', message);
                laroux.ui.floatContainer.appendChild(obj);

                laroux.css.setProperty(obj, {opacity: 1});

                laroux.timers.set({
                    timeout: timeout,
                    reset: false,
                    ontick: function(x) {
                        // laroux.css.setProperty(x, {opacity: 0});
                        laroux.dom.remove(x);
                    },
                    state: obj
                });
            },

            init: function() {
                laroux.popupFunc = function(message) {
                    laroux.ui.popup.msgbox(laroux.ui.popup.defaultTimeout, message);
                };
            }
        },

        loading: {
            elementSelector: null,
            element: null,
            defaultDelay: 1500,
            timer: null,

            killTimer: function() {
                clearTimeout(laroux.ui.loading.timer);
            },

            hide: function() {
                laroux.ui.loading.killTimer();

                laroux.css.setProperty(laroux.ui.loading.element, {display: 'none'});
                localStorage.loadingIndicator = 'false';
            },

            show: function(delay) {
                laroux.ui.loading.killTimer();

                if (delay === undefined) {
                    delay = laroux.ui.loading.defaultDelay;
                }

                if (delay > 0) {
                    setTimeout(function() { laroux.ui.loading.show(0); }, delay);
                } else {
                    laroux.css.setProperty(laroux.ui.loading.element, {display: 'block'});
                    localStorage.loadingIndicator = 'true';
                }
            },

            init: function() {
                if (laroux.ui.loading.element === null && laroux.ui.loading.elementSelector !== null) {
                    laroux.ui.loading.element = laroux.dom.selectSingle(laroux.ui.loading.elementSelector);
                }

                if (laroux.ui.loading.element !== null) {
                    laroux.dom.setEvent(window, 'load', laroux.ui.loading.hide);
                    laroux.dom.setEvent(window, 'beforeunload', laroux.ui.loading.show);

                    if (localStorage.loadingIndicator !== undefined && localStorage.loadingIndicator == 'true') {
                        laroux.ui.loading.show(0);
                    } else {
                        laroux.ui.loading.show();
                    }
                }
            }
        },

        dynamicDates: {
            updateDatesElements: null,

            updateDates: function() {
                if (laroux.ui.dynamicDates.updateDatesElements === null) {
                    laroux.ui.dynamicDates.updateDatesElements = laroux.dom.select('*[data-epoch]');
                }

                for (var item in laroux.ui.dynamicDates.updateDatesElements) {
                    if (!laroux.ui.dynamicDates.updateDatesElements.hasOwnProperty(item)) {
                        continue;
                    }

                    var obj = laroux.ui.dynamicDates.updateDatesElements[item];
                    // bitshifting (str >> 0) used instead of parseInt(str, 10)
                    var date = new Date((obj.getAttribute('data-epoch') >> 0) * 1000);

                    laroux.dom.replace(
                        obj,
                        laroux.date.getDateString(date)
                    );

                    obj.setAttribute('title', laroux.date.getLongDateString(date));
                }
            },

            init: function() {
                laroux.timers.set({
                    timeout: 500,
                    reset: true,
                    ontick: laroux.ui.dynamicDates.updateDates
                });
            }
        },

        scrollView: {
            selectedElements: [],

            onhidden: function(elements) {
                laroux.css.setProperty(elements, {opacity: 0});
                laroux.css.setTransition(elements, ['opacity']);
            },

            onreveal: function(elements) {
                laroux.css.setProperty(elements, {opacity: 1});
            },

            set: function(element) {
                var elements = laroux.helpers.getAsArray(element);

                for (var i = 0, length = elements.length; i < length; i++) {
                    if (!laroux.css.inViewport(elements[i])) {
                        laroux.ui.scrollView.selectedElements.push(elements[i]);
                    }
                }

                laroux.ui.scrollView.onhidden(laroux.ui.scrollView.selectedElements);
                laroux.dom.setEvent(window, 'scroll', laroux.ui.scrollView.reveal);
            },

            reveal: function() {
                var removeKeys = [],
                    elements = [];

                laroux.each(
                    laroux.ui.scrollView.selectedElements,
                    function(i, element) {
                        if (laroux.css.inViewport(element)) {
                            removeKeys.unshift(i);
                            elements.push(element);
                        }
                    }
                );

                for (var item in removeKeys) {
                    if (!removeKeys.hasOwnProperty(item)) {
                        continue;
                    }

                    laroux.ui.scrollView.selectedElements.splice(removeKeys[item], 1);
                }

                if (laroux.ui.scrollView.selectedElements.length === 0) {
                    laroux.dom.unsetEvent(window, 'scroll', laroux.ui.scrollView.reveal);
                }

                if (elements.length > 0) {
                    laroux.ui.scrollView.onreveal(elements);
                }
            }
        },

        createFloatContainer: function() {
            if (!laroux.ui.floatContainer) {
                laroux.ui.floatContainer = laroux.dom.createElement('DIV', {id: 'laroux_floatdiv'});
                document.body.insertBefore(laroux.ui.floatContainer, document.body.firstChild);
            }
        },

        init: function() {
            laroux.ui.createFloatContainer();
            laroux.ui.popup.init();
            laroux.ui.loading.init();
            laroux.ui.dynamicDates.init();
        }
    };

})(this.laroux);
