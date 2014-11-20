(function() {
    "use strict";

    // core
    var laroux = function(selector, parent) {
        if (selector instanceof Array) {
            var elements;
            if (typeof parent == 'undefined') {
                elements = document.querySelectorAll(selector);
            } else {
                elements = parent.querySelectorAll(selector);
            }

            return Array.prototype.slice.call(elements);
        }

        /*
        -- non-chrome optimization
        var re = /^#([^\+\>\[\]\.# ]*)$/.exec(selector);
        if (re) {
            if (typeof parent == 'undefined') {
                return document.getElementById(re[1]);
            }

            return parent.getElementById(re[1]);
        }
        */

        if (typeof parent == 'undefined') {
            return document.querySelector(selector);
        }

        return parent.querySelector(selector);
    };

    laroux.id = function(selector, parent) {
        if (typeof parent == 'undefined') {
            return document.getElementById(selector);
        }

        return parent.getElementById(selector);
    };

    laroux.baseLocation = '';
    laroux.selectedMaster = '';
    laroux.popupFunc = alert;
    laroux.readyPassed = false;

    laroux.contentBegin = function(masterName, locationUrl) {
        laroux.baseLocation = locationUrl;
        laroux.selectedMaster = masterName;
    };

    laroux.contentEnd = function() {
        if (!laroux.readyPassed) {
            laroux.events.invoke('contentEnd');
            laroux.readyPassed = true;
        }
    };

    laroux.ready = function(fnc) {
        if (!laroux.readyPassed) {
            laroux.events.add('contentEnd', fnc);
            return;
        }

        fnc();
    };

    laroux.extend = function(obj) {
        for (var name in obj) {
            if (laroux.hasOwnProperty(name)) {
                continue;
            }

            laroux[name] = obj[name];
        }
    };

    laroux.each = function(arr, fnc) {
        for (var key in arr) {
            if (fnc(key, arr[key]) === false) {
                break;
            }
        }

        return arr;
    };

    laroux.map = function(arr, fnc) {
        var results = [];

        /*
        -- non-chrome optimization
        if (typeof arr.length != 'undefined') {
            for (var i = arr.length; i >= 0; i--) {
                var result = fnc(arr[i], i);
                if (result === false) {
                    break;
                }

                if (typeof result !== 'undefined') {
                    results.unshift(result);
                }
            }

            return results;
        }
        */

        for (var key in arr) {
            var result = fnc(arr[key], key);
            if (result === false) {
                break;
            }

            if (typeof result !== 'undefined') {
                results.push(result);
            }
        }

        return results;
    };

    laroux.aeach = function(arr, fnc) {
        for (var i = arr.length - 1; i >= 0; i--) {
            if (fnc(i, arr[i]) === false) {
                break;
            }
        }

        return arr;
    };

    laroux.amap = function(arr, fnc) {
        var results = [];

        for (var i = arr.length - 1; i >= 0; i--) {
            var result = fnc(arr[i], i);
            if (result === false) {
                break;
            }

            if (typeof result !== 'undefined') {
                results.unshift(result);
            }
        }

        return results;
    };

    // initialization
    this.$l = this.laroux = laroux;

    document.addEventListener('DOMContentLoaded', laroux.contentEnd);

}).call(this);
;(function(laroux) {
    "use strict";

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
                if (!('withCredentials' in laroux.ajax._xmlHttpRequestObject) && typeof XDomainRequest != 'undefined') {
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

            if (typeof options.datatype == 'undefined') {
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

            if (wrapperFunction !== null && typeof laroux.ajax.wrappers.registry[wrapperFunction] != 'undefined') {
                response = laroux.ajax.wrappers.registry[wrapperFunction](response);
            }

            return {
                'response': response,
                'wrapperFunc': wrapperFunction
            };
        },

        makeRequest: function(options) {
            var cors = laroux.ajax.corsDefault;
            if (typeof options.cors != 'undefined') {
                cors = options.cors;
            }

            var xhr = laroux.ajax._xhr(cors);
            var timer = null;
            var n = 0;

            if (typeof options.timeout != 'undefined') {
                timer = setTimeout(
                    function() {
                        xhr.abort();
                        if (typeof options.timeoutFn != 'undefined') {
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
                            if (typeof options.error != 'undefined') {
                                options.error(xhr, xhr.status, xhr.statusText);
                            }

                            laroux.events.invoke('ajaxError', [xhr, xhr.status, xhr.statusText, options]);
                            isSuccess = false;
                        }

                        if (isSuccess) {
                            if (typeof options.success != 'undefined' && res !== null) {
                                options.success(res.response, res.wrapperFunc);
                            }

                            laroux.events.invoke('ajaxSuccess', [xhr, res.response, res.wrapperFunc, options]);
                        }
                    } else {
                        if (typeof options.error != 'undefined') {
                            options.error(xhr, xhr.status, xhr.statusText);
                        }

                        laroux.events.invoke('ajaxError', [xhr, xhr.status, xhr.statusText, options]);
                    }

                    if (typeof options.complete != 'undefined') {
                        options.complete(xhr, xhr.statusText);
                    }

                    laroux.events.invoke('ajaxComplete', [xhr, xhr.statusText, options]);
                } else if (typeof options.progress != 'undefined') {
                    options.progress(++n);
                }
            };

            var url = options.url;
            if (typeof options.getdata == 'object') {
                var queryString = laroux.helpers.buildQueryString(options.getdata);
                if (queryString.length > 0) {
                    url += ((url.indexOf('?') < 0) ? '?' : '&') + queryString;
                }
            }

            if (typeof options.jsonp != 'undefined') {
                url += ((url.indexOf('?') < 0) ? '?' : '&') + 'jsonp=' + options.jsonp;
            }

            if (!laroux.ajax.xDomainObject) {
                xhr.open(options.type, url, true);
            } else {
                xhr.open(options.type, url);
            }

            try {
                if (typeof options.xhrFields != 'undefined') {
                    for (var i in options.xhrFields) {
                        if (!options.xhrFields.hasOwnProperty(i)) {
                            continue;
                        }

                        xhr[i] = options.xhrFields[i];
                    }
                }

                if (typeof options.headers != 'undefined') {
                    for (var j in options.headers) {
                        if (!options.headers.hasOwnProperty(j)) {
                            continue;
                        }

                        xhr.setRequestHeader(j, options.headers[j]);
                    }
                }
            } catch(e) {
                console.log(e);
            }

            var data = null;

            if (typeof options.postdata != 'undefined') {
                data = options.postdata;

                if (typeof options.postdatatype != 'undefined') {
                    if (options.postdatatype == 'json') {
                        data = JSON.stringify(data);
                    } else if (options.postdatatype == 'form') {
                        data = laroux.helpers.buildFormData(options.postdata);
                    }
                }
            }

            xhr.send(data);
        },

        get: function(path, values, successfnc, errorfnc) {
            laroux.ajax.makeRequest({
                type: 'GET',
                url: path,
                datatype: 'html',
                getdata: values,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-Wrapper-Function': 'laroux.js'
                },
                success: successfnc,
                error: errorfnc
            });
        },

        getJson: function(path, values, successfnc, errorfnc) {
            laroux.ajax.makeRequest({
                type: 'GET',
                url: path,
                datatype: 'json',
                getdata: values,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-Wrapper-Function': 'laroux.js'
                },
                success: successfnc,
                error: errorfnc
            });
        },

        getJsonP: function(path, values, method, successfnc, errorfnc) {
            laroux.ajax.makeRequest({
                type: 'GET',
                url: path,
                datatype: 'script',
                getdata: values,
                jsonp: method,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                },
                success: successfnc,
                error: errorfnc
            });
        },

        getScript: function(path, values, successfnc, errorfnc) {
            laroux.ajax.makeRequest({
                type: 'GET',
                url: path,
                datatype: 'script',
                getdata: values,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                },
                success: successfnc,
                error: errorfnc
            });
        },

        post: function(path, values, successfnc, errorfnc) {
            laroux.ajax.makeRequest({
                type: 'POST',
                url: path,
                datatype: 'json',
                postdata: values,
                postdatatype: 'form',
                headers: {
                    // 'Content-Type': 'multipart/formdata; charset=UTF-8',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-Wrapper-Function': 'laroux.js'
                },
                success: successfnc,
                error: errorfnc
            });
        },

        postJson: function(path, values, successfnc, errorfnc) {
            laroux.ajax.makeRequest({
                type: 'POST',
                url: path,
                datatype: 'json',
                postdata: values,
                postdatatype: 'json',
                headers: {
                    'Content-Type': 'application/json; charset=UTF-8',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-Wrapper-Function': 'laroux.js'
                },
                success: successfnc,
                error: errorfnc
            });
        }
    };

})(this.laroux);
;(function(laroux) {
    "use strict";

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

        // { object, property, from, to, time, unit, reset }
        set: function(newanim) {
            newanim.startTime = null;

            if (typeof newanim.unit == 'undefined' || newanim.unit === null) {
                newanim.unit = '';
            }

            if (typeof newanim.from == 'undefined' || newanim.from === null) {
                if (newanim.object === document.body && newanim.property == 'scrollTop') {
                    newanim.from = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;
                } else {
                    newanim.from = newanim.object[newanim.property];
                }
            }

            if (typeof newanim.from == 'string') {
                newanim.from = parseFloat(newanim.from);
            }

            if (typeof newanim.reset == 'undefined' || newanim.reset === null) {
                newanim.reset = false;
            }

            // if (typeof newanim.id == 'undefined') {
            //     newanim.id = laroux.helpers.getUniqueId();
            // }

            laroux.anim.data.push(newanim);
            if (laroux.anim.data.length === 1) {
                requestAnimationFrame(laroux.anim.onframe);
            }
        },

        setCss: function(newanim) {
            if (typeof newanim.from == 'undefined' || newanim.from === null) {
                newanim.from = laroux.css.getProperty(newanim.object, newanim.property);
            }

            newanim.object = newanim.object.style;
            newanim.property = laroux.helpers.camelCase(newanim.property);

            laroux.anim.set(newanim);
        },

        remove: function(id) {
            var targetKey = null;

            for (var key in laroux.anim.data) {
                if (!laroux.anim.data.hasOwnProperty(key)) {
                    continue;
                }

                var keyObj = laroux.anim.data[key];

                if (typeof keyObj.id != 'undefined' && keyObj.id == id) {
                    targetKey = key;
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
            for (var key in laroux.anim.data) {
                if (!laroux.anim.data.hasOwnProperty(key)) {
                    continue;
                }

                var keyObj = laroux.anim.data[key];
                if (keyObj.startTime === null) {
                    keyObj.startTime = timestamp;
                }

                var result = laroux.anim.step(keyObj, timestamp);

                if (result === false) {
                    removeKeys.unshift(key);
                } else if (timestamp > keyObj.startTime + keyObj.time) {
                    if (keyObj.reset) {
                        keyObj.startTime = timestamp;
                        if (newanim.object === document.body && newanim.property == 'scrollTop') {
                            scrollTo(document.body, keyObj.from);
                        } else {
                            keyObj.object[keyObj.property] = keyObj.from;
                        }
                    } else {
                        removeKeys.unshift(key);
                    }
                }
            }

            for (var key2 in removeKeys) {
                if (!removeKeys.hasOwnProperty(key2)) {
                    continue;
                }

                laroux.anim.data.splice(removeKeys[key2], 1);
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
                scrollTo(document.body, value);
            } else {
                newanim.object[newanim.property] = value;
            }
        }
    };

})(this.laroux);;(function(laroux) {
    "use strict";

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

            for (var i = elements.length - 1;i >= 0; i--) {
                elements[i].classList.add(className);
            }
        },

        removeClass: function(element, className) {
            var elements = laroux.helpers.getAsArray(element);

            for (var i = elements.length - 1;i >= 0; i--) {
                elements[i].classList.remove(className);
            }
        },

        toggleClass: function(element, className) {
            var elements = laroux.helpers.getAsArray(element);

            for (var i = elements.length - 1;i >= 0; i--) {
                if (elements[i].classList.contains(className)) {
                    elements[i].classList.remove(className);
                } else {
                    elements[i].classList.add(className);
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

                for (var i = elements.length - 1;i >= 0; i--) {
                    elements[i].style[newStyleName] = properties[styleName];
                }
            }
        },

        // transition features
        defaultTransition: '2s ease',

        setTransitionSingle: function(element, transition) {
            var transitions = laroux.helpers.getAsArray(transition);

            var style = getComputedStyle(element);
            var currentTransitions = style.getPropertyValue('transition') || style.getPropertyValue('-webkit-transition') ||
                    style.getPropertyValue('-ms-transition') || '';

            var currentTransitionsArray;
            if (currentTransitions.length > 0) {
                currentTransitionsArray = currentTransitions.split(',');
            } else {
                currentTransitionsArray = [];
            }

            for (var item in transitions) {
                if (!transitions.hasOwnProperty(item)) {
                    continue;
                }

                var styleName, transitionProperties,
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

            for (var i = elements.length - 1;i >= 0; i--) {
                laroux.css.setTransitionSingle(elements[i], transition);
            }
        },

        show: function(element, transitionProperties) {
            if (typeof transitionProperties != 'undefined') {
                laroux.css.setTransition(element, 'opacity ' + transitionProperties);
            } else {
                laroux.css.setTransition(element, 'opacity');
            }

            laroux.css.setProperty(element, { opacity: 1 });
        },

        hide: function(element, transitionProperties) {
            if (typeof transitionProperties != 'undefined') {
                laroux.css.setTransition(element, 'opacity ' + transitionProperties);
            } else {
                laroux.css.setTransition(element, 'opacity');
            }

            laroux.css.setProperty(element, { opacity: 0 });
        },

        // measurement features
        // height of element without padding, margin and border
        height: function(element) {
            var style = getComputedStyle(element);

            return parseFloat(style.getPropertyValue('height'));
        },

        // height of element with padding but without margin and border
        innerHeight: function(element) {
            return element.clientHeight;
        },

        // height of element with padding and border but margin optional
        outerHeight: function(element, includeMargin) {
            if (typeof includeMargin == 'undefined' || includeMargin !== true) {
                return element.offsetHeight;
            }

            var style = getComputedStyle(element);
            var margins = parseFloat(style.getPropertyValue('margin-top')) +
                parseFloat(style.getPropertyValue('margin-bottom'));

            return Math.ceil(element.offsetHeight + margins);
        },

        // width of element without padding, margin and border
        width: function(element) {
            var style = getComputedStyle(element);

            return parseFloat(style.getPropertyValue('width'));
        },

        // width of element with padding but without margin and border
        innerWidth: function(element) {
            return element.clientWidth;
        },

        // width of element with padding and border but margin optional
        outerWidth: function(element, includeMargin) {
            if (typeof includeMargin == 'undefined' || includeMargin !== true) {
                return element.offsetWidth;
            }

            var style = getComputedStyle(element);
            var margins = parseFloat(style.getPropertyValue('margin-left')) +
                parseFloat(style.getPropertyValue('margin-right'));

            return Math.ceil(element.offsetWidth + margins);
        },

        aboveTheTop: function(element) {
            return element.getBoundingClientRect().bottom <= 0;
        },

        belowTheFold: function(element) {
            return element.getBoundingClientRect().top > window.innerHeight;
        },

        leftOfScreen: function(element) {
            return element.getBoundingClientRect().right <= 0;
        },

        rightOfScreen: function(element) {
            return element.getBoundingClientRect().left > window.innerWidth;
        },

        inViewport: function(element) {
            var rect = element.getBoundingClientRect();
            return !(rect.bottom <= 0 || rect.top > window.innerHeight ||
                rect.right <= 0 || rect.left > window.innerWidth);
        }
    };

})(this.laroux);
;(function(laroux) {
    "use strict";

    // date
    laroux.date = {
        parseEpoch: function(timespan, limitWithWeeks) {
            if (timespan <= 3000) {
                return 'now';
            }

            if (timespan < 60*1000) {
                timespan = Math.ceil(timespan / 1000);

                return timespan + ' seconds';
            }

            if (timespan < 60*60*1000) {
                timespan = Math.ceil(timespan / (60*1000));

                if (timespan == 1) {
                    return 'a minute';
                }

                return timespan + ' minutes';
            }

            if (timespan < 24*60*60*1000) {
                timespan = Math.ceil(timespan / (60*60*1000));

                if (timespan == 1) {
                    return 'an hour';
                }

                return timespan + ' hours';
            }

            if (timespan < 7*24*60*60*1000) {
                timespan = Math.ceil(timespan / (24*60*60*1000));

                if (timespan == 1) {
                    return 'a day';
                }

                return timespan + ' days';
            }

            if (timespan < 4*7*24*60*60*1000) {
                timespan = Math.ceil(timespan / (7*24*60*60*1000));

                if (timespan == 1) {
                    return 'a week';
                }

                return timespan + ' weeks';
            }

            if (typeof limitWithWeeks != 'undefined' && limitWithWeeks === true) {
                return null;
            }

            if (timespan < 30*7*24*60*60*1000) {
                timespan = Math.ceil(timespan / (30*24*60*60*1000));

                if (timespan == 1) {
                    return 'a month';
                }

                return timespan + ' months';
            }

            timespan = Math.ceil(timespan / (365*24*60*60*1000));

            if (timespan == 1) {
                return 'a year';
            }

            return timespan + ' years';
        },

        monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        getDateString: function(date, monthNames) {
            var now = Date.now();

            var leadingDate = ('0' + date.getDate()).substr(-2, 2);
            var leadingMonth = ('0' + (date.getMonth() + 1)).substr(-2, 2);
            var monthName = laroux.date.monthsShort[date.getMonth()];
            var fullYear = date.getFullYear();

            // timespan
            var timespan = now - date.getTime();
            var future;
            if (timespan < 0) {
                future = true;
                timespan = Math.abs(timespan);
            } else {
                future = false;
            }

            var timespanstring = laroux.date.parseEpoch(timespan, true);
            if (timespanstring !== null) {
                if (future) {
                    return timespanstring + ' later';
                }

                return timespanstring;
            }

            if (typeof monthNames != 'undefined' && monthNames) {
                return leadingDate + ' ' + monthName + ' ' + fullYear;
            }

            return leadingDate + '.' + leadingMonth + '.' + fullYear;
        },

        getLongDateString: function(date, monthNames, includeTime) {
            var leadingDate = ('0' + date.getDate()).substr(-2, 2);
            var leadingMonth = ('0' + (date.getMonth() + 1)).substr(-2, 2);
            var monthName = laroux.date.monthsShort[date.getMonth()];
            var fullYear = date.getFullYear();

            var result;

            if (typeof monthNames != 'undefined' && monthNames) {
                result = leadingDate + ' ' + monthName + ' ' + fullYear;
            } else {
                result = leadingDate + '.' + leadingMonth + '.' + fullYear;
            }

            if (typeof includeTime != 'undefined' && includeTime) {
                var leadingHour = ('0' + date.getHours()).substr(-2, 2);
                var leadingMinute = ('0' + date.getMinutes()).substr(-2, 2);

                result += ' ' + leadingHour + ':' + leadingMinute;
            }

            return result;
        }
    };

})(this.laroux);
;(function(laroux) {
    "use strict";

    // requires $l.helpers
    // requires $l.triggers

    // dom
    laroux.dom = {
        docprop: function(propName) {
            return document.documentElement.classList.contains(propName);
        },

        select: function(selector, parent) {
            var elements;
            if (typeof parent == 'undefined') {
                elements = document.querySelectorAll(selector);
            } else {
                elements = parent.querySelectorAll(selector);
            }

            return Array.prototype.slice.call(elements);
        },

        selectByClass: function(selector, parent) {
            var elements;
            if (typeof parent == 'undefined') {
                elements = document.getElementsByClassName(selector);
            } else {
                elements = parent.getElementsByClassName(selector);
            }

            return Array.prototype.slice.call(elements);
        },

        selectById: function(selector, parent) {
            if (typeof parent == 'undefined') {
                return document.getElementById(selector);
            }

            return parent.getElementById(selector);
        },

        selectSingle: function(selector, parent) {
            if (typeof parent == 'undefined') {
                return document.querySelector(selector);
            }

            return parent.querySelector(selector);
        },

        attr: function(element, attrname, value) {
            if (typeof value == 'undefined') {
                return element.getAttribute(attrname);
            }

            if (value === null) {
                element.removeAttribute(attrname);
                return;
            }

            element.setAttribute(attrname, value);
        },

        data: function(element, dataname, value) {
            if (typeof value == 'undefined') {
                return element.getAttribute('data-' + dataname);
            }

            if (value === null) {
                element.removeAttribute('data-' + dataname);
                return;
            }

            element.setAttribute('data-' + dataname, value);
        },

        eventHistory: { },
        setEvent: function(element, eventname, fnc) {
            var elements = laroux.helpers.getAsArray(element);

            for (var i = elements.length - 1;i >= 0; i--) {
                laroux.dom.setEventSingle(elements[i], eventname, fnc);
            }
        },

        setEventSingle: function(element, eventname, fnc) {
            var fncWrapper = function(e) {
                if (fnc(e, element) === false) {
                    if (e.preventDefault) {
                        e.preventDefault();
                    } else if (window.event) {
                        window.event.returnValue = false;
                    }
                }
            };

            if (typeof laroux.dom.eventHistory[element] == 'undefined') {
                laroux.dom.eventHistory[element] = { };
            }
            if (typeof laroux.dom.eventHistory[element][eventname] != 'undefined') {
                if (element.removeEventListener) {
                    element.removeEventListener(eventname, laroux.dom.eventHistory[element][eventname], false);
                } else if (element.detachEvent) {
                    element.detachEvent('on' + eventname, laroux.dom.eventHistory[element][eventname]);
                }
            }
            laroux.dom.eventHistory[element][eventname] = fncWrapper;

            if (element.addEventListener) {
                element.addEventListener(eventname, fncWrapper, false);
            } else if (element.attachEvent) {
                element.attachEvent('on' + eventname, fncWrapper);
            }
        },

        unsetEvent: function(element, eventname) {
            var elements = laroux.helpers.getAsArray(element);

            for (var i = elements.length - 1;i >= 0; i--) {
                if (typeof laroux.dom.eventHistory[elements[i]] == 'undefined') {
                    return;
                }
                if (typeof laroux.dom.eventHistory[elements[i]][eventname] != 'undefined') {
                    if (elements[i].removeEventListener) {
                        elements[i].removeEventListener(eventname, laroux.dom.eventHistory[elements[i]][eventname], false);
                    } else if (elements[i].detachEvent) {
                        elements[i].detachEvent('on' + eventname, laroux.dom.eventHistory[elements[i]][eventname]);
                    }
                }
                delete laroux.dom.eventHistory[elements[i]][eventname];
            }
        },

        create: function(html) {
            var frag = document.createDocumentFragment(),
                temp = document.createElement('DIV');

            laroux.dom.append(temp, html);
            while (temp.firstChild) {
                frag.appendChild(temp.firstChild);
            }

            return frag;
        },

        createElement: function(element, attributes, children) {
            var elem = document.createElement(element);

            if (typeof attributes == 'object') {
                for (var key in attributes) {
                    if (!attributes.hasOwnProperty(key)) {
                        continue;
                    }

                    elem.setAttribute(key, attributes[key]);
                }
            }

            if (typeof children == 'object') {
                for (var key2 in children) {
                    if (!children.hasOwnProperty(key2)) {
                        continue;
                    }

                    elem.setAttribute(key2, children[key2]);
                }
            } else if (typeof children == 'string') {
                laroux.dom.append(elem, children);
            }

            return elem;
        },

        createOption: function(element, key, value, isDefault) {
            /* old behaviour, does not support optgroups as parents.
            var count = element.options.length;
            element.options[count] = new Option(value, key);

            if (typeof isDefault != 'undefined' && isDefault === true) {
                element.options.selectedIndex = count - 1;
            }
            */

            var option = document.createElement('OPTION');
            option.setAttribute('value', key);
            if (typeof isDefault != 'undefined' && isDefault === true) {
                option.setAttribute('checked', 'checked');
            }

            laroux.dom.append(option, value);
            element.appendChild(option);
        },

        selectByValue: function(element, value) {
            for (var i = element.options.length - 1;i >= 0; i--) {
                if (element.options[i].getAttribute('value') == value) {
                    element.selectedIndex = i;
                    break;
                }
            }
        },

        loadImage: function() {
            var images = [];

            for (var i = arguments.length - 1;i >= 0; i--) {
                var image = document.createElement('IMG');
                image.setAttribute('src', arguments[i]);

                images.push(image);
            }

            return images;
        },

        loadAsyncScript: function(path, triggerName, async) {
            var elem = document.createElement('script');
            elem.type = 'text/javascript';
            elem.async = (typeof async != 'undefined') ? async : true;
            elem.src = path;

            var loaded = false;
            elem.onload = elem.onreadystatechange = function() {
                if ((elem.readyState && elem.readyState !== 'complete' && elem.readyState !== 'loaded') || loaded) {
                    return false;
                }

                elem.onload = elem.onreadystatechange = null;
                loaded = true;
                if (typeof triggerName != 'undefined' && triggerName !== null) {
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
            elem.async = (typeof async != 'undefined') ? async : true;
            elem.href = path;
            elem.rel = 'stylesheet';

            var loaded = false;
            elem.onload = elem.onreadystatechange = function() {
                if ((elem.readyState && elem.readyState !== 'complete' && elem.readyState !== 'loaded') || loaded) {
                    return false;
                }

                elem.onload = elem.onreadystatechange = null;
                loaded = true;
                if (typeof triggerName != 'undefined' && triggerName !== null) {
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
            if (element.parentElement !== null) {
                element.parentElement.removeChild(element);
            }
        },

        cloneReturn: 0,
        cloneAppend: 1,
        cloneInsertAfter: 2,
        cloneInsertBefore: 3,

        clone: function(element, type, container, target) {
            var newElement = element.cloneNode(true);

            if (typeof container == 'undefined') {
                container = element.parentNode;
            }
            if (typeof target == 'undefined') {
                target = element;
            }

            if (typeof type != 'undefined' && type != laroux.dom.cloneReturn) {
                if (typeof type == 'undefined' || type == laroux.dom.cloneAppend) {
                    container.appendChild(newElement);
                } else if (type == laroux.dom.cloneInsertAfter) {
                    container.insertBefore(newElement, target.nextSibling);
                } else { // type == laroux.dom.cloneInsertBefore
                    container.insertBefore(newElement, target);
                }
            }

            return newElement;
        } /*,

        // todo: it's redundant
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
        }
        */
    };

})(this.laroux);
;(function(laroux) {
    "use strict";

    // events
    laroux.events = {
        delegates: [],

        add: function(event, fnc) {
            laroux.events.delegates.push({ event: event, fnc: fnc });
        },

        invoke: function(event, args) {
            for (var key in laroux.events.delegates) {
                if (!laroux.events.delegates.hasOwnProperty(key)) {
                    continue;
                }

                if (laroux.events.delegates[key].event != event) {
                    continue;
                }

                laroux.events.delegates[key].fnc(args);
            }
        },
    };

})(this.laroux);
;(function(laroux) {
    "use strict";

    // forms
    laroux.forms = {
        ajaxForm: function(formobj, fnc, fncBegin) {
            laroux.dom.setEvent(formobj, 'submit', function() {
                if (typeof fncBegin != 'undefined') {
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

            if (typeof value == 'undefined') {
                if (formobj.getAttribute('data-last-enabled') === null) {
                    formobj.setAttribute('data-last-enabled', 'enabled');
                    value = false;
                } else {
                    formobj.removeAttribute('data-last-enabled');
                    value = true;
                }
            }

            for (var selected = 0; selected < selection.length; selected++) {
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

            for (var selected = 0; selected < selection.length; selected++) {
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

            for (var selected = 0; selected < selection.length; selected++) {
                var value = laroux.forms.getFormFieldValue(selection[selected]);

                if (value !== null) {
                    values[selection[selected].getAttribute('name')] = value;
                }
            }

            return values;
        },

        deserialize: function(formobj, data) {
            var selection = formobj.querySelectorAll('*[name]');

            for (var selected = 0; selected < selection.length; selected++) {
                laroux.forms.setFormFieldValue(selection[selected], data[selection[selected].getAttribute('name')]);
            }
        }
    };

})(this.laroux);
;(function(laroux) {
    "use strict";

    // helpers
    laroux.helpers = {
        uniqueId: 0,

        getUniqueId: function() {
            return 'uid-' + (++laroux.helpers.uniqueId);
        },

        buildQueryString: function(values, rfc3986) {
            var uri = '';
            var regEx = /%20/g;

            if (typeof rfc3986 == 'undefined') {
                rfc3986 = false;
            }

            for (var name in values) {
                if (!values.hasOwnProperty(name)) {
                    continue;
                }

                if (typeof values[name] != 'function') {
                    if (rfc3986) {
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
            return obj.map(function(value) { return value[key]; });
        },

        shuffle: function(obj) {
            var index = 0;
            var shuffled = [];

            obj.forEach(function(value) {
                var rand = laroux.helpers.random(0, index);
                shuffled[index++] = shuffled[rand];
                shuffled[rand] = value;
            });

            return shuffled;
        },

        merge: function(obj1, obj2) {
            var tmp = obj1;

            if (tmp instanceof Array) {
                return tmp.concat(obj2);
            }

            for (var attr in obj2) {
                if (!tmp.hasOwnProperty(attr)) {
                    tmp[attr] = obj2[attr];
                }
            }

            return tmp;
        },

        getAsArray: function(obj) {
            var items;

            if (obj instanceof Array) {
                items = obj;
            } else if (obj instanceof NodeList) {
                items = Array.prototype.slice.call(obj);
            } else {
                items = [ obj ];
            }

            return items;
        },

        getLength: function(obj) {
            if (typeof obj == 'object') {
                if (typeof obj.length != 'undefined') {
                    return obj.length;
                }

                return Object.keys(obj).length;
            }

            return -1;
        },

        getKeysRecursive: function(obj, delimiter, prefix, keys) {
            if (typeof delimiter == 'undefined') {
                delimiter = '.';
            }

            if (typeof prefix == 'undefined') {
                prefix = '';
                keys = [];
            }

            for (var item in obj) {
                keys.push(prefix + item);

                if (obj[item] instanceof Object) {
                    laroux.helpers.getKeysRecursive(obj[item], delimiter, prefix + item + delimiter, keys);
                    continue;
                }
            }

            return keys;
        },

        getElement: function(obj, path, defaultValue, delimiter) {
            if (typeof defaultValue == 'undefined') {
                defaultValue = null;
            }

            if (typeof delimiter == 'undefined') {
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

            if (typeof obj[key] == 'undefined') {
                return null;
            }

            if (rest === null || rest.length === 0) {
                return obj[key];
            }

            return laroux.helpers.getElement(obj[key], rest, defaultValue, delimiter);
        },
        /* for javascript 1.7 or later,

        getKeys: function(obj) {
            var keys = Object.keys(obj);
            for (var key in keys) {
                yield keys[key];
            }
        } */
    };

})(this.laroux);
;(function(laroux) {
    "use strict";

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
            if (typeof appObject.controller != 'undefined') {
                appObject.controller(appObject.model);
            }

            if (appObject.cachedNodes === null) {
                appObject.cachedNodes = [];
                var objectKeys = laroux.helpers.getKeysRecursive(appObject.model);
                laroux.mvc.scanElement(appObject.element, objectKeys, appObject.cachedNodes);
            }

            for (var i1 in appObject.cachedNodes) {
                var item1 = appObject.cachedNodes[i1];

                if (typeof keys != 'undefined' && keys.indexOf(item1.key) === -1) {
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

                if (typeof keys != 'undefined' && keys.indexOf(item2.key) === -1) {
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

        bind: function(app, model, controller) {
            if (typeof controller == 'undefined') {
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
;(function(laroux) {
    "use strict";

    // stack
    laroux.stack = function() {
        this.data = {};

        this.add = function(key, value) {
            this.data[key] = value;
        };

        this.addRange = function(values) {
            for (var valueKey in values) {
                if (!values.hasOwnProperty(valueKey)) {
                    continue;
                }

                this.data[valueKey] = values[valueKey];
            }
        };

        this.get = function(key, defaultValue) {
            if (typeof this.data[key] == 'undefined') {
                return defaultValue;
            }

            return this.data[key];
        };

        this.getRange = function(keys) {
            var values = {};

            for (var key in keys) {
                if (!keys.hasOwnProperty(key)) {
                    continue;
                }

                values[keys[key]] = this.data[keys[key]];
            }

            return values;
        };

        this.keys = function() {
            return Object.keys(this.data);
        };

        this.length = function() {
            return Object.keys(this.data).length;
        };

        this.exists = function(key) {
            return (typeof this.data[key] != 'undefined');
        };

        this.remove = function(key) {
            delete this.data[key];
        };

        this.clear = function() {
            this.data = {};
        };
    };

})(this.laroux);
;(function(laroux) {
    "use strict";

    // requires $l.dom

    // templates
    laroux.templates = {
        engine: null,

        load: function(element, options) {
            var content = element.innerHTML;

            return laroux.templates.engine.compile(content, options);
        },

        apply: function(element, model, options) {
            var template = laroux.templates.load(element, options);

            return template.render(model);
        },

        insert: function(element, model, target, position, options) {
            var output = laroux.templates.apply(element, model, options);

            if (typeof position == 'undefined') {
                position = 'beforeend';
            }

            laroux.dom.insert(target, position, output);
        }
    };

})(this.laroux);
;(function(laroux) {
    "use strict";

    // requires $l

    // timers
    laroux.timers = {
        data: [],

        set: function(timer) {
            laroux.timers.data.push(timer);
        },

        remove: function(id) {
            var targetKey = null;

            for (var key in laroux.timers.data) {
                if (!laroux.timers.data.hasOwnProperty(key)) {
                    continue;
                }

                var keyObj = laroux.timers.data[key];

                if (typeof keyObj.id != 'undefined' && keyObj.id == id) {
                    targetKey = key;
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
            var removeKeys = [];
            for (var key in laroux.timers.data) {
                if (!laroux.timers.data.hasOwnProperty(key)) {
                    continue;
                }

                var keyObj = laroux.timers.data[key];

                if (typeof keyObj.timeoutR == 'undefined') {
                    keyObj.timeoutR = keyObj.timeout - 1;
                } else {
                    keyObj.timeoutR -= 1;
                }

                if (keyObj.timeoutR < 0) {
                    var result = keyObj.ontick(keyObj.state);

                    if (result !== false && typeof keyObj.reset != 'undefined' && keyObj.reset) {
                        keyObj.timeoutR = keyObj.timeout;
                    } else {
                        removeKeys.unshift(key);
                    }
                }
            }

            for (var key2 in removeKeys) {
                if (!removeKeys.hasOwnProperty(key2)) {
                    continue;
                }

                laroux.timers.data.splice(removeKeys[key2], 1);
            }
        }
    };

    laroux.ready(function() {
        setInterval(laroux.timers.ontick, 1);
    });

})(this.laroux);
;(function(laroux) {
    "use strict";

    // requires $l.helpers

    // triggers
    laroux.triggers = {
        delegates: [],
        list: [],

        set: function(condition, fnc, state) {
            var conditions = laroux.helpers.getAsArray(condition);

            for (var key in conditions) {
                if (!conditions.hasOwnProperty(key)) {
                    continue;
                }

                if (laroux.triggers.list.indexOf(conditions[key]) == -1) {
                    laroux.triggers.list.push(conditions[key]);
                }
            }

            laroux.triggers.delegates.push({
                conditions: conditions,
                fnc: fnc,
                state: state
            });
        },

        ontrigger: function(triggerName, args) {
            var eventIdx = laroux.triggers.list.indexOf(triggerName);
            if (eventIdx != -1) {
                laroux.triggers.list.splice(eventIdx, 1);
            }

            var removeKeys = [];
            for (var key in laroux.triggers.delegates) {
                if (!laroux.triggers.delegates.hasOwnProperty(key)) {
                    continue;
                }

                var count = 0;
                var keyObj = laroux.triggers.delegates[key];

                for (var conditionKey in keyObj.conditions) {
                    if (!keyObj.conditions.hasOwnProperty(conditionKey)) {
                        continue;
                    }

                    var conditionObj = keyObj.conditions[conditionKey];

                    if (laroux.triggers.list.indexOf(conditionObj) != -1) {
                        count++;
                        // break;
                    }
                }

                if (count === 0) {
                    keyObj.fnc(
                        {
                            state: keyObj.state,
                            args: laroux.helpers.getAsArray(args)
                        }
                    );
                    removeKeys.unshift(key);
                }
            }

            for (var key2 in removeKeys) {
                if (!removeKeys.hasOwnProperty(key2)) {
                    continue;
                }

                laroux.triggers.delegates.splice(removeKeys[key2], 1);
            }

            // console.log('trigger name: ' + triggerName);
        }
    };

})(this.laroux);
;(function(laroux) {
    "use strict";

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
                return laroux.dom.createElement('DIV', { 'id': id, 'class': xclass },
                    message
                );
            },

            msgbox: function(timeout, message) {
                var id = laroux.helpers.getUniqueId();
                var obj = laroux.ui.popup.createBox(id, 'laroux_msgbox', message);
                laroux.ui.floatContainer.appendChild(obj);

                laroux.css.setProperty(obj, { opacity: 1 });

                laroux.timers.set({
                    timeout: timeout,
                    reset: false,
                    ontick: function(x) {
                        // laroux.css.setProperty(x, { opacity: 0 });
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

                laroux.css.setProperty(laroux.ui.loading.element, { display: 'none' });
                localStorage.loadingIndicator = 'false';
            },

            show: function(delay) {
                laroux.ui.loading.killTimer();

                if (typeof delay == 'undefined') {
                    delay = laroux.ui.loading.defaultDelay;
                }

                if (delay > 0) {
                    setTimeout(function() { laroux.ui.loading.show(0); }, delay);
                } else {
                    laroux.css.setProperty(laroux.ui.loading.element, { display: 'block' });
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

                    if (typeof localStorage.loadingIndicator != 'undefined' && localStorage.loadingIndicator == 'true') {
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

                laroux.ui.dynamicDates.updateDatesElements.forEach(function(obj) {
                    var date = new Date(parseInt(obj.getAttribute('data-epoch'), 10) * 1000);

                    laroux.dom.replace(
                        obj,
                        laroux.date.getDateString(date)
                    );

                    obj.setAttribute('title', laroux.date.getLongDateString(date));
                });
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

            set: function(selector) {
                laroux.ui.scrollView.selectedElements = laroux.helpers.merge(
                    laroux.ui.scrollView.selectedElements,
                    laroux.amap(
                        laroux.dom.select(selector),
                        function(element) {
                            if (!laroux.css.inViewport(element)) {
                                return element;
                            }
                        }
                    )
                );

                laroux.css.setTransition(laroux.ui.scrollView.selectedElements, ['opacity']);
                laroux.css.setProperty(laroux.ui.scrollView.selectedElements, { opacity: 0 });
                laroux.dom.setEvent(window, 'scroll', laroux.ui.scrollView.onscroll);
            },

            onscroll: function() {
                var removeKeys = [];

                laroux.each(
                    laroux.ui.scrollView.selectedElements,
                    function(i, element) {
                        if (laroux.css.inViewport(element)) {
                            removeKeys.unshift(i);
                            element.style.opacity = 1;
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
                    laroux.dom.unsetEvent(window, 'scroll');
                }
            }
        },

        createFloatContainer: function() {
            if (!laroux.ui.floatContainer) {
                laroux.ui.floatContainer = laroux.dom.createElement('DIV', { id: 'laroux_floatdiv' }, '');
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
;(function(laroux) {
    "use strict";

    // requires $l

    // vars
    laroux.vars = {
        getCookie: function(name, defaultValue) {
            var re = new RegExp(encodeURIComponent(name) + '=[^;]+', 'i');
            var match = document.cookie.match(re);
            
            if (!match) {
                if (typeof defaultValue != 'undefined') {
                    return defaultValue;
                }

                return null;
            }

            return decodeURIComponent(match[0].split('=')[1]);
        },

        setCookie: function(name, value, expires) {
            var expireValue = '';
            if (typeof expires != 'undefined' || expires !== null) {
                expireValue = '; expires=' + expires.toGMTString();
            }

            var pathValue = laroux.baseLocation;
            if (pathValue.length === 0) {
                pathValue = '/';
            }

            document.cookie = encodeURIComponent(name) + '=' + encodeURIComponent(value) + expireValue + '; path=' + pathValue;
        },

        removeCookie: function(name) {
            var pathValue = laroux.baseLocation;
            if (pathValue.length === 0) {
                pathValue = '/';
            }

            document.cookie = encodeURIComponent(name) + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=' + pathValue;
        },

        getLocal: function(name, defaultValue) {
            if (typeof localStorage[name] == 'undefined') {
                if (typeof defaultValue != 'undefined') {
                    return defaultValue;
                }

                return null;
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
            if (typeof sessionStorage[name] == 'undefined') {
                if (typeof defaultValue != 'undefined') {
                    return defaultValue;
                }

                return null;
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
