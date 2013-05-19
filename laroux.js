(function() {
    // "use strict";

    // core
    var laroux = {
        baseLocation: '',
        selectedMaster: '',
        isOldInternetExplorer: false,
        popupFunc: alert,
        readyPassed: false,

        contentBegin: function(masterName, locationUrl) {
            laroux.baseLocation = locationUrl;
            laroux.selectedMaster = masterName;

            if (laroux.css.hasClass(laroux.dom.selectSingle('html'), 'oldInternetExplorer')) {
                laroux.isOldInternetExplorer = true;
            }

            laroux.events.invoke('contentBegin');
        },

        contentEnd: function() {
            laroux.events.invoke('contentEnd');
            laroux.readyPassed = true;

            window.setInterval(laroux.timers.ontick, 500);
        },

        begin: function(fnc) {
            laroux.events.add('contentBegin', fnc);
        },

        ready: function(fnc) {
            if (!laroux.readyPassed) {
                laroux.events.add('contentEnd', fnc);
                return;
            }

            fnc();
        },

        extend: function(obj) {
            for (var name in obj) {
                laroux[name] = obj[name];
            }
        }
    };

    // events
    laroux.events = {
        delegates: [],

        add: function(event, fnc) {
            laroux.events.delegates.push({ event: event, fnc: fnc });
        },

        invoke: function(event, args) {
            for (var key in laroux.events.delegates) {
                if (laroux.events.delegates[key].event != event) {
                    continue;
                }

                laroux.events.delegates[key].fnc(args);
            }
        },
    };

    // timers
    laroux.timers = {
        delegates: [],

        set: function(timeout, fnc, obj) {
            laroux.timers.delegates.push({
                timeout: timeout,
                fnc: fnc,
                obj: obj
            });
        },

        ontick: function() {
            var removeKeys = [];
            for (var key in laroux.timers.delegates) {
                var keyObj = laroux.timers.delegates[key];

                if (keyObj.timeout == null) {
                    keyObj.fnc(keyObj.obj);
                } else {
                    keyObj.timeout -= 0.5;

                    if (keyObj.timeout < 0) {
                        keyObj.fnc(keyObj.obj);
                        removeKeys.unshift(key);
                    }
                }
            }

            for (var key in removeKeys) {
                laroux.timers.delegates.splice(removeKeys[key], 1);
            }
        }
    };

    // triggers
    laroux.triggers = {
        delegates: [],
        list: [],

        set: function(condition, fnc, obj) {
            for (var key in condition) {
                if (laroux.triggers.list.indexOf(condition[key]) == -1) {
                    laroux.triggers.list.push(condition[key]);
                }
            }

            laroux.triggers.delegates.push({
                condition: condition,
                fnc: fnc,
                obj: obj
            });
        },

        ontrigger: function(triggerName, eventArgs) {
            var eventIdx = laroux.triggers.list.indexOf(triggerName);
            if (eventIdx != -1) {
                laroux.triggers.list.splice(eventIdx, 1);
            }

            var removeKeys = [];
            for (var key in laroux.triggers.delegates) {
                var count = 0;
                var keyObj = laroux.triggers.delegates[key];

                for (var conditionKey in keyObj.condition) {
                    var conditionObj = keyObj.condition[conditionKey];

                    if (laroux.triggers.list.indexOf(conditionObj) != -1) {
                        count++;
                        // break;
                    }
                }

                if (count == 0) {
                    keyObj.fnc(keyObj.obj, eventArgs);
                    removeKeys.unshift(key);
                }
            }

            for (var key in removeKeys) {
                laroux.triggers.delegates.splice(removeKeys[key], 1);
            }

            console.log('trigger name: ' + triggerName);
        }
    };

    // dom
    laroux.dom = {
        select: function(selector, parent) {
            var elements;
            if (typeof parent == 'undefined') {
                elements = document.querySelectorAll(selector);
            } else {
                elements = parent.querySelectorAll(selector);
            }

            return Array.prototype.slice.call(elements);
            // return document.querySelectorAll.apply(document, arguments);
        },

        selectSingle: function(selector, parent) {
            if (typeof parent == 'undefined') {
                return document.querySelector(selector);
            }

            return parent.querySelector(selector);
            // return document.querySelector.apply(document, arguments);
        },

        eventHistory: { },
        setEvent: function(element, eventname, fnc) {
            var elements = laroux.helpers.getAsArray(element);

            for (var i = 0; i < elements.length; i++) {
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

            for (var i = 0; i < elements.length; i++) {
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
                var keys = Object.keys(attributes);
                for (var key in keys) {
                    elem.setAttribute(keys[key], attributes[keys[key]]);
                }
            }

            if (typeof children == 'object') {
                var keys = Object.keys(children);
                for (var key in keys) {
                    elem.setAttribute(keys[key], children[keys[key]]);
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

            for (var i = 0; i < arguments.length; i++) {
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
                if (typeof triggerName != 'undefined' && triggerName != null) {
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
                if (typeof triggerName != 'undefined' && triggerName != null) {
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

        remove: function(element) {
            if (element.parentElement != null) {
                element.parentElement.removeChild(element);
            }
        },
        
        cloneAppend: 0,
        cloneInsertAfter: 1,
        cloneInsertBefore: 2,

        clone: function(element, type, container, target) {
            var newElement = element.cloneNode(true);

            if (typeof container == 'undefined') {
                container = element.parentNode;
            }
            if (typeof target == 'undefined') {
                target = element;
            }

            if (typeof type == 'undefined' || type == laroux.dom.cloneAppend) {
                container.appendChild(newElement);
            } else if (type == laroux.dom.cloneInsertAfter) {
                container.insertBefore(newElement, target.nextSibling);
            } else { // type == laroux.dom.cloneInsertBefore
                container.insertBefore(newElement, target);
            }

            return newElement;
        },

        applyOperations: function(element, operations) {
            for (var operation in operations) {
                for (var binding in operations[operation]) {
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
                            continue;
                            break;
                        case 'removeclass':
                            laroux.css.removeClass(element, value);
                            break;
                        case 'addstyle':
                            laroux.css.setProperty(element, binding, value);
                            continue;
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
    };

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

    // css
    laroux.css = {
        hasClass: function(element, className) {
            return (element.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)')) != null);
        },

        addClass: function(element, className) {
            var elements = laroux.helpers.getAsArray(element);

            for (var i = 0; i < elements.length; i++) {
                if (laroux.css.hasClass(elements[i], className)) {
                    continue;
                }

                elements[i].className += ' ' + className;
            }
        },

        removeClass: function(element, className) {
            var elements = laroux.helpers.getAsArray(element);

            for (var i = 0; i < elements.length; i++) {
                elements[i].className = elements[i].className.replace(new RegExp('(\\s|^)' + className + '(\\s|$)'), ' ');
            }
        },

        toggleClass: function(element, className) {
            var elements = laroux.helpers.getAsArray(element);

            for (var i = 0; i < elements.length; i++) {
                var oldClassName = elements[i].className;
                var newClassName = oldClassName.replace(new RegExp('(\\s|^)' + className + '(\\s|$)'), ' ');

                if (oldClassName === newClassName) {
                    elements[i].className = oldClassName + ' ' + className;
                    continue;
                }

                elements[i].className = newClassName;
            }
        },

        getProperty: function(element, styleName) {
            var style = window.getComputedStyle(element);

            return style.getPropertyValue(styleName);
        },

        setProperty: function(element, styleName, value) {
            var elements = laroux.helpers.getAsArray(element);
            var flag = false;
            var newStyleName = '';

            for (var j = 0; j < styleName.length; j++) {
                if (styleName.charAt(j) == '-') {
                    flag = true;
                    continue;
                }

                newStyleName += (!flag) ? styleName.charAt(j) : styleName.charAt(j).toUpperCase();
                flag = false;
            }

            for (var i = 0; i < elements.length; i++) {
                elements[i].style[newStyleName] = value;
            }
        }
    };

    // helpers
    laroux.helpers = {
        uniqueId: 0,

        getUniqueId: function() {
            return 'uid-' + (++laroux.helpers.uniqueId);
        },

        buildQueryString: function(values) {
            var uri = '';

            for (var name in values) {
                if (typeof values[name] != 'function') {
                    uri += '&' + escape(name) + '=' + escape(values[name]);
                }
            }

            return uri.substr(1);
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
        } /* for javascript 1.7 or later,

        getKeys: function(obj) {
            var keys = Object.keys(obj);
            for (var key in keys) {
                yield keys[key];
            }
        } */
    };

    // cookies
    laroux.cookies = {
        get: function(name) {
            re = new RegExp(name + '=[^;]+', 'i');
            if (!document.cookie.match(re)) {
                return null;
            }

            return document.cookie.match(re)[0].split('=')[1];
        },

        set: function(name, value) {
            document.cookie = name + '=' + value + '; path=' + laroux.baseLocation;
        }
    };

    // forms
    laroux.forms = {
        ajaxForm: function(formobj, fnc, fncBegin) {
            laroux.dom.setEvent(formobj, 'submit', function() {
                if (typeof fncBegin != 'undefined') {
                    fncBegin();
                }

                laroux.ajax.post(
                    formobj.getAttribute('action'),
                    laroux.forms.serialize(formobj),
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
            if (element.disabled == true) {
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
            if (element.disabled == true) {
                return;
            }

            if (element.tagName == 'SELECT') {
                for (var option in element.options) {
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

        upload: function(formobj, url, successFnc) {
            laroux.ajax.makeRequest({
                type: 'POST',
                url: url,
                data: laroux.forms.serializeFormData(formobj),
                // datatype: '',
                cache: false,
                contentType: false, // 'multipart/form-data; charset=UTF-8',
                userAgent: 'XMLHttpRequest',
                lang: 'en',
                processData: false,
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
                success: successFnc,
                error: function(data) {
                    console.log(data);
                }
            });
        },

        toggleFormEditing: function(formobj, value) {
            var selection = formobj.querySelectorAll('*[name]');

            for (var selected = 0; selected < selection.length; selected++) {
                if (!laroux.forms.isFormField(selection[selected])) {
                    continue;
                }

                if (!value) {
                    selection[selected].setAttribute('disabled', 'disabled');
                    continue;
                }

                selection[selected].removeAttribute('disabled');
            }
        },

        serializeFormData: function(formobj) {
            var formdata = new FormData();
            var selection = formobj.querySelectorAll('*[name]');

            for (var selected = 0; selected < selection.length; selected++) {
                var value = laroux.forms.getFormFieldValue(selection[selected]);

                if (value != null) {
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

                if (value != null) {
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

    // storage
    laroux.storage = {
        data: [], // default with noframe

        install: function() {
            if (parent && parent.frames['hidden']) {
                if (parent.frames['hidden'].storage == undefined) {
                    parent.frames['hidden'].storage = [];
                }

                laroux.storage.data = parent.frames['hidden'].storage;
            }
        },

        flush: function() {
            laroux.storage.data.length = 0;
        },

        exists: function(key) {
            return (laroux.storage.data[key] != undefined);
        },

        set: function(key, value) {
            laroux.storage.data[key] = value;
        },

        get: function(key, value) {
            return laroux.storage.data[key];
        }
    };

    // ajax - partially taken from 'jquery in parts' project
    //        can be found at: https://github.com/mythz/jquip/
    laroux.ajax = {
        _xhrf: null,
        xhrs: [
            function() { return new XMLHttpRequest(); },
            function() { return new ActiveXObject('Microsoft.XMLHTTP'); },
            function() { return new ActiveXObject('MSXML2.XMLHTTP.5.0'); },
            function() { return new ActiveXObject('MSXML2.XMLHTTP.4.0'); },
            function() { return new ActiveXObject('MSXML2.XMLHTTP.3.0'); },
            function() { return new ActiveXObject('MSXML2.XMLHTTP'); }
        ],

        _xhr: function() {
            if (laroux.ajax._xhrf != null) {
                return laroux.ajax._xhrf();
            }

            for (var i = 0, l = laroux.ajax.xhrs.length; i < l; i++) {
                try {
                    var f = laroux.ajax.xhrs[i];
                    var req = f();

                    if (req != null) {
                        laroux.ajax._xhrf = f;
                        return req;
                    }
                }
                catch(e) {
                    console.log(e)
                }
            }

            return function() { };
        },

        _xhrResp: function(xhr, dataType) {
            var dataType = (dataType || xhr.getResponseHeader('Content-Type').split(';')[0]).toLowerCase();
            var wrapperFunction = xhr.getResponseHeader('X-Response-Wrapper-Function');
            var response;

            if (dataType.indexOf('json') >= 0) {
                if (typeof window.JSON != 'undefined') {
                    response = window.JSON.parse(xhr.responseText);
                } else {
                    response = eval(xhr.responseText);
                }
            } else if (dataType.indexOf('script') >= 0) {
                response = eval(xhr.responseText);
            } else if (dataType.indexOf('xml') >= 0) {
                response = xhr.responseXML;
            } else {
                response = xhr.responseText;
            }

            return {
                'response': response,
                'wrapperFunc': wrapperFunction
            };
        },

        //! confusion between forms.formData and this
        formData: function(o) {
            var kvps = [];
            var regEx = /%20/g;

            for (var k in o) {
                if (typeof o[k] != 'undefined') {
                    kvps.push(encodeURIComponent(k).replace(regEx, '+') + '=' + encodeURIComponent(o[k].toString()).replace(regEx, '+'));
                }
            }

            return kvps.join('&');
        },

        makeRequest: function(url, o) {
            var xhr = laroux.ajax._xhr();
            var timer = null;
            var n = 0;

            if (typeof url === 'object') {
                o = url;
            } else {
                o.url = url;
            }

            if (typeof o.timeout != 'undefined') {
                timer = setTimeout(
                    function() {
                        xhr.abort();
                        if (typeof o.timeoutFn != 'undefined') {
                            o.timeoutFn(o.url);
                        }
                    },
                    o.timeout
                );
            }

            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4) {
                    if (timer != null) {
                        clearTimeout(timer);
                    }

                    if (xhr.status < 300) {
                        var res;
                        var decode = true;
                        var dt = (o.dataType || '');

                        try {
                            res = laroux.ajax._xhrResp(xhr, dt, o);
                        }
                        catch(e) {
                            decode = false;
                            if (typeof o.error != 'undefined') {
                                o.error(xhr, xhr.status, xhr.statusText);
                            }

                            laroux.events.invoke('ajaxError', [xhr, xhr.statusText, o]);
                        }

                        if (typeof o.success != 'undefined' && decode && (dt.indexOf('json') >= 0 || !!res.response)) {
                            o.success(res.response, res.wrapperFunc);
                        }

                        laroux.events.invoke('ajaxSuccess', [xhr, res.response, o]);
                    } else {
                        if (typeof o.error != 'undefined') {
                            o.error(xhr, xhr.status, xhr.statusText);
                        }

                        laroux.events.invoke('ajaxError', [xhr, xhr.statusText, o]);
                    }

                    if (typeof o.complete != 'undefined') {
                        o.complete(xhr, xhr.statusText);
                    }

                    laroux.events.invoke('ajaxComplete', [xhr, o]);
                } else if (typeof o.progress != 'undefined') {
                    o.progress(++n);
                }
            };

            var url = o.url;
            var data = null;
            var isPost = (o.type == 'POST' || o.type == 'PUT');
            if (typeof o.processData != 'undefined' && typeof o.data == 'object') {
                data = laroux.ajax.formData(o.data);
            }

            if (!isPost && data != null) {
                url += ((url.indexOf('?') < 0) ? '?' : '&') + data;
                data = null;
            }

            xhr.open(o.type, url);

            try {
                for (var i in o.headers) {
                    xhr.setRequestHeader(i, o.headers[i]);
                }
            }
            catch(e) {
                console.log(e)
            }

            if (isPost) {
                if (o.contentType.indexOf('json') >= 0) {
                    data = o.data;
                }

                xhr.setRequestHeader('Content-Type', o.contentType);
            }

            xhr.send(data);
        },

        request: function(path, values, fnc, method) {
            if (typeof method === 'undefined') {
                method = (typeof values === 'undefined' || values == null) ? 'get' : 'post';
            }
            laroux.ajax[method](path, values, fnc);
        },
        
        get: function(path, values, fnc) {
            laroux.ajax.makeRequest({
                type: 'GET',
                url: path,
                data: values,
                datatype: 'json',
                cache: true,
                contentType: 'application/json; charset=UTF-8',
                userAgent: 'XMLHttpRequest',
                lang: 'en',
                processData: true,
                headers: { 'X-Requested-With': 'XMLHttpRequest', 'X-Wrapper-Function': 'laroux.js' },
                success: function(data, wrapperFunc) {
                    if (wrapperFunc == 'laroux.js') {
                        if (!data.isSuccess) {
                            laroux.popupFunc('Error: ' + data.errorMessage);
                            return;
                        }

                        if (fnc != null) {
                            var obj;

                            if (typeof window.JSON != 'undefined') {
                                obj = window.JSON.parse(data.object);
                            } else {
                                obj = eval(data.object);
                            }

                            fnc(obj);
                        }

                        return;
                    }

                    fnc(data);
                },
                error: function(data) {
                    console.log(data);
                }
            });
        },

        post: function(path, values, fnc) {
            laroux.ajax.makeRequest({
                type: 'POST',
                url: path,
                data: values,
                datatype: 'json',
                cache: false,
                contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
                userAgent: 'XMLHttpRequest',
                lang: 'en',
                processData: true,
                headers: { 'X-Requested-With': 'XMLHttpRequest', 'X-Wrapper-Function': 'laroux.js' },
                success: function(data, wrapperFunc) {
                    if (wrapperFunc == 'laroux.js') {
                        if (!data.isSuccess) {
                            laroux.popupFunc('Error: ' + data.errorMessage);
                            return;
                        }

                        if (fnc != null) {
                            var obj;

                            if (typeof window.JSON != 'undefined') {
                                obj = window.JSON.parse(data.object);
                            } else {
                                obj = eval(data.object);
                            }

                            fnc(obj);
                        }

                        return;
                    }

                    fnc(data);
                },
                error: function(data) {
                    console.log(data);
                }
            });
        },

        //! confusion between loadScript and getScript
        getScript: function(path, fnc) {
            laroux.ajax.makeRequest({
                type: 'GET',
                url: path,
                data: undefined,
                datatype: 'script',
                cache: true,
                contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
                userAgent: 'XMLHttpRequest',
                lang: 'en',
                processData: true,
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
                success: fnc,
                error: function(data) {
                    console.log(data);
                }
            });
        }
    };
    
    // stack
    laroux.stack = function() {
        this.entries = {};

        this.add = function(id, entry) {
            this.entries[id] = entry;
        };

        this.addRange = function(entryArray) {
            for (var entry in entryArray) {
                this.entries[entry] = entryArray[entry];
            }
        };

        this.clear = function() {
            this.entries = {};
        };

        this.length = function() {
            return Object.keys(this.entries).length;
        }
    };

    // initialization
    this.$l = this.laroux = laroux;
}).call(this);
