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
    // requires $l.forms

    // keys
    laroux.keys = {
        keyName: function(keycode) {
            keycode = keycode.toLowerCase();

            switch (keycode) {
                case 'backspace':
                    return 8;

                case 'tab':
                    return 9;

                case 'enter':
                case 'return':
                    return 13;

                case 'esc':
                case 'escape':
                    return 27;

                case 'space':
                    return 32;

                case 'pgup':
                    return 33;

                case 'pgdn':
                    return 34;

                case 'end':
                    return 35;

                case 'home':
                    return 36;

                case 'left':
                    return 37;

                case 'up':
                    return 38;

                case 'right':
                    return 39;

                case 'down':
                    return 40;

                case 'insert':
                    return 45;

                case 'delete':
                    return 46;

                case 'f1':
                    return 112;

                case 'f2':
                    return 113;

                case 'f3':
                    return 114;

                case 'f4':
                    return 115;

                case 'f5':
                    return 116;

                case 'f6':
                    return 117;

                case 'f7':
                    return 118;

                case 'f8':
                    return 119;

                case 'f9':
                    return 120;

                case 'f10':
                    return 121;

                case 'f11':
                    return 122;

                case 'f12':
                    return 123;

                case ',':
                    return 188;

                case '.':
                    return 190;
            }

            return String.fromCharCode(keycode);
        },

        // {target, key, shift, ctrl, alt, disableInputs, fnc}
        assign: function(options) {
            var wrapper = function(event) {
                if (!event) {
                    event = window.event;
                }

                var element = event.target || event.srcElement;
                if (/* element.nodeType === 1 || */element.nodeType === 3 || element.nodeType === 11) {
                    element = element.parentNode;
                }

                if (options.disableInputs && laroux.forms.isFormField(element)) {
                    return;
                }

                if (options.shift && !event.shiftKey) {
                    return;
                }

                if (options.ctrl && !event.ctrlKey) {
                    return;
                }

                if (options.alt && !event.altKey) {
                    return;
                }

                var key = laroux.keys.keyName(options.key);
                if (key !== (event.keyCode || event.which)) {
                    return;
                }

                options.fnc(event);

                return false;
            };

            laroux.dom.setEvent(options.target || document, 'keydown', wrapper);
        }
    };

})(this.laroux);
;(function(laroux) {
    'use strict';

    // requires $l.dom
    // requires $l.helpers
    // requires $l.stack

    // mvc
    laroux.mvc = {
        apps: {},
        pauseUpdate: false,

        init: function(element, model) {
            if (element.constructor === String) {
                element = laroux.dom.selectById(element);
            }

            // if (model.constructor !== laroux.stack) {
            //     model = new laroux.stack(model);
            // }

            var appKey = element.getAttribute('id');

            model.onupdate = function(event) {
                if (!laroux.mvc.pauseUpdate) {
                    laroux.mvc.update(appKey); // , [event.key]
                }
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
            app.boundElements = {};
            app.eventElements = [];

            laroux.mvc.scanElements(app, app.element);
            laroux.mvc.update(appKey);

            var fnc = function(ev, elem) {
                var binding = laroux.mvc.bindStringParser(elem.getAttribute('lr-event'));
                // laroux.mvc.pauseUpdate = true;
                for (var item in binding) {
                    if (item === null || !binding.hasOwnProperty(item)) {
                        continue;
                    }

                    if (binding[item].charAt(0) == '\'') {
                        app.model[item] = binding[item].substring(1, binding[item].length - 1);
                    } else if (binding[item].substring(0, 5) == 'attr.') {
                        app.model[item] = elem.getAttribute(binding[item].substring(5));
                    } else if (binding[item].substring(0, 5) == 'prop.') {
                        app.model[item] = elem[binding[item].substring(5)];
                    }
                }
                // laroux.mvc.pauseUpdate = false;
            };

            for (var i = 0, length = app.eventElements.length; i < length; i++) {
                laroux.dom.setEvent(
                    app.eventElements[i].element,
                    app.eventElements[i].binding[null],
                    fnc
                );
            }
        },

        scanElements: function(app, element) {
            for (var i = 0, atts = element.attributes, m = atts.length; i < m; i++) {
                if (atts[i].name == 'lr-bind') {
                    var binding1 = laroux.mvc.bindStringParser(atts[i].value);

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
                } else if (atts[i].name == 'lr-event') {
                    var binding2 = laroux.mvc.bindStringParser(atts[i].value);

                    app.eventElements.push({
                        element: element,
                        binding: binding2
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
                    if (boundElement[j].target.substring(0, 6) == 'style.') {
                        boundElement[j].element.style[boundElement[j].target.substring(6)] = laroux.helpers.getElement(app.model, keys[i]);
                    } else if (boundElement[j].target.substring(0, 5) == 'attr.') {
                        // FIXME removeAttribute on null value?
                        boundElement[j].element.setAttribute(boundElement[j].target.substring(5), laroux.helpers.getElement(app.model, keys[i]));
                    } else if (boundElement[j].target.substring(0, 5) == 'prop.') {
                        // FIXME removeAttribute on null value?
                        boundElement[j].element[boundElement[j].target.substring(5)] = laroux.helpers.getElement(app.model, keys[i]);
                    }
                }
            }
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
;(function(laroux) {
    'use strict';

    // stack
    laroux.stack = function(data, depth, top) {
        this._data = {};
        this._depth = depth;
        this._top = top || this;

        this.set = function(key, value) {
            // delete this._data[key];

            var type = typeof value;
            switch (type) {
                case 'function':
                    this._data[key] = value;

                    Object.defineProperty(
                        this,
                        key,
                        {
                            configurable: true,
                            get: function() {
                                return this._data[key]();
                            }
                        }
                    );
                    break;

                default:
                    /*
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
                    */
                    this._data[key] = value;

                    Object.defineProperty(
                        this,
                        key,
                        {
                            configurable: true,
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
                                this._top.onupdate({scope: this, key: key, oldValue: oldValue, newValue: newValue});
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
                delete this._data[key];
            }
        };

        this.clear = function() {
            for (var item in this._data) {
                if (!this._data.hasOwnProperty(item)) {
                    continue;
                }

                delete this[item];
                delete this._data[item];
            }

            this._data = {};
        };

        this.onupdate = function(event) {
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
            plain: {
                compile: function(template, options) {
                    return [template, options];
                },

                render: function(compiled, model) {
                    var result = compiled[0],
                        dict = [],
                        lastIndex = 0,
                        nextIndex;

                    while ((nextIndex = result.indexOf('{{', lastIndex)) !== -1) {
                        nextIndex += 2;
                        var closeIndex = result.indexOf('}}', nextIndex);
                        if (closeIndex === -1) {
                            break;
                        }

                        var key = result.substring(nextIndex, closeIndex);
                        dict['{{' + key + '}}'] = laroux.helpers.getElement(model, key, '');
                        lastIndex = closeIndex + 2;
                    }

                    return laroux.helpers.replaceAll(result, dict);
                }
            },

            hogan: {
                compile: function(template, options) {
                    return Hogan.compile(template, options);
                },

                render: function(compiled, model) {
                    return compiled.render(model);
                }
            },

            mustache: {
                compile: function(template, options) {
                    return Mustache.compile(template, options);
                },

                render: function(compiled, model) {
                    return compiled(model);
                }
            },

            handlebars: {
                compile: function(template, options) {
                    return Handlebars.compile(template, options);
                },

                render: function(compiled, model) {
                    return compiled(model);
                }
            },

            lodash: {
                compile: function(template, options) {
                    return _.compile(template, null, options);
                },

                render: function(compiled, model) {
                    return compiled(model);
                }
            },

            underscore: {
                compile: function(template, options) {
                    return _.compile(template, null, options);
                },

                render: function(compiled, model) {
                    return compiled(model);
                }
            }
        },
        engine: 'plain',

        apply: function(element, model, options) {
            var content, engine = laroux.templates.engines[laroux.templates.engine];

            if (element.nodeType === 1 || element.nodeType === 3 || element.nodeType === 11) {
                content = element.textContent;
            } else {
                content = element.nodeValue;
            }

            var compiled = engine.compile(content, options);
            return engine.render(compiled, model);
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

    // requires $l.dom

    // touch - partially taken from 'tocca.js' project
    //         can be found at: https://github.com/GianlucaGuarini/Tocca.js
    laroux.touch = {
        touchStarted: null,
        swipeTreshold: 80,
        precision: 30,
        tapCount: 0,
        tapTreshold: 200,
        longTapTreshold: 800,
        tapTimer: null,
        pos: null,
        cached: null,

        events: {
            start: ['touchstart', 'pointerdown', 'MSPointerDown', 'mousedown'],
            end: ['touchend', 'pointerup', 'MSPointerUp', 'mouseup'],
            move: ['touchmove', 'pointermove', 'MSPointerMove', 'mousemove']
        },

        locatePointer: function(event) {
            if (event.targetTouches) {
                event = event.targetTouches[0];
            }

            laroux.touch.pos = [event.pageX, event.pageY];
        },

        onstart: function(event) {
            laroux.touch.locatePointer(event);
            laroux.touch.cached = [laroux.touch.pos[0], laroux.touch.pos[1]];
            laroux.touch.touchStarted = Date.now();
            laroux.touch.tapCount++;

            var fnc = function() {
                if (
                    laroux.touch.cached[0] >= laroux.touch.pos[0] - laroux.touch.precision &&
                    laroux.touch.cached[0] <= laroux.touch.pos[0] + laroux.touch.precision &&
                    laroux.touch.cached[1] >= laroux.touch.pos[1] - laroux.touch.precision &&
                    laroux.touch.cached[1] <= laroux.touch.pos[1] + laroux.touch.precision
                ) {
                    if (laroux.touch.touchStarted === null) {
                        laroux.dom.dispatchEvent(
                            event.target,
                            (laroux.touch.tapCount === 2) ? 'dbltap' : 'tap',
                            {
                                innerEvent: event,
                                x: laroux.touch.pos[0],
                                y: laroux.touch.pos[1],
                            }
                        );

                        laroux.touch.tapCount = 0;
                        return;
                    }

                    if (Date.now() - laroux.touch.touchStarted > laroux.touch.longTapTreshold) {
                        laroux.dom.dispatchEvent(
                            event.target,
                            'longtap',
                            {
                                innerEvent: event,
                                x: laroux.touch.pos[0],
                                y: laroux.touch.pos[1],
                            }
                        );

                        laroux.touch.touchStarted = null;
                        laroux.touch.tapCount = 0;
                        return;
                    }

                    laroux.tapTimer = setTimeout(fnc, laroux.touch.tapTreshold);
                    return;
                }

                laroux.touch.tapCount = 0;
            };

            clearTimeout(laroux.tapTimer);
            laroux.tapTimer = setTimeout(fnc, laroux.touch.tapTreshold);
        },

        onend: function(event) {
            var delta = [
                    laroux.touch.pos[0] - laroux.touch.cached[0],
                    laroux.touch.pos[1] - laroux.touch.cached[1]
                ],
                data = {
                    innerEvent: event,
                    x: laroux.touch.pos[0],
                    y: laroux.touch.pos[1],
                    distance: {
                        x: Math.abs(delta[0]),
                        y: Math.abs(delta[1])
                    }
                };

            laroux.touch.touchStarted = null;

            if (delta[0] <= -laroux.touch.swipeTreshold) {
                laroux.dom.dispatchEvent(event.target, 'swiperight', data);
            }

            if (delta[0] >= laroux.touch.swipeTreshold) {
                laroux.dom.dispatchEvent(event.target, 'swipeleft', data);
            }

            if (delta[1] <= -laroux.touch.swipeTreshold) {
                laroux.dom.dispatchEvent(event.target, 'swipedown', data);
            }

            if (delta[1] >= laroux.touch.swipeTreshold) {
                laroux.dom.dispatchEvent(event.target, 'swipeup', data);
            }
        }
    };

    laroux.ready(function() {
        var events = [
            0,
            (navigator.msPointerEnabled) ? 2 : 1,
            3
        ];

        for (var i = 0, length = events.length; i < length; i++) {
            laroux.dom.setEventSingle(document, laroux.touch.events.start[events[i]], laroux.touch.onstart);
            laroux.dom.setEventSingle(document, laroux.touch.events.end[events[i]], laroux.touch.onend);
            laroux.dom.setEventSingle(document, laroux.touch.events.move[events[i]], laroux.touch.locatePointer);
        }
    });

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
