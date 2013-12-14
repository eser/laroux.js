(function() {
    // "use strict";

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

        if (typeof parent == 'undefined') {
            return document.querySelector(selector);
        }

        return parent.querySelector(selector);
    };

    laroux.baseLocation = '';
    laroux.selectedMaster = '';
    laroux.popupFunc = alert;
    laroux.readyPassed = false;

    laroux.contentBegin = function(masterName, locationUrl) {
        laroux.baseLocation = locationUrl;
        laroux.selectedMaster = masterName;

        laroux.events.invoke('contentBegin');
    };

    laroux.contentEnd = function() {
        laroux.events.invoke('contentEnd');
        laroux.readyPassed = true;

        window.setInterval(laroux.timers.ontick, 500);
    };

    laroux.begin = function(fnc) {
        laroux.events.add('contentBegin', fnc);
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
                if (!laroux.timers.delegates.hasOwnProperty(key)) {
                    continue;
                }

                var keyObj = laroux.timers.delegates[key];

                if (keyObj.timeout === null) {
                    keyObj.fnc(keyObj.obj);
                } else {
                    keyObj.timeout -= 0.5;

                    if (keyObj.timeout < 0) {
                        keyObj.fnc(keyObj.obj);
                        removeKeys.unshift(key);
                    }
                }
            }

            for (var key2 in removeKeys) {
                if (!removeKeys.hasOwnProperty(key2)) {
                    continue;
                }

                laroux.timers.delegates.splice(removeKeys[key2], 1);
            }
        }
    };

    // triggers
    laroux.triggers = {
        delegates: [],
        list: [],

        set: function(condition, fnc, obj) {
            for (var key in condition) {
                if (!condition.hasOwnProperty(key)) {
                    continue;
                }

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
                if (!laroux.triggers.delegates.hasOwnProperty(key)) {
                    continue;
                }

                var count = 0;
                var keyObj = laroux.triggers.delegates[key];

                for (var conditionKey in keyObj.condition) {
                    if (!keyObj.condition.hasOwnProperty(conditionKey)) {
                        continue;
                    }

                    var conditionObj = keyObj.condition[conditionKey];

                    if (laroux.triggers.list.indexOf(conditionObj) != -1) {
                        count++;
                        // break;
                    }
                }

                if (count === 0) {
                    keyObj.fnc(keyObj.obj, eventArgs);
                    removeKeys.unshift(key);
                }
            }

            for (var key2 in removeKeys) {
                if (!removeKeys.hasOwnProperty(key2)) {
                    continue;
                }

                laroux.triggers.delegates.splice(removeKeys[key2], 1);
            }

            console.log('trigger name: ' + triggerName);
        }
    };

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
            // return document.querySelectorAll.apply(document, arguments);
        },

        selectByClass: function(selector, parent) {
            var elements;
            if (typeof parent == 'undefined') {
                elements = document.getElementsByClassName(selector);
            } else {
                elements = parent.getElementsByClassName(selector);
            }

            return Array.prototype.slice.call(elements);
            // return document.getElementsByClassName.apply(document, arguments);
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

        remove: function(element) {
            if (element.parentElement !== null) {
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
            return element.classList.contains(className);
        },

        addClass: function(element, className) {
            element.classList.add(className);
        },

        removeClass: function(element, className) {
            element.classList.remove(className);
        },

        toggleClass: function(element, className) {
            if (element.classList.contains(className)) {
                element.classList.remove(className);
            } else {
                element.classList.add(className);
            }
        },

        getProperty: function(element, styleName) {
            var style = window.getComputedStyle(element);

            return style.getPropertyValue(styleName);
        },

        setProperty: function(element, styleName, value) {
            var elements = laroux.helpers.getAsArray(element);
            var newStyleName = laroux.helpers.camelCase(styleName);

            for (var i = elements.length - 1;i >= 0; i--) {
                elements[i].style[newStyleName] = value;
            }
        },

        setTransitions: function(element, transitions) {
            var elements = laroux.helpers.getAsArray(element);

            for (var styleName in transitions) {
                if (!transitions.hasOwnProperty(styleName)) {
                    continue;
                }

                var value = transitions[styleName];
                var newStyleName = laroux.helpers.camelCase(styleName);

                for (var i = elements.length - 1;i >= 0; i--) {
                    var style = window.getComputedStyle(elements[i]);
                    var currentTransitions = style.getPropertyValue('transition');

                    if (currentTransitions !== null) {
                        var currentTransitionsArray = currentTransitions.split(',');
                        for (var j = 0; j < currentTransitionsArray.length; j++) {
                            if (currentTransitionsArray[j].trim().localeCompare(styleName) === 0) {
                                delete currentTransitionsArray[j];
                            }
                        }

                        if (value !== null) {
                            elements[i].style.transition = currentTransitionsArray.join(', ') + ', ' + styleName + ' ' + value;
                        } else {
                            elements[i].style.transition = currentTransitionsArray.join(', ');
                        }
                    } else if (value !== null) {
                        elements[i].style.transition = styleName + ' ' + value;
                    }
                }
            }
        },

        transition: function(element, transitions, callback) {
            var elements = laroux.helpers.getAsArray(element);

            for (var styleName in transitions) {
                if (!transitions.hasOwnProperty(styleName)) {
                    continue;
                }

                var value = (transitions[styleName] instanceof Array) ? transitions[styleName] : [ transitions[styleName] ];
                if (typeof value[1] == 'undefined') {
                    value[1] = '2s ease';
                }

                var newStyleName = laroux.helpers.camelCase(styleName);

                for (var i = elements.length - 1;i >= 0; i--) {
                    var style = window.getComputedStyle(elements[i]);
                    var currentTransitions = style.getPropertyValue('transition');

                    if (currentTransitions !== null) {
                        var currentTransitionsArray = currentTransitions.split(',');
                        for (var j = 0; j < currentTransitionsArray.length; j++) {
                            if (currentTransitionsArray[j].trim().localeCompare(styleName) === 0) {
                                delete currentTransitionsArray[j];
                            }
                        }

                        if (value[1] !== null) {
                            elements[i].style.transition = currentTransitionsArray.join(', ') + ', ' + styleName + ' ' + value[1];
                        } else {
                            elements[i].style.transition = currentTransitionsArray.join(', ');
                        }
                    } else if (value[1] !== null) {
                        elements[i].style.transition = styleName + ' ' + value;
                    }

                    elements[i].style[newStyleName] = value[0];
                    laroux.dom.unsetEvent(elements[i], 'transitionend');
                    if (typeof callback != 'undefined') {
                        laroux.dom.setEvent(elements[i], 'transitionend', callback);
                    }
                }
            }
        }
    };

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
                if (value.charAt(j) == '-') {
                    flag = true;
                    continue;
                }

                output += (!flag) ? value.charAt(j) : value.charAt(j).toUpperCase();
                flag = false;
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
            if (element.disabled == true) {
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

    // storage
    laroux.storage = {
        data: [], // default with noframe

        install: function() {
            if (typeof parent != 'undefined' && typeof parent.frames.hidden != 'undefined') {
                if (typeof parent.frames.hidden.storage == 'undefined') {
                    parent.frames.hidden.storage = [];
                }

                laroux.storage.data = parent.frames.hidden.storage;
            }
        },

        flush: function() {
            laroux.storage.data.length = 0;
        },

        exists: function(key) {
            return (typeof laroux.storage.data[key] != 'undefined');
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

        _xhrf: null,
        _xhr: function() {
            if (laroux.ajax._xhrf === null) {
                laroux.ajax._xhrf = new XMLHttpRequest();
            }

            return laroux.ajax._xhrf;
        },

        _xhrResp: function(xhr, dataType) {
            if (typeof dataType == 'undefined') {
                dataType = xhr.getResponseHeader('Content-Type').split(';')[0];
            }            

            var wrapperFunction = xhr.getResponseHeader('X-Response-Wrapper-Function');
            var response;

            dataType = dataType.toLowerCase();
            if (dataType.indexOf('json') >= 0) {
                response = JSON.parse(xhr.responseText);
            } else if (dataType.indexOf('script') >= 0) {
                response = eval(xhr.responseText);
            } else if (dataType.indexOf('xml') >= 0) {
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
            var xhr = laroux.ajax._xhr();
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
                        var dt = (options.dataType || '');
                        var isSuccess = true;

                        try {
                            res = laroux.ajax._xhrResp(xhr, dt, options);
                        } catch (e) {
                            if (typeof options.error != 'undefined') {
                                options.error(xhr, xhr.status, xhr.statusText);
                            }

                            laroux.events.invoke('ajaxError', [xhr, xhr.statusText, options]);
                            isSuccess = false;
                        }

                        if (isSuccess) {
                            if (typeof options.success != 'undefined' && res !== null) {
                                options.success(res.response, res.wrapperFunc);
                            }

                            laroux.events.invoke('ajaxSuccess', [xhr, res.response, options]);
                        }
                    } else {
                        if (typeof options.error != 'undefined') {
                            options.error(xhr, xhr.status, xhr.statusText);
                        }

                        laroux.events.invoke('ajaxError', [xhr, xhr.statusText, options]);
                    }

                    if (typeof options.complete != 'undefined') {
                        options.complete(xhr, xhr.statusText);
                    }

                    laroux.events.invoke('ajaxComplete', [xhr, options]);
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

            xhr.open(options.type, url, true);

            try {
                for (var i in options.headers) {
                    if (!options.headers.hasOwnProperty(i)) {
                        continue;
                    }

                    xhr.setRequestHeader(i, options.headers[i]);
                }
            } catch(e) {
                console.log(e)
            }

            var data = null;
            if (typeof options.postdata != 'undefined') {
                if (options.postdata instanceof FormData) {
                    data = options.postdata;
                } else {
                    data = laroux.helpers.buildFormData(options.postdata);
                }
            }

            xhr.send(data);
        },

        get: function(path, values, fnc) {
            laroux.ajax.makeRequest({
                type: 'GET',
                url: path,
                getdata: values,
                datatype: 'json',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-Wrapper-Function': 'laroux.js'
                },
                success: fnc,
                error: function(data) {
                    console.log(data);
                }
            });
        },

        getScript: function(path, fnc) {
            laroux.ajax.makeRequest({
                type: 'GET',
                url: path,
                datatype: 'script',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                success: fnc,
                error: function(data) {
                    console.log(data);
                }
            });
        },

        post: function(path, values, fnc) {
            laroux.ajax.makeRequest({
                type: 'POST',
                url: path,
                postdata: values,
                datatype: 'json',
                headers: {
                //     'Content-Type': 'multipart/form-data; charset=UTF-8; boundary=' + Math.random().toString().substr(2),
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-Wrapper-Function': 'laroux.js'
                },
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
                if (!entryArray.hasOwnProperty(entry)) {
                    continue;
                }

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
