(function(global) {
    'use strict';

    if (!('requestAnimationFrame' in global)) {
        global.requestAnimationFrame = function(callback) {
            setTimeout(function() { callback(Date.now()); }, 50);
        };
    }

    if (!('getComputedStyle' in global)) {
        global.getComputedStyle = function(element) {
            this.element = element;

            this.getPropertyValue = function(prop) {
                var re = /(\-([a-z]){1})/g;
                if (prop == 'float') {
                    prop = 'styleFloat';
                }

                if (re.test(prop)) {
                    prop = prop.replace(re, function() {
                        return arguments[2].toUpperCase();
                    });
                }

                return this.element.currentStyle[prop] || null;
            };

            this.getPropertyCSSValue = function(prop) {
                return new CSSPrimitiveValue(this.element, prop);
            };

            return this;
        };
    }

    if (!('CSSPrimitiveValue' in global)) {
        global.CSSPrimitiveValue = function(element, prop) {
            this.element = element;
            this.prop = prop;
            this.primitiveType = 0;

            this.getFloatValue = function(primitiveType) {
                var re = /(\-([a-z]){1})/g;
                var prop = this.prop;
                if (prop == 'float') {
                    prop = 'styleFloat';
                }

                if (re.test(prop)) {
                    prop = prop.replace(re, function() {
                        return arguments[2].toUpperCase();
                    });
                }

                return this.element.currentStyle[prop] || null;
            };
        };
    }

    if (!('preventDefault' in Event.prototype)) {
        Event.prototype.preventDefault = function() {
            this.returnValue = false;
        };
    }

    if (!('stopPropagation' in Event.prototype)) {
        Event.prototype.stopPropagation = function() {
            this.cancelBubble = true;
        };
    }

    if (Element === undefined) {
        Element = function() {};
    }

    if (!('addEventListener' in Element.prototype)) {
        var eventListeners = [];

        var addListener = function(eventname, callback) {
            var self = this;
            var wrapper = function(event) {
                event.target = event.srcElement;
                event.currentTarget = self;

                // if ('handleEvent' in callback) {
                //     callback.handleEvent(event);
                // } else {
                //     callback.call(self, event);
                // }
                callback(self, event);
            };

            if (eventname != 'DOMContentLoaded') {
                this.attachEvent('on' + eventname, wrapper);
            }
            eventListeners.push({object: this, type: eventname, listener: callback, wrapper: wrapper});
        };

        var removeListener = function(eventname, callback) {
            for (var i = 0, length = eventListeners.length; i < length; i++) {
                var eventListener = eventListeners[i];

                if (eventListener.object === this && eventListener.type === eventname && eventListener.listener === callback) {
                    if (eventname != 'DOMContentLoaded') {
                        this.detachEvent('on' + eventname, eventListener.wrapper);
                    }

                    eventListeners.splice(i, 1);
                    break;
                }
            }
        };

        var dispatchEvent = function(event) {
            var eventObject = document.createEventObject();
            this.fireEvent('on' + event.type, eventObject);
        };

        Element.prototype.addEventListener = addListener;
        Element.prototype.removeEventListener = removeListener;
        Element.prototype.dispatchEvent = dispatchEvent;

        if (HTMLDocument !== undefined) {
            HTMLDocument.prototype.addEventListener = addListener;
            HTMLDocument.prototype.removeEventListener = removeListener;
            HTMLDocument.prototype.dispatchEvent = dispatchEvent;
        }

        if (Window !== undefined) {
            Window.prototype.addEventListener = addListener;
            Window.prototype.removeEventListener = removeListener;
            Window.prototype.dispatchEvent = dispatchEvent;
        }

        document.attachEvent('onreadystatechange', function() {
            if (document.readyState == 'complete') {
                var eventObject = document.createEventObject();
                // eventObject.srcElement = window;

                for (var i = 0, length = eventListeners.length; i < length; i++) {
                    if (eventListeners[i].object === document && eventListeners[i].type === 'DOMContentLoaded') {
                        eventListeners[i].wrapper(eventObject);
                    }
                }
            }
        });
    }

    if (!('textContent' in Element.prototype)) {
        var innerText = Object.getOwnPropertyDescriptor(Element.prototype, 'innerText');

        Object.defineProperty(Element.prototype, 'textContent', {
            get: function() {
                return innerText.get.call(this);
            },
            set: function(value) {
                return innerText.set.call(this, value);
            }
        });
    }

    if (!('getAttribute' in Element.prototype)) {
        Element.prototype.getAttribute = function(attribute) {
            return this.attributes[attribute].value;
        };
    }

    if (!('setAttribute' in Element.prototype)) {
        Element.prototype.setAttribute = function(attribute, value) {
            this.attributes[attribute].value = value;
        };
    }

    if (!('removeAttribute' in Element.prototype)) {
        Element.prototype.removeAttribute = function(attribute) {
            this.attributes.removeNamedItem(attribute);
        };
    }

    if (!('firstElementChild' in Element.prototype)) {
        Object.defineProperty(Element.prototype, 'firstElementChild', {
            get: function() {
                return this.children[0];
            }
        });
    }

    if (!('classList' in Element.prototype)) {
        Object.defineProperty(Element.prototype, 'classList', {
            get: function() {
                var self = this;

                return {
                    add: function(className) {
                        self.className = self.className.trim() + ' ' + className;
                    },

                    remove: function(className) {
                        self.className = self.className.replace(
                            new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'),
                            ' '
                        );
                    },

                    contains: function(className) {
                        return (new RegExp('(^| )' + className + '( |$)', 'gi').test(self.className));
                    }
                };
            }
        });
    }

    if (!('textContent' in Text.prototype)) {
        var nodeValue = Object.getOwnPropertyDescriptor(Text.prototype, 'nodeValue');

        Object.defineProperty(Text.prototype, 'textContent', {
            get: function() {
                return nodeValue.get.call(this);
            },
            set: function(value) {
                return nodeValue.set.call(this, value);
            }
        });
    }

    if (!('trim' in String.prototype)) {
        String.prototype.trim = function() {
            return this.replace(/^\s+|\s+$/g, '');
        };
    }

    if (!('observe' in Object)) {
        Object.observe = function() {};
    }

    if (!('keys' in Object)) {
        Object.keys = function(object) {
            var keys = [];

            for (var item in object) {
                if (!object.hasOwnProperty(item)) {
                    continue;
                }

                keys.push(item);
            }

            return keys;
        };
    }

    /*
    if (!('forEach' in Object.prototype)) {
        Object.prototype.forEach = function(callback) {
            for (var item in this) {
                if (!this.hasOwnProperty(item)) {
                    continue;
                }

                callback.apply(this, [this[item], item, this]);
            }
        };
    }

    if (!('map' in Object.prototype)) {
        Object.prototype.map = function(callback) {
            var results = [];

            for (var item in this) {
                if (!this.hasOwnProperty(item)) {
                    continue;
                }

                results.push(callback.apply(this, [this[item], item, this]));
            }

            return results;
        };
    }

    if (!('forEach' in Array.prototype)) {
        Array.prototype.forEach = function(callback) {
            for (var i = 0; i < this.length; i++) {
                callback.apply(this, [this[i], i, this]);
            }
        };
    }

    if (!('map' in Array.prototype)) {
        Array.prototype.map = function(callback) {
            var results = [];

            for (var i = 0; i < this.length; i++) {
                results.push(callback.apply(this, [this[i], i, this]));
            }

            return results;
        };
    }

    if (!('indexOf' in Array.prototype)) {
        Array.prototype.indexOf = function(object, start) {
            for (var i = (start || 0), length = this.length; i < length; i++) {
                if (this[i] === object) {
                    return i;
                }
            }

            return -1;
        };
    }
    */

})(this);
;(function(global) {
    'use strict';

    // core
    var laroux = function(selector, parent) {
        if (selector instanceof Array) {
            return laroux.helpers.toArray(
                (parent || document).querySelectorAll(selector)
            );
        }

        /*
        // FIXME: non-chrome optimization
        var re = /^#([^\+\>\[\]\.# ]*)$/.exec(selector);
        if (re) {
            if (parent === undefined) {
                return document.getElementById(re[1]);
            }

            return parent.getElementById(re[1]);
        }
        */

        return (parent || document).querySelector(selector);
    };

    laroux.cached = {
        single: {},
        array: {},
        id: {}
    };

    laroux.c = function(selector) {
        if (selector instanceof Array) {
            return laroux.cached.array[selector] || (
                laroux.cached.array[selector] = laroux.helpers.toArray(
                    document.querySelectorAll(selector)
                )
            );
        }

        return laroux.cached.single[selector] || (
            laroux.cached.single[selector] = document.querySelector(selector)
        );
    };

    laroux.id = function(selector, parent) {
        return (parent || document).getElementById(selector);
    };

    laroux.idc = function(selector) {
        return laroux.cached.id[selector] ||
            (laroux.cached.id[selector] = document.getElementById(selector));
    };

    laroux.parent = global;
    laroux.popupFunc = alert;
    laroux.readyPassed = false;

    laroux.ready = function(fnc) {
        if (!laroux.readyPassed) {
            laroux.events.add('ContentLoaded', fnc);
            return;
        }

        fnc();
    };

    laroux.extend = function() {
        Array.prototype.unshift.call(arguments, laroux);
        laroux.extendObject.apply(this, arguments);
    };

    laroux.extendObject = function() {
        var target = Array.prototype.shift.call(arguments),
            isArray = target instanceof Array;

        for (var item in arguments) {
            for (var name in arguments[item]) {
                // if (isArray) {
                //     target.push(arguments[item][name]);
                //     continue;
                // }

                /* target[name].constructor === Object */
                if (target.hasOwnProperty(name) && target[name] instanceof Object) {
                    laroux.extendObject(target[name], arguments[item][name]);
                    continue;
                }

                target[name] = arguments[item][name];
            }
        }
    };

    laroux.each = function(arr, fnc, testOwnProperties) {
        for (var item in arr) {
            if (testOwnProperties && !arr.hasOwnProperty(item)) {
                continue;
            }

            if (fnc(item, arr[item]) === false) {
                break;
            }
        }

        return arr;
    };

    laroux.map = function(arr, fnc, dontSkipReturns, testOwnProperties) {
        var results = [];

        for (var item in arr) {
            if (testOwnProperties && !arr.hasOwnProperty(item)) {
                continue;
            }

            var result = fnc(arr[item], item);
            if (result === false) {
                break;
            }

            if (!dontSkipReturns && result !== undefined) {
                results.push(result);
            }
        }

        return results;
    };

    laroux.index = function(arr, value, testOwnProperties) {
        for (var item in arr) {
            if (testOwnProperties && !arr.hasOwnProperty(item)) {
                continue;
            }

            if (arr[item] === object) {
                return item;
            }
        }

        return null;
    };

    laroux.aeach = function(arr, fnc) {
        for (var i = 0, length = arr.length; i < length; i++) {
            if (fnc(i, arr[i]) === false) {
                break;
            }
        }

        return arr;
    };

    laroux.amap = function(arr, fnc, dontSkipReturns) {
        var results = [];

        for (var i = 0, length = arr.length; i < length; i++) {
            var result = fnc(arr[i], i);
            if (result === false) {
                break;
            }

            if (!dontSkipReturns && result !== undefined) {
                results.unshift(result);
            }
        }

        return results;
    };

    laroux.aindex = function(arr, value, start) {
        for (var i = (start || 0), length = arr.length; i < length; i++) {
            if (arr[i] === value) {
                return i;
            }
        }

        return -1;
    };

    // initialization
    // if (typeof module !== 'undefined' && module.exports !== undefined) {
    //     module.exports = laroux;
    // } else {
    //     global.$l = global.laroux = laroux;
    // }
    global.$l = global.laroux = laroux;

    document.addEventListener(
        'DOMContentLoaded',
        function() {
            if (!laroux.readyPassed) {
                laroux.events.invoke('ContentLoaded');
                laroux.readyPassed = true;
            }
        }
    );

})(this);
;(function(laroux) {
    'use strict';

    // requires $l.dom

    // wrapper
    laroux.wrapper = function(selector, parent) {
        var selection;

        if (selector instanceof Array) {
            selection = selector;
        } else if (selector instanceof NodeList) {
            selection = laroux.helpers.toArray(selector);
        } else if (selector instanceof Node) {
            selection = [selector];
        } else {
            selection = laroux.dom.select(selector, parent);
        }

        if (selection.length === 1) {
            return new laroux.wrapper.singleTemplate(selection[0]);
        }

        return new laroux.wrapper.arrayTemplate(selection);
    };

    laroux.wrapper.singleTemplate = function(element) {
        this.source = element;
        this.isArray = false;

        this.get = function(index) {
            if (index === 0 || index === undefined) {
                return this.source;
            }

            return undefined;
        };

        this.find = function(selector) {
            return laroux.wrapper(selector, this.source);
        };
    };

    laroux.wrapper.arrayTemplate = function(elements) {
        this.source = elements;
        this.isArray = true;

        this.get = function(index) {
            return this.source[index];
        };
    };

    laroux.wrapper.registerBoth = 0;
    laroux.wrapper.registerSingle = 1;
    laroux.wrapper.registerArray = 2;

    laroux.wrapper.register = function(name, fnc, scope) {
        var newFnc = function() {
            var result = fnc.apply(
                this,
                [this.source].concat(laroux.helpers.toArray(arguments))
            );

            return (result === undefined) ? this : result;
        };

        switch (scope) {
            case laroux.wrapper.registerSingle:
                laroux.wrapper.singleTemplate.prototype[name] = newFnc;
                break;
            case laroux.wrapper.registerArray:
                laroux.wrapper.arrayTemplate.prototype[name] = newFnc;
                break;
            default:
                laroux.wrapper.singleTemplate.prototype[name] = newFnc;
                laroux.wrapper.arrayTemplate.prototype[name] = newFnc;
                break;
        }
    };

})(this.laroux);
;(function(laroux) {
    'use strict';

    // requires $l
    // requires $l.events
    // requires $l.helpers

    // ajax - partially taken from 'jquery in parts' project
    //        can be found at: https://github.com/mythz/jquip/
    laroux.ajax = {
        corsDefault: false,

        wrappers: {
            registry: {
                'laroux.js': function(data) {
                    if (!data.isSuccess) {
                        laroux.popupFunc('Error: ' + data.errorMessage);
                        return;
                    }

                    var obj;

                    if (data.format == 'json') {
                        obj = JSON.parse(data.object);
                    } else if (data.format == 'script') {
                        /* jshint evil:true */
                        obj = eval(data.object);
                    } else { // if (data.format == 'xml') {
                        obj = data.object;
                    }

                    return obj;
                }
            },

            set: function(name, fnc) {
                laroux.ajax.wrappers.registry[name] = fnc;
            }
        },

        xDomainObject: false,
        _xmlHttpRequestObject: null,
        _xDomainRequestObject: null,
        _xhr: function(crossDomain) {
            if (laroux.ajax._xmlHttpRequestObject === null) {
                laroux.ajax._xmlHttpRequestObject = new XMLHttpRequest();
            }

            if (crossDomain) {
                if (!('withCredentials' in laroux.ajax._xmlHttpRequestObject) && XDomainRequest !== undefined) {
                    laroux.ajax.xDomainObject = true;

                    if (laroux.ajax._xDomainRequestObject === null) {
                        laroux.ajax._xDomainRequestObject = new XDomainRequest();
                    }

                    return laroux.ajax._xDomainRequestObject;
                }
            } else {
                laroux.ajax.xDomainObject = false;
            }

            return laroux.ajax._xmlHttpRequestObject;
        },

        _xhrResp: function(xhr, options) {
            var wrapperFunction = xhr.getResponseHeader('X-Response-Wrapper-Function');
            var response;

            if (options.datatype === undefined) {
                response = xhr.responseText;
            } else if (options.datatype == 'json') {
                response = JSON.parse(xhr.responseText);
            } else if (options.datatype == 'script') {
                /* jshint evil:true */
                response = eval(xhr.responseText);
            } else if (options.datatype == 'xml') {
                response = xhr.responseXML;
            } else {
                response = xhr.responseText;
            }

            if (wrapperFunction && (wrapperFunction in laroux.ajax.wrappers.registry)) {
                response = laroux.ajax.wrappers.registry[wrapperFunction](response);
            }

            return {
                'response': response,
                'wrapperFunc': wrapperFunction
            };
        },

        makeRequest: function(options) {
            var cors = options.cors || laroux.ajax.corsDefault,
                xhr = laroux.ajax._xhr(cors),
                timer = null,
                n = 0;

            if (options.timeout !== undefined) {
                timer = setTimeout(
                    function() {
                        xhr.abort();
                        if (options.timeoutFn !== undefined) {
                            options.timeoutFn(options.url);
                        }
                    },
                    options.timeout
                );
            }

            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4) {
                    if (timer !== null) {
                        clearTimeout(timer);
                    }

                    if (xhr.status < 300) {
                        var res = null;
                        var isSuccess = true;

                        try {
                            res = laroux.ajax._xhrResp(xhr, options);
                        } catch (e) {
                            if (options.error !== undefined) {
                                options.error(xhr, xhr.status, xhr.statusText);
                            }

                            laroux.events.invoke('ajaxError', [xhr, xhr.status, xhr.statusText, options]);
                            isSuccess = false;
                        }

                        if (isSuccess) {
                            if (options.success !== undefined && res !== null) {
                                options.success(res.response, res.wrapperFunc);
                            }

                            laroux.events.invoke('ajaxSuccess', [xhr, res.response, res.wrapperFunc, options]);
                        }
                    } else {
                        if (options.error !== undefined) {
                            options.error(xhr, xhr.status, xhr.statusText);
                        }

                        laroux.events.invoke('ajaxError', [xhr, xhr.status, xhr.statusText, options]);
                    }

                    if (options.complete !== undefined) {
                        options.complete(xhr, xhr.statusText);
                    }

                    laroux.events.invoke('ajaxComplete', [xhr, xhr.statusText, options]);
                } else if (options.progress !== undefined) {
                    options.progress(++n);
                }
            };

            var url = options.url;
            if (options.getdata !== undefined && options.getdata !== null) {
                if (options.getdata.constructor === Object) {
                    var queryString = laroux.helpers.buildQueryString(options.getdata);
                    if (queryString.length > 0) {
                        url += ((url.indexOf('?') < 0) ? '?' : '&') + queryString;
                    }
                } else {
                    url += ((url.indexOf('?') < 0) ? '?' : '&') + options.getdata;
                }
            }

            if (options.jsonp !== undefined) {
                url += ((url.indexOf('?') < 0) ? '?' : '&') + 'jsonp=' + options.jsonp;
            }

            if (!laroux.ajax.xDomainObject) {
                xhr.open(options.type, url, true);
            } else {
                xhr.open(options.type, url);
            }

            try {
                if (options.xhrFields !== undefined) {
                    for (var i in options.xhrFields) {
                        if (!options.xhrFields.hasOwnProperty(i)) {
                            continue;
                        }

                        xhr[i] = options.xhrFields[i];
                    }
                }

                var headers = options.headers || {};

                if (!cors) {
                    headers['X-Requested-With'] = 'XMLHttpRequest';

                    if (options.wrapper) {
                        headers['X-Wrapper-Function'] = 'laroux.js';
                    }
                }

                for (var j in headers) {
                    if (!headers.hasOwnProperty(j)) {
                        continue;
                    }

                    xhr.setRequestHeader(j, headers[j]);
                }
            } catch(e) {
                console.log(e);
            }

            if (options.postdata === undefined || options.postdata === null) {
                xhr.send(null);
                return;
            }

            switch (options.postdatatype) {
                case 'json':
                    xhr.send(JSON.stringify(options.postdata));
                    break;
                case 'form':
                    xhr.send(laroux.helpers.buildFormData(options.postdata));
                    break;
                default:
                    xhr.send(options.postdata);
                    break;
            }
        },

        get: function(path, values, successfnc, errorfnc, cors) {
            laroux.ajax.makeRequest({
                type: 'GET',
                url: path,
                datatype: 'html',
                getdata: values,
                wrapper: true,
                cors: cors || laroux.ajax.corsDefault,
                success: successfnc,
                error: errorfnc
            });
        },

        getJson: function(path, values, successfnc, errorfnc, cors) {
            laroux.ajax.makeRequest({
                type: 'GET',
                url: path,
                datatype: 'json',
                getdata: values,
                wrapper: true,
                cors: cors || laroux.ajax.corsDefault,
                success: successfnc,
                error: errorfnc
            });
        },

        getJsonP: function(path, values, method, successfnc, errorfnc, cors) {
            laroux.ajax.makeRequest({
                type: 'GET',
                url: path,
                datatype: 'script',
                getdata: values,
                jsonp: method,
                wrapper: false,
                cors: cors || laroux.ajax.corsDefault,
                success: successfnc,
                error: errorfnc
            });
        },

        getScript: function(path, values, successfnc, errorfnc, cors) {
            laroux.ajax.makeRequest({
                type: 'GET',
                url: path,
                datatype: 'script',
                getdata: values,
                wrapper: false,
                cors: cors || laroux.ajax.corsDefault,
                success: successfnc,
                error: errorfnc
            });
        },

        post: function(path, values, successfnc, errorfnc, cors) {
            laroux.ajax.makeRequest({
                type: 'POST',
                url: path,
                datatype: 'json',
                postdata: values,
                postdatatype: 'form',
                wrapper: true,
                cors: cors || laroux.ajax.corsDefault,
                success: successfnc,
                error: errorfnc
            });
        },

        postJson: function(path, values, successfnc, errorfnc, cors) {
            laroux.ajax.makeRequest({
                type: 'POST',
                url: path,
                datatype: 'json',
                postdata: values,
                postdatatype: 'json',
                headers: {
                    'Content-Type': 'application/json; charset=UTF-8'
                },
                wrapper: true,
                cors: cors || laroux.ajax.corsDefault,
                success: successfnc,
                error: errorfnc
            });
        }
    };

})(this.laroux);
;(function(laroux) {
    'use strict';

    // requires $l.helpers
    // requires $l.dom

    // css
    laroux.css = {
        // class features
        hasClass: function(element, className) {
            return element.classList.contains(className);
        },

        addClass: function(element, className) {
            var elements = laroux.helpers.getAsArray(element);

            for (var i = 0, length = elements.length; i < length; i++) {
                elements[i].classList.add(className);
            }
        },

        removeClass: function(element, className) {
            var elements = laroux.helpers.getAsArray(element);

            for (var i = 0, length = elements.length; i < length; i++) {
                elements[i].classList.remove(className);
            }
        },

        toggleClass: function(element, className) {
            var elements = laroux.helpers.getAsArray(element);

            for (var i = 0, length = elements.length; i < length; i++) {
                if (elements[i].classList.contains(className)) {
                    elements[i].classList.remove(className);
                } else {
                    elements[i].classList.add(className);
                }
            }
        },

        cycleClass: function(elements, className) {
            for (var i = 0, length = elements.length; i < length; i++) {
                if (elements[i].classList.contains(className)) {
                    elements[i].classList.remove(className);
                    elements[(i + 1) % length].classList.add(className);
                    return;
                }
            }
        },

        // style features
        getProperty: function(element, styleName) {
            var style = getComputedStyle(element);

            styleName = laroux.helpers.antiCamelCase(styleName);

            return style.getPropertyValue(styleName);
        },

        setProperty: function(element, properties, value) {
            var elements = laroux.helpers.getAsArray(element);

            if (typeof properties == 'string') {
                var oldProperties = properties;
                properties = {};
                properties[oldProperties] = value;
            }

            for (var styleName in properties) {
                if (!properties.hasOwnProperty(styleName)) {
                    continue;
                }

                var newStyleName = laroux.helpers.camelCase(styleName);

                for (var i = 0, length = elements.length; i < length; i++) {
                    elements[i].style[newStyleName] = properties[styleName];
                }
            }
        },

        // transition features
        defaultTransition: '2s ease',

        setTransitionSingle: function(element, transition) {
            var transitions = laroux.helpers.getAsArray(transition),
                style = getComputedStyle(element),
                currentTransitions = style.getPropertyValue('transition') || style.getPropertyValue('-webkit-transition') ||
                    style.getPropertyValue('-ms-transition') || '',
                currentTransitionsArray;

            if (currentTransitions.length > 0) {
                currentTransitionsArray = currentTransitions.split(',');
            } else {
                currentTransitionsArray = [];
            }

            for (var item in transitions) {
                if (!transitions.hasOwnProperty(item)) {
                    continue;
                }

                var styleName,
                    transitionProperties,
                    pos = transitions[item].indexOf(' ');

                if (pos !== -1) {
                    styleName = transitions[item].substring(0, pos);
                    transitionProperties = transitions[item].substring(pos + 1);
                } else {
                    styleName = transitions[item];
                    transitionProperties = laroux.css.defaultTransition;
                }

                var found = false;
                for (var j = 0; j < currentTransitionsArray.length; j++) {
                    if (currentTransitionsArray[j].trim().localeCompare(styleName) === 0) {
                        currentTransitionsArray[j] = styleName + ' ' + transitionProperties;
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    currentTransitionsArray.push(styleName + ' ' + transitionProperties);
                }
            }

            var value = currentTransitionsArray.join(', ');

            element.style.transition = value;
            element.style.webkitTransition = value;
            element.style.msTransition = value;
        },

        setTransition: function(element, transition) {
            var elements = laroux.helpers.getAsArray(element);

            for (var i = 0, length = elements.length; i < length; i++) {
                laroux.css.setTransitionSingle(elements[i], transition);
            }
        },

        show: function(element, transitionProperties) {
            if (transitionProperties !== undefined) {
                laroux.css.setTransition(element, 'opacity ' + transitionProperties);
            } else {
                laroux.css.setTransition(element, 'opacity');
            }

            laroux.css.setProperty(element, {opacity: 1});
        },

        hide: function(element, transitionProperties) {
            if (transitionProperties !== undefined) {
                laroux.css.setTransition(element, 'opacity ' + transitionProperties);
            } else {
                laroux.css.setTransition(element, 'opacity');
            }

            laroux.css.setProperty(element, {opacity: 0});
        },

        // measurement features
        // height of element without padding, margin and border
        height: function(element) {
            var style = getComputedStyle(element),
                height = style.getPropertyCSSValue('height');

            return height.getFloatValue(height.primitiveType);
        },

        // height of element with padding but without margin and border
        innerHeight: function(element) {
            return element.clientHeight;
        },

        // height of element with padding and border but margin optional
        outerHeight: function(element, includeMargin) {
            if (includeMargin || false) {
                return element.offsetHeight;
            }

            var style = getComputedStyle(element),
                marginTop = style.getPropertyCSSValue('margin-top'),
                marginBottom = style.getPropertyCSSValue('margin-bottom'),
                margins = marginTop.getFloatValue(marginTop.primitiveType) +
                    marginBottom.getFloatValue(marginBottom.primitiveType);

            return Math.ceil(element.offsetHeight + margins);
        },

        // width of element without padding, margin and border
        width: function(element) {
            var style = getComputedStyle(element),
                height = style.getPropertyCSSValue('width');

            return height.getFloatValue(height.primitiveType);
        },

        // width of element with padding but without margin and border
        innerWidth: function(element) {
            return element.clientWidth;
        },

        // width of element with padding and border but margin optional
        outerWidth: function(element, includeMargin) {
            if (includeMargin || false) {
                return element.offsetWidth;
            }

            var style = getComputedStyle(element),
                marginLeft = style.getPropertyCSSValue('margin-left'),
                marginRight = style.getPropertyCSSValue('margin-right'),
                margins = marginLeft.getFloatValue(marginLeft.primitiveType) +
                    marginRight.getFloatValue(marginRight.primitiveType);

            return Math.ceil(element.offsetWidth + margins);
        },

        top: function(element) {
            return element.getBoundingClientRect().top +
                ((document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop);
        },

        left: function(element) {
            return element.getBoundingClientRect().left +
                ((document.documentElement && document.documentElement.scrollLeft) || document.body.scrollLeft);
        },

        aboveTheTop: function(element) {
            return element.getBoundingClientRect().bottom <= 0;
        },

        belowTheFold: function(element) {
            return element.getBoundingClientRect().top > laroux.parent.innerHeight;
        },

        leftOfScreen: function(element) {
            return element.getBoundingClientRect().right <= 0;
        },

        rightOfScreen: function(element) {
            return element.getBoundingClientRect().left > laroux.parent.innerWidth;
        },

        inViewport: function(element) {
            var rect = element.getBoundingClientRect();

            return !(rect.bottom <= 0 || rect.top > laroux.parent.innerHeight ||
                rect.right <= 0 || rect.left > laroux.parent.innerWidth);
        }
    };

    // wrapper support
    if (laroux.wrapper !== undefined) {
        laroux.wrapper.register('hasClass', laroux.css.hasClass, laroux.wrapper.registerSingle);
        laroux.wrapper.register('addClass', laroux.css.addClass, laroux.wrapper.registerBoth);
        laroux.wrapper.register('removeClass', laroux.css.removeClass, laroux.wrapper.registerBoth);
        laroux.wrapper.register('toggleClass', laroux.css.toggleClass, laroux.wrapper.registerBoth);
        laroux.wrapper.register('getProperty', laroux.css.getProperty, laroux.wrapper.registerSingle);
        laroux.wrapper.register('setProperty', laroux.css.setProperty, laroux.wrapper.registerBoth);
        laroux.wrapper.register('setTransition', laroux.css.setTransition, laroux.wrapper.registerBoth);
        laroux.wrapper.register('show', laroux.css.show, laroux.wrapper.registerBoth);
        laroux.wrapper.register('hide', laroux.css.hide, laroux.wrapper.registerBoth);
        laroux.wrapper.register('height', laroux.css.height, laroux.wrapper.registerSingle);
        laroux.wrapper.register('innerHeight', laroux.css.innerHeight, laroux.wrapper.registerSingle);
        laroux.wrapper.register('outerHeight', laroux.css.outerHeight, laroux.wrapper.registerSingle);
        laroux.wrapper.register('width', laroux.css.width, laroux.wrapper.registerSingle);
        laroux.wrapper.register('innerWidth', laroux.css.innerWidth, laroux.wrapper.registerSingle);
        laroux.wrapper.register('outerWidth', laroux.css.outerWidth, laroux.wrapper.registerSingle);
        laroux.wrapper.register('top', laroux.css.top, laroux.wrapper.registerSingle);
        laroux.wrapper.register('left', laroux.css.left, laroux.wrapper.registerSingle);
        laroux.wrapper.register('aboveTheTop', laroux.css.aboveTheTop, laroux.wrapper.registerSingle);
        laroux.wrapper.register('belowTheFold', laroux.css.belowTheFold, laroux.wrapper.registerSingle);
        laroux.wrapper.register('leftOfScreen', laroux.css.leftOfScreen, laroux.wrapper.registerSingle);
        laroux.wrapper.register('rightOfScreen', laroux.css.rightOfScreen, laroux.wrapper.registerSingle);
        laroux.wrapper.register('inViewport', laroux.css.inViewport, laroux.wrapper.registerSingle);
    }

})(this.laroux);
;(function(laroux) {
    'use strict';

    // requires $l.helpers
    // requires $l.triggers

    // dom
    laroux.dom = {
        docprop: function(propName) {
            return document.documentElement.classList.contains(propName);
        },

        select: function(selector, parent) {
            return laroux.helpers.toArray(
                (parent || document).querySelectorAll(selector)
            );
        },

        selectByClass: function(selector, parent) {
            return laroux.helpers.toArray(
                (parent || document).getElementsByClassName(selector)
            );
        },

        selectByTag: function(selector, parent) {
            return laroux.helpers.toArray(
                (parent || document).getElementsByTagName(selector)
            );
        },

        selectById: function(selector, parent) {
            return (parent || document).getElementById(selector);
        },

        selectSingle: function(selector, parent) {
            return (parent || document).querySelector(selector);
        },

        attr: function(element, attributes, value) {
            if (value === undefined && attributes.constructor !== Object) {
                return element.getAttribute(attributes);
            }

            var elements = laroux.helpers.getAsArray(element);
            if (typeof attributes == 'string') {
                var oldAttributes = attributes;
                attributes = {};
                attributes[oldAttributes] = value;
            }

            for (var attributeName in attributes) {
                if (!attributes.hasOwnProperty(attributeName)) {
                    continue;
                }

                for (var i = 0, length = elements.length; i < length; i++) {
                    if (attributes[attributeName] === null) {
                        element.removeAttribute(attributeName);
                    } else {
                        element.setAttribute(attributeName, attributes[attributeName]);
                    }
                }
            }
        },

        data: function(element, datanames, value) {
            if (value === undefined && datanames.constructor !== Object) {
                return element.getAttribute('data-' + datanames);
            }

            var elements = laroux.helpers.getAsArray(element);
            if (typeof datanames == 'string') {
                var oldDatanames = datanames;
                datanames = {};
                datanames[oldDatanames] = value;
            }

            for (var dataName in datanames) {
                if (!datanames.hasOwnProperty(dataName)) {
                    continue;
                }

                for (var i = 0, length = elements.length; i < length; i++) {
                    if (datanames[dataName] === null) {
                        element.removeAttribute('data-' + dataName);
                    } else {
                        element.setAttribute('data-' + dataName, datanames[dataName]);
                    }
                }
            }
        },

        eventHistory: [],
        setEvent: function(element, eventname, fnc) {
            var elements = laroux.helpers.getAsArray(element);

            for (var i = 0, length = elements.length; i < length; i++) {
                laroux.dom.setEventSingle(elements[i], eventname, fnc);
            }
        },

        setEventSingle: function(element, eventname, fnc) {
            var fncWrapper = function(e) {
                if (fnc(e, element) === false) {
                    if (e.preventDefault) {
                        e.preventDefault();
                    } else {
                        laroux.parent.event.returnValue = false;
                    }
                }
            };

            laroux.dom.eventHistory.push({element: element, eventname: eventname, fnc: fnc, fncWrapper: fncWrapper});
            element.addEventListener(eventname, fncWrapper, false);
        },

        unsetEvent: function(element, eventname, fnc) {
            var elements = laroux.helpers.getAsArray(element);

            for (var i1 = 0, length1 = elements.length; i1 < length1; i1++) {
                for (var i2 = 0, length2 = laroux.dom.eventHistory.length; i2 < length2; i2++) {
                    var item = laroux.dom.eventHistory[i2];

                    if (item === undefined) {
                        continue;
                    }

                    if (item.element !== elements[i1]) {
                        continue;
                    }

                    if (eventname !== undefined && item.eventname !== eventname) {
                        continue;
                    }

                    if (fnc !== undefined && item.fnc !== fnc) {
                        continue;
                    }

                    item.element.removeEventListener(item.eventname, item.fncWrapper, false);
                    delete laroux.dom.eventHistory[i2];
                }
            }
        },

        dispatchEvent: function(element, eventname, data) {
            var customEvent = document.createEvent('Event');
            for (var item in data) {
                if (!data.hasOwnProperty(item)) {
                    continue;
                }

                customEvent[item] = data[item];
            }

            customEvent.initEvent(eventname, true, true);
            element.dispatchEvent(customEvent);
        },

        create: function(html) {
            var frag = document.createDocumentFragment(),
                temp = document.createElement('DIV');

            temp.insertAdjacentHTML('beforeend', html);
            while (temp.firstChild) {
                frag.appendChild(temp.firstChild);
            }

            // nulling out the reference, there is no obvious dispose method
            temp = null;

            return frag;
        },

        createElement: function(element, attributes, children) {
            var elem = document.createElement(element);

            if (attributes !== undefined && attributes.constructor === Object) {
                for (var item in attributes) {
                    if (!attributes.hasOwnProperty(item)) {
                        continue;
                    }

                    elem.setAttribute(item, attributes[item]);
                }
            }

            if (children !== undefined) {
                if (children.constructor === Object) {
                    for (var item2 in children) {
                        if (!children.hasOwnProperty(item2)) {
                            continue;
                        }

                        elem.setAttribute(item2, children[item2]);
                    }
                } else if (/* typeof children == 'string' && */children.length > 0) {
                    laroux.dom.append(elem, children);
                }
            }

            return elem;
        },

        createOption: function(element, key, value, isDefault) {
            /* old behaviour, does not support optgroups as parents.
            var count = element.options.length;
            element.options[count] = new Option(value, key);

            if (isDefault === true) {
                element.options.selectedIndex = count - 1;
            }
            */

            var option = document.createElement('OPTION');
            option.setAttribute('value', key);
            if (isDefault === true) {
                option.setAttribute('checked', 'checked');
            }

            laroux.dom.append(option, value);
            element.appendChild(option);
        },

        selectByValue: function(element, value) {
            for (var i = 0, length = element.options.length; i < length; i++) {
                if (element.options[i].getAttribute('value') == value) {
                    element.selectedIndex = i;
                    break;
                }
            }
        },/*,

        // TODO: it's redundant for now
        loadImage: function() {
            var images = [];

            for (var i = 0, length = arguments.length; i < length; i++) {
                var image = document.createElement('IMG');
                image.setAttribute('src', arguments[i]);

                images.push(image);
            }

            return images;
        },

        loadAsyncScript: function(path, triggerName, async) {
            var elem = document.createElement('script');

            elem.type = 'text/javascript';
            elem.async = (async !== undefined) ? async : true;
            elem.src = path;

            var loaded = false;
            elem.onload = elem.onreadystatechange = function() {
                if ((elem.readyState && elem.readyState !== 'complete' && elem.readyState !== 'loaded') || loaded) {
                    return false;
                }

                elem.onload = elem.onreadystatechange = null;
                loaded = true;
                if (triggerName) {
                    if (typeof triggerName == 'function') {
                        triggerName();
                    } else {
                        laroux.triggers.ontrigger(triggerName);
                    }
                }
            };

            var head = document.getElementsByTagName('head')[0];
            head.appendChild(elem);
        },

        loadAsyncStyle: function(path, triggerName, async) {
            var elem = document.createElement('LINK');

            elem.type = 'text/css';
            elem.async = (async !== undefined) ? async : true;
            elem.href = path;
            elem.rel = 'stylesheet';

            var loaded = false;
            elem.onload = elem.onreadystatechange = function() {
                if ((elem.readyState && elem.readyState !== 'complete' && elem.readyState !== 'loaded') || loaded) {
                    return false;
                }

                elem.onload = elem.onreadystatechange = null;
                loaded = true;
                if (triggerName) {
                    if (typeof triggerName == 'function') {
                        triggerName();
                    } else {
                        laroux.triggers.ontrigger(triggerName);
                    }
                }
            };

            var head = document.getElementsByTagName('head')[0];
            head.appendChild(elem);
        },*/

        clear: function(element) {
            while (element.hasChildNodes()) {
                element.removeChild(element.firstChild);
            }
        },

        insert: function(element, position, content) {
            element.insertAdjacentHTML(position, content);
        },

        prepend: function(element, content) {
            element.insertAdjacentHTML('afterbegin', content);
        },

        append: function(element, content) {
            element.insertAdjacentHTML('beforeend', content);
        },

        replace: function(element, content) {
            laroux.dom.clear(element);
            element.insertAdjacentHTML('afterbegin', content);
        },

        replaceText: function(element, content) {
            // laroux.dom.clear(element);
            element.textContent = content;
        },

        remove: function(element) {
            element.remove();
        },

        cloneReturn: 0,
        cloneAppend: 1,
        cloneInsertAfter: 2,
        cloneInsertBefore: 3,

        clone: function(element, type, container, target) {
            var newElement = element.cloneNode(true);

            if (container === undefined) {
                container = element.parentNode;
            }
            if (target === undefined) {
                target = element;
            }

            if (type !== undefined && type != laroux.dom.cloneReturn) {
                if (type == laroux.dom.cloneAppend) {
                    container.appendChild(newElement);
                } else if (type == laroux.dom.cloneInsertAfter) {
                    container.insertBefore(newElement, target.nextSibling);
                } else { // type == laroux.dom.cloneInsertBefore
                    container.insertBefore(newElement, target);
                }
            }

            return newElement;
        }/*,

        // TODO: it's redundant for now
        applyOperations: function(element, operations) {
            for (var operation in operations) {
                if (!operations.hasOwnProperty(operation)) {
                    continue;
                }

                for (var binding in operations[operation]) {
                    if (!operations[operation].hasOwnProperty(binding)) {
                        continue;
                    }

                    var value = operations[operation][binding];

                    switch (operation) {
                        case 'setprop':
                            if (binding.substring(0, 1) == '_') {
                                element.setAttribute(binding.substring(1), value);
                                continue;
                            }

                            if (binding == 'content') {
                                laroux.dom.replace(element, value);
                                continue;
                            }
                            break;
                        case 'addprop':
                            if (binding.substring(0, 1) == '_') {
                                element.setAttribute(binding.substring(1), element.getAttribute(binding.substring(1)) + value);
                                continue;
                            }

                            if (binding == 'content') {
                                laroux.dom.append(element, value);
                                continue;
                            }
                            break;
                        case 'removeprop':
                            if (value.substring(0, 1) == '_') {
                                element.removeAttribute(value.substring(1));
                                continue;
                            }

                            if (value == 'content') {
                                laroux.dom.clear(element);
                                continue;
                            }
                            break;
                        case 'addclass':
                            laroux.css.addClass(element, value);
                            break;
                        case 'removeclass':
                            laroux.css.removeClass(element, value);
                            break;
                        case 'addstyle':
                            laroux.css.setProperty(element, binding, value);
                            break;
                        case 'removestyle':
                            laroux.css.setProperty(element, value, 'inherit !important');
                            break;
                        case 'repeat':
                            break;
                        default:
                            console.log(operation);
                    }
                }
            }
        }*/
    };

    // wrapper support
    if (laroux.wrapper !== undefined) {
        laroux.wrapper.register('attr', laroux.dom.attr, laroux.wrapper.registerSingle);
        laroux.wrapper.register('data', laroux.dom.data, laroux.wrapper.registerSingle);
        laroux.wrapper.register('on', laroux.dom.setEventSingle, laroux.wrapper.registerSingle);
        laroux.wrapper.register('on', laroux.dom.setEvent, laroux.wrapper.registerArray);
        laroux.wrapper.register('off', laroux.dom.unsetEvent, laroux.wrapper.registerBoth);
        laroux.wrapper.register('clear', laroux.dom.clear, laroux.wrapper.registerSingle);
        laroux.wrapper.register('insert', laroux.dom.insert, laroux.wrapper.registerSingle);
        laroux.wrapper.register('prepend', laroux.dom.prepend, laroux.wrapper.registerSingle);
        laroux.wrapper.register('append', laroux.dom.append, laroux.wrapper.registerSingle);
        laroux.wrapper.register('replace', laroux.dom.replace, laroux.wrapper.registerSingle);
        laroux.wrapper.register('replaceText', laroux.dom.replaceText, laroux.wrapper.registerSingle);
        laroux.wrapper.register('remove', laroux.dom.remove, laroux.wrapper.registerSingle);
    }

    // a fix for Internet Explorer
    if (Element.prototype.remove === undefined) {
        Element.prototype.remove = function() {
            if (this.parentElement !== null) {
                this.parentElement.removeChild(this);
            }
        };
    }

})(this.laroux);
;(function(laroux) {
    'use strict';

    // events
    laroux.events = {
        delegates: [],

        add: function(event, fnc) {
            laroux.events.delegates.push({event: event, fnc: fnc});
        },

        invoke: function(event, args) {
            for (var item in laroux.events.delegates) {
                if (!laroux.events.delegates.hasOwnProperty(item)) {
                    continue;
                }

                if (laroux.events.delegates[item].event != event) {
                    continue;
                }

                laroux.events.delegates[item].fnc(args);
            }
        },
    };

})(this.laroux);
;(function(laroux) {
    'use strict';

    // forms
    laroux.forms = {
        ajaxForm: function(formobj, fnc, fncBegin) {
            laroux.dom.setEvent(formobj, 'submit', function() {
                if (fncBegin !== undefined) {
                    fncBegin();
                }

                laroux.ajax.post(
                    formobj.getAttribute('action'),
                    laroux.forms.serializeFormData(formobj),
                    fnc
                );

                return false;
            });
        },

        isFormField: function(element) {
            if (element.tagName == 'SELECT') {
                return true;
            }

            if (element.tagName == 'INPUT') {
                var type = element.getAttribute('type').toUpperCase();

                if (type == 'FILE' || type == 'CHECKBOX' || type == 'RADIO' || type == 'TEXT' || type == 'PASSWORD' || type == 'HIDDEN') {
                    return true;
                }

                return false;
            }

            if (element.tagName == 'TEXTAREA') {
                return true;
            }

            return false;
        },

        getFormFieldValue: function(element) {
            if (element.disabled === true) {
                return null;
            }

            if (element.tagName == 'SELECT') {
                return element.options[element.selectedIndex].value;
            }

            if (element.tagName == 'INPUT') {
                var type = element.getAttribute('type').toUpperCase();

                if (type == 'FILE') {
                    return element.files[0];
                }

                if (type == 'CHECKBOX' || type == 'RADIO') {
                    if (element.checked) {
                        return element.value;
                    }

                    return null;
                }

                if (type == 'TEXT' || type == 'PASSWORD' || type == 'HIDDEN') {
                    return element.value;
                }

                return null;
            }

            if (element.tagName == 'TEXTAREA') {
                return element.value;
            }

            return null;
        },

        setFormFieldValue: function(element, value) {
            if (element.disabled === true) {
                return;
            }

            if (element.tagName == 'SELECT') {
                for (var option in element.options) {
                    if (!element.options.hasOwnProperty(option)) {
                        continue;
                    }

                    if (element.options[option].value == value) {
                        element.selectedIndex = option;
                        return;
                    }
                }

                return;
            }

            if (element.tagName == 'INPUT') {
                var type = element.getAttribute('type').toUpperCase();

                if (type == 'FILE') {
                    element.files[0] = value;
                    return;
                }

                if (type == 'CHECKBOX' || type == 'RADIO') {
                    if (value === true || value == element.value) {
                        element.checked = true;
                    }

                    return;
                }

                if (type == 'TEXT' || type == 'PASSWORD' || type == 'HIDDEN') {
                    element.value = value;
                    return;
                }

                return;
            }

            if (element.tagName == 'TEXTAREA') {
                element.value = value;
                return;
            }
        },

        toggleFormEditing: function(formobj, value) {
            var selection = formobj.querySelectorAll('*[name]');

            if (value === undefined) {
                if (formobj.getAttribute('data-last-enabled') === null) {
                    formobj.setAttribute('data-last-enabled', 'enabled');
                    value = false;
                } else {
                    formobj.removeAttribute('data-last-enabled');
                    value = true;
                }
            }

            for (var selected = 0, length = selection.length; selected < length; selected++) {
                if (!laroux.forms.isFormField(selection[selected])) {
                    continue;
                }

                var lastDisabled = selection[selected].getAttribute('data-last-disabled');
                if (!value) {
                    if (lastDisabled === null) {
                        if (selection[selected].getAttribute('disabled') !== null) {
                            selection[selected].setAttribute('data-last-disabled', 'disabled');
                        }
                    }

                    selection[selected].setAttribute('disabled', 'disabled');
                    continue;
                }

                if (lastDisabled !== null) {
                    selection[selected].removeAttribute('data-last-disabled');
                } else {
                    selection[selected].removeAttribute('disabled');
                }
            }
        },

        serializeFormData: function(formobj) {
            var formdata = new FormData();
            var selection = formobj.querySelectorAll('*[name]');

            for (var selected = 0, length = selection.length; selected < length; selected++) {
                var value = laroux.forms.getFormFieldValue(selection[selected]);

                if (value !== null) {
                    formdata.append(selection[selected].getAttribute('name'), value);
                }
            }

            return formdata;
        },

        serialize: function(formobj) {
            var values = {};
            var selection = formobj.querySelectorAll('*[name]');

            for (var selected = 0, length = selection.length; selected < length; selected++) {
                var value = laroux.forms.getFormFieldValue(selection[selected]);

                if (value !== null) {
                    values[selection[selected].getAttribute('name')] = value;
                }
            }

            return values;
        },

        deserialize: function(formobj, data) {
            var selection = formobj.querySelectorAll('*[name]');

            for (var selected = 0, length = selection.length; selected < length; selected++) {
                laroux.forms.setFormFieldValue(selection[selected], data[selection[selected].getAttribute('name')]);
            }
        }
    };

})(this.laroux);
;(function(laroux) {
    'use strict';

    // helpers
    laroux.helpers = {
        uniqueId: 0,

        getUniqueId: function() {
            return 'uid-' + (++laroux.helpers.uniqueId);
        },

        buildQueryString: function(values, rfc3986) {
            var uri = '';
            var regEx = /%20/g;

            for (var name in values) {
                if (!values.hasOwnProperty(name)) {
                    continue;
                }

                if (typeof values[name] != 'function') {
                    if (rfc3986 || false) {
                        uri += '&' + encodeURIComponent(name).replace(regEx, '+') + '=' + encodeURIComponent(values[name].toString()).replace(regEx, '+');
                    } else {
                        uri += '&' + encodeURIComponent(name) + '=' + encodeURIComponent(values[name].toString());
                    }
                }
            }

            return uri.substr(1);
        },

        buildFormData: function(values) {
            var data = new FormData();

            for (var name in values) {
                if (!values.hasOwnProperty(name)) {
                    continue;
                }

                if (typeof values[name] != 'function') {
                    data.append(name, values[name]);
                }
            }

            return data;
        },

        format: function() {
            var args = arguments;
            return Array.prototype.shift.call(args).replace(/%s/g, function() { return Array.prototype.shift.call(args); });
        },

        replaceAll: function(text, dictionary) {
            var re = new RegExp(Object.keys(dictionary).join('|'), 'g');

            return text.replace(
                re,
                function(match) {
                    return dictionary[match];
                }
            );
        },

        camelCase: function(value) {
            var flag = false;
            var output = '';

            for (var j = 0; j < value.length; j++) {
                var currChar = value.charAt(j);
                if (currChar == '-') {
                    flag = true;
                    continue;
                }

                output += (!flag) ? currChar : currChar.toUpperCase();
                flag = false;
            }

            return output;
        },

        antiCamelCase: function(value) {
            var output = '';

            for (var j = 0; j < value.length; j++) {
                var currChar = value.charAt(j);
                if (currChar != '-' && currChar == currChar.toUpperCase()) {
                    output += '-' + currChar.toLowerCase();
                    continue;
                }

                output += currChar;
            }

            return output;
        },

        quoteAttr: function(value) {
            return value.replace(/&/g, '&amp;')
                        .replace(/'/g, '&apos;')
                        .replace(/"/g, '&quot;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;')
                        .replace(/"/g, '&quot;')
                        .replace(/\r\n/g, '&#13;')
                        .replace(/[\r\n]/g, '&#13;');
        },

        spliceString: function(value, index, count, add) {
            return value.slice(0, index) + (add || '') + value.slice(index + count);
        },

        random: function(min, max) {
            return min + Math.floor(Math.random() * (max - min + 1));
        },

        find: function(obj, iterator, context) {
            var result;

            obj.some(function(value, index, list) {
                if (iterator.call(context, value, index, list)) {
                    result = value;
                    return true;
                }
            });

            return result;
        },

        column: function(obj, key) {
            return laroux.map(obj, function(value) { return value[key]; }, true);
        },

        shuffle: function(obj) {
            var index = 0,
                shuffled = [];

            for (var item in obj) {
                if (!obj.hasOwnProperty(item)) {
                    continue;
                }

                var rand = laroux.helpers.random(0, index);
                shuffled[index++] = shuffled[rand];
                shuffled[rand] = obj[item];
            }

            return shuffled;
        },

        merge: function() {
            var target = Array.prototype.shift.call(arguments),
                tmp = target,
                isArray = tmp instanceof Array;

            for (var item in arguments) {
                if (isArray) {
                    tmp = tmp.concat(arguments[item]);
                    continue;
                }

                for (var attr in arguments[item]) {
                    if (!arguments[item].hasOwnProperty(attr)) {
                        continue;
                    }

                    tmp[attr] = arguments[item][attr];
                }
            }

            return tmp;
        },

        duplicate: function(obj) {
            return JSON.parse(JSON.stringify(obj));
        },

        toArray: function(obj) {
            var length = obj.length,
                items = new Array(length);

            for (var i = 0; i < length; i++) {
                items[i] = obj[i];
            }

            return items;
        },

        getAsArray: function(obj) {
            var items;

            if (obj instanceof Array) {
                items = obj;
            } else if (obj instanceof NodeList) {
                var length = obj.length;

                items = new Array(length);
                for (var i = 0; i < length; i++) {
                    items[i] = obj[i];
                }
            } else {
                items = [obj];
            }

            return items;
        },

        getLength: function(obj) {
            if (obj.constructor === Object) {
                if (obj.length !== undefined) {
                    return obj.length;
                }

                return Object.keys(obj).length;
            }

            return -1;
        },

        getKeysRecursive: function(obj, delimiter, prefix, keys) {
            if (delimiter === undefined) {
                delimiter = '.';
            }

            if (prefix === undefined) {
                prefix = '';
                keys = [];
            }

            for (var item in obj) {
                if (!obj.hasOwnProperty(item)) {
                    continue;
                }

                keys.push(prefix + item);

                if (obj[item] !== undefined && obj[item] !== null && obj[item].constructor === Object) {
                    laroux.helpers.getKeysRecursive(obj[item], delimiter, prefix + item + delimiter, keys);
                    continue;
                }
            }

            return keys;
        },

        getElement: function(obj, path, defaultValue, delimiter) {
            if (defaultValue === undefined) {
                defaultValue = null;
            }

            if (delimiter === undefined) {
                delimiter = '.';
            }

            var pos = path.indexOf(delimiter);
            var key;
            var rest;
            if (pos === -1) {
                key = path;
                rest = null;
            } else {
                key = path.substring(0, pos);
                rest = path.substring(pos + 1);
            }

            if (!(key in obj)) {
                return defaultValue;
            }

            if (rest === null || rest.length === 0) {
                return obj[key];
            }

            return laroux.helpers.getElement(obj[key], rest, defaultValue, delimiter);
        },
        /* for javascript 1.7 or later,

        getKeys: function(obj) {
            var keys = Object.keys(obj);
            for (var item in keys) {
                yield keys[item];
            }
        } */
    };

})(this.laroux);
;(function(laroux) {
    'use strict';

    // requires $l

    // timers
    laroux.timers = {
        data: [],

        set: function(timer) {
            timer.next = Date.now() + timer.timeout;
            laroux.timers.data.push(timer);
        },

        remove: function(id) {
            var targetKey = null;

            for (var item in laroux.timers.data) {
                if (!laroux.timers.data.hasOwnProperty(item)) {
                    continue;
                }

                var currentItem = laroux.timers.data[item];

                if (currentItem.id !== undefined && currentItem.id == id) {
                    targetKey = item;
                    break;
                }
            }

            if (targetKey !== null) {
                laroux.timers.data.splice(targetKey, 1);
                return true;
            }

            return false;
        },

        ontick: function() {
            var now = Date.now();

            var removeKeys = [];
            for (var item in laroux.timers.data) {
                if (!laroux.timers.data.hasOwnProperty(item)) {
                    continue;
                }

                var currentItem = laroux.timers.data[item];

                if (currentItem.next <= now) {
                    var result = currentItem.ontick(currentItem.state);

                    if (result !== false && currentItem.reset) {
                        currentItem.next = now + currentItem.timeout;
                    } else {
                        removeKeys.unshift(item);
                    }
                }
            }

            for (var item2 in removeKeys) {
                if (!removeKeys.hasOwnProperty(item2)) {
                    continue;
                }

                laroux.timers.data.splice(removeKeys[item2], 1);
            }
        }
    };

    laroux.ready(function() {
        setInterval(laroux.timers.ontick, 100);
    });

})(this.laroux);
;(function(laroux) {
    'use strict';

    // requires $l.helpers

    // triggers
    laroux.triggers = {
        delegates: [],
        list: [],

        set: function(condition, fnc, state) {
            var conditions = laroux.helpers.getAsArray(condition);

            for (var item in conditions) {
                if (!conditions.hasOwnProperty(item)) {
                    continue;
                }

                if (laroux.aindex(laroux.triggers.list, conditions[item]) === -1) {
                    laroux.triggers.list.push(conditions[item]);
                }
            }

            laroux.triggers.delegates.push({
                conditions: conditions,
                fnc: fnc,
                state: state
            });
        },

        ontrigger: function(triggerName, args) {
            var eventIdx = laroux.aindex(laroux.triggers.list, triggerName);
            if (eventIdx !== -1) {
                laroux.triggers.list.splice(eventIdx, 1);
            }

            var removeKeys = [];
            for (var item in laroux.triggers.delegates) {
                if (!laroux.triggers.delegates.hasOwnProperty(item)) {
                    continue;
                }

                var count = 0;
                var currentItem = laroux.triggers.delegates[item];

                for (var conditionKey in currentItem.conditions) {
                    if (!currentItem.conditions.hasOwnProperty(conditionKey)) {
                        continue;
                    }

                    var conditionObj = currentItem.conditions[conditionKey];

                    if (laroux.aindex(laroux.triggers.list, conditionObj) !== -1) {
                        count++;
                        // break;
                    }
                }

                if (count === 0) {
                    currentItem.fnc(
                        {
                            state: currentItem.state,
                            args: laroux.helpers.getAsArray(args)
                        }
                    );
                    removeKeys.unshift(item);
                }
            }

            for (var item2 in removeKeys) {
                if (!removeKeys.hasOwnProperty(item2)) {
                    continue;
                }

                laroux.triggers.delegates.splice(removeKeys[item2], 1);
            }

            // console.log('trigger name: ' + triggerName);
        }
    };

})(this.laroux);
;(function(laroux) {
    'use strict';

    // requires $l

    // vars
    laroux.vars = {
        cookiePath: '/',

        getCookie: function(name, defaultValue) {
            var re = new RegExp(encodeURIComponent(name) + '=[^;]+', 'i');
            var match = document.cookie.match(re);
            
            if (!match) {
                return defaultValue || null;
            }

            return decodeURIComponent(match[0].split('=')[1]);
        },

        setCookie: function(name, value, expires, path) {
            var expireValue = '';
            if (expires) {
                expireValue = '; expires=' + expires.toGMTString();
            }

            document.cookie = encodeURIComponent(name) + '=' + encodeURIComponent(value) + expireValue + '; path=' + (path || laroux.vars.cookiePath);
        },

        removeCookie: function(name, path) {
            document.cookie = encodeURIComponent(name) + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=' + (path || laroux.vars.cookiePath);
        },

        getLocal: function(name, defaultValue) {
            if (!(name in localStorage)) {
                return defaultValue || null;
            }

            return JSON.parse(localStorage[name]);
        },

        setLocal: function(name, value) {
            localStorage[name] = JSON.stringify(value);
        },

        removeLocal: function(name) {
            delete localStorage[name];
        },

        getSession: function(name, defaultValue) {
            if (!(name in sessionStorage)) {
                return defaultValue || null;
            }

            return JSON.parse(sessionStorage[name]);
        },

        setSession: function(name, value) {
            sessionStorage[name] = JSON.stringify(value);
        },

        removeSession: function(name) {
            delete sessionStorage[name];
        }
    };

})(this.laroux);
;(function(laroux) {
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
