import PromiseObject from '../laroux.promiseObject.js';
import helpers from '../laroux.helpers.js';

export default (function () {
    'use strict';

    let dom = {
        docprop: function (propName) {
            return document.documentElement.classList.contains(propName);
        },

        select: function (selector, parent) {
            return helpers.toArray(
                (parent || document).querySelectorAll(selector)
            );
        },

        selectByClass: function (selector, parent) {
            return helpers.toArray(
                (parent || document).getElementsByClassName(selector)
            );
        },

        selectByTag: function (selector, parent) {
            return helpers.toArray(
                (parent || document).getElementsByTagName(selector)
            );
        },

        selectById: function (selector, parent) {
            return (parent || document).getElementById(selector);
        },

        selectSingle: function (selector, parent) {
            return (parent || document).querySelector(selector);
        },

        attr: function (element, attributes, value) {
            if (value === undefined && attributes.constructor !== Object) {
                return element.getAttribute(attributes);
            }

            let elements = helpers.getAsArray(element);
            if (typeof attributes === 'string') {
                let oldAttributes = attributes;
                attributes = {};
                attributes[oldAttributes] = value;
            }

            for (let attributeName in attributes) {
                if (!attributes.hasOwnProperty(attributeName)) {
                    continue;
                }

                for (let i = 0, length = elements.length; i < length; i++) {
                    if (attributes[attributeName] === null) {
                        element.removeAttribute(attributeName);
                    } else {
                        element.setAttribute(attributeName, attributes[attributeName]);
                    }
                }
            }
        },

        data: function (element, datanames, value) {
            if (value === undefined && datanames.constructor !== Object) {
                return element.getAttribute('data-' + datanames);
            }

            let elements = helpers.getAsArray(element);
            if (typeof datanames === 'string') {
                let oldDatanames = datanames;
                datanames = {};
                datanames[oldDatanames] = value;
            }

            for (let dataName in datanames) {
                if (!datanames.hasOwnProperty(dataName)) {
                    continue;
                }

                for (let i = 0, length = elements.length; i < length; i++) {
                    if (datanames[dataName] === null) {
                        element.removeAttribute('data-' + dataName);
                    } else {
                        element.setAttribute('data-' + dataName, datanames[dataName]);
                    }
                }
            }
        },

        eventHistory: [],
        setEvent: function (element, eventname, callback) {
            let elements = helpers.getAsArray(element);

            for (let i = 0, length = elements.length; i < length; i++) {
                dom.setEventSingle(elements[i], eventname, callback);
            }
        },

        setEventSingle: function (element, eventname, callback) {
            let callbackWrapper = function (e) {
                if (callback(e, element) === false) {
                    if (e.preventDefault) {
                        e.preventDefault();
                    } else {
                        event.returnValue = false;
                    }
                }
            };

            dom.eventHistory.push({ element: element, eventname: eventname, callback: callback, callbackWrapper: callbackWrapper });
            element.addEventListener(eventname, callbackWrapper, false);
        },

        unsetEvent: function (element, eventname, callback) {
            let elements = helpers.getAsArray(element);

            for (let i1 = 0, length1 = elements.length; i1 < length1; i1++) {
                for (let i2 = 0, length2 = dom.eventHistory.length; i2 < length2; i2++) {
                    let item = dom.eventHistory[i2];

                    if (item === undefined) {
                        continue;
                    }

                    if (item.element !== elements[i1]) {
                        continue;
                    }

                    if (eventname !== undefined && item.eventname !== eventname) {
                        continue;
                    }

                    if (callback !== undefined && item.callback !== callback) {
                        continue;
                    }

                    item.element.removeEventListener(item.eventname, item.callbackWrapper, false);
                    delete dom.eventHistory[i2];
                }
            }
        },

        dispatchEvent: function (element, eventname, data) {
            let customEvent = document.createEvent('Event');
            for (let item in data) {
                if (!data.hasOwnProperty(item)) {
                    continue;
                }

                customEvent[item] = data[item];
            }

            customEvent.initEvent(eventname, true, true);
            element.dispatchEvent(customEvent);
        },

        create: function (html) {
            let frag = document.createDocumentFragment(),
                temp = document.createElement('DIV');

            temp.insertAdjacentHTML('beforeend', html);
            while (temp.firstChild) {
                frag.appendChild(temp.firstChild);
            }

            // nulling out the reference, there is no obvious dispose method
            temp = null;

            return frag;
        },

        createElement: function (element, attributes, children) {
            let elem = document.createElement(element);

            if (attributes !== undefined && attributes.constructor === Object) {
                for (let item in attributes) {
                    if (!attributes.hasOwnProperty(item)) {
                        continue;
                    }

                    elem.setAttribute(item, attributes[item]);
                }
            }

            if (children !== undefined) {
                if (children.constructor === Object) {
                    for (let item2 in children) {
                        if (!children.hasOwnProperty(item2)) {
                            continue;
                        }

                        elem.setAttribute(item2, children[item2]);
                    }
                } else if (/* typeof children === 'string' && */children.length > 0) {
                    dom.append(elem, children);
                }
            }

            return elem;
        },

        createOption: function (element, key, value, isDefault) {
            /* old behaviour, does not support optgroups as parents.
            let count = element.options.length;
            element.options[count] = new Option(value, key);

            if (isDefault === true) {
                element.options.selectedIndex = count - 1;
            }
            */

            let option = document.createElement('OPTION');
            option.setAttribute('value', key);
            if (isDefault === true) {
                option.setAttribute('checked', 'checked');
            }

            dom.append(option, value);
            element.appendChild(option);
        },

        selectByValue: function (element, value) {
            for (let i = 0, length = element.options.length; i < length; i++) {
                if (element.options[i].getAttribute('value') == value) {
                    element.selectedIndex = i;
                    break;
                }
            }
        },/*,

        // TODO: it's redundant for now
        loadImage: function () {
            let images = [];

            for (let i = 0, length = arguments.length; i < length; i++) {
                let image = document.createElement('IMG');
                image.setAttribute('src', arguments[i]);

                images.push(image);
            }

            return images;
        },

        loadAsyncStyle: function (path, triggerName, async) {
            let elem = document.createElement('LINK');

            elem.type = 'text/css';
            elem.async = (async !== undefined) ? async : true;
            elem.href = path;
            elem.rel = 'stylesheet';

            let loaded = false;
            elem.onload = elem.onreadystatechange = function () {
                if ((elem.readyState && elem.readyState !== 'complete' && elem.readyState !== 'loaded') || loaded) {
                    return false;
                }

                elem.onload = elem.onreadystatechange = null;
                loaded = true;
                if (triggerName) {
                    if (typeof triggerName === 'function') {
                        triggerName();
                    } else {
                        triggers.ontrigger(triggerName);
                    }
                }
            };

            let head = document.getElementsByTagName('head')[0];
            head.appendChild(elem);
        },*/

        clear: function (element) {
            while (element.hasChildNodes()) {
                element.removeChild(element.firstChild);
            }
        },

        insert: function (element, position, content) {
            element.insertAdjacentHTML(position, content);
        },

        prepend: function (element, content) {
            element.insertAdjacentHTML('afterbegin', content);
        },

        append: function (element, content) {
            element.insertAdjacentHTML('beforeend', content);
        },

        replace: function (element, content) {
            dom.clear(element);
            element.insertAdjacentHTML('afterbegin', content);
        },

        replaceText: function (element, content) {
            // dom.clear(element);
            element.textContent = content;
        },

        remove: function (element) {
            element.remove();
        },

        cloneReturn: 0,
        cloneAppend: 1,
        cloneInsertAfter: 2,
        cloneInsertBefore: 3,

        clone: function (element, type, container, target) {
            let newElement = element.cloneNode(true);

            if (container === undefined) {
                container = element.parentNode;
            }
            if (target === undefined) {
                target = element;
            }

            if (type !== undefined && type != dom.cloneReturn) {
                if (type == dom.cloneAppend) {
                    container.appendChild(newElement);
                } else if (type == dom.cloneInsertAfter) {
                    container.insertBefore(newElement, target.nextSibling);
                } else { // type == dom.cloneInsertBefore
                    container.insertBefore(newElement, target);
                }
            }

            return newElement;
        },

        loadScript: function (url, async) {
            return new PromiseObject(function (resolve, reject) {
                let elem = document.createElement('script');

                elem.type = 'text/javascript';
                if (async !== undefined) {
                    elem.async = async;
                }

                if (elem.readyState !== undefined) {
                    elem.onreadystatechange = function () {
                        if (elem.readyState in ['loaded', 'complete']) {
                            elem.onreadystatechange = null;
                            resolve(elem);
                        }
                    };
                } else {
                    elem.onload = function () {
                        resolve(elem);
                    };
                }

                elem.src = url;

                let head = document.getElementsByTagName('head')[0];
                head.appendChild(elem);
            });
        } /*,

        // TODO: it's redundant for now
        applyOperations: function (element, operations) {
            for (let operation in operations) {
                if (!operations.hasOwnProperty(operation)) {
                    continue;
                }

                for (let binding in operations[operation]) {
                    if (!operations[operation].hasOwnProperty(binding)) {
                        continue;
                    }

                    let value = operations[operation][binding];

                    switch (operation) {
                        case 'setprop':
                            if (binding.substring(0, 1) === '_') {
                                element.setAttribute(binding.substring(1), value);
                                continue;
                            }

                            if (binding === 'content') {
                                dom.replace(element, value);
                                continue;
                            }
                            break;
                        case 'addprop':
                            if (binding.substring(0, 1) === '_') {
                                element.setAttribute(binding.substring(1), element.getAttribute(binding.substring(1)) + value);
                                continue;
                            }

                            if (binding === 'content') {
                                dom.append(element, value);
                                continue;
                            }
                            break;
                        case 'removeprop':
                            if (value.substring(0, 1) === '_') {
                                element.removeAttribute(value.substring(1));
                                continue;
                            }

                            if (value === 'content') {
                                dom.clear(element);
                                continue;
                            }
                            break;
                        case 'addclass':
                            css.addClass(element, value);
                            break;
                        case 'removeclass':
                            css.removeClass(element, value);
                            break;
                        case 'addstyle':
                            css.setProperty(element, binding, value);
                            break;
                        case 'removestyle':
                            css.setProperty(element, value, 'inherit !important');
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

    // a fix for Internet Explorer
    if (typeof Element !== 'undefined') {
        if (Element.prototype.remove === undefined) {
            Element.prototype.remove = function () {
                if (this.parentElement !== null) {
                    this.parentElement.removeChild(this);
                }
            };
        }
    }

    return dom;

})();
