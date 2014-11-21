(function(laroux) {
    'use strict';

    // requires $l.helpers
    // requires $l.triggers

    // dom
    laroux.dom = {
        docprop: function(propName) {
            return document.documentElement.classList.contains(propName);
        },

        select: function(selector, parent) {
            return Array.prototype.slice.call(
                (parent || document).querySelectorAll(selector)
            );
        },

        selectByClass: function(selector, parent) {
            return Array.prototype.slice.call(
                (parent || document).getElementsByClassName(selector)
            );
        },

        selectById: function(selector, parent) {
            return (parent || document).getElementById(selector);
        },

        selectSingle: function(selector, parent) {
            return (parent || document).querySelector(selector);
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

        eventHistory: {},
        setEvent: function(element, eventname, fnc) {
            var elements = laroux.helpers.getAsArray(element);

            for (var i = elements.length; i--; ) {
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
                laroux.dom.eventHistory[element] = {};
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

            for (var i = elements.length; i--; ) {
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

            temp.insertAdjacentHTML('beforeend', html);
            while (temp.firstChild) {
                frag.appendChild(temp.firstChild);
            }
            temp.remove();

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
            } else if (typeof children == 'string' && children.length > 0) {
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
            for (var i = element.options.length; i--; ) {
                if (element.options[i].getAttribute('value') == value) {
                    element.selectedIndex = i;
                    break;
                }
            }
        },/*,

        // TODO: it's redundant for now
        loadImage: function() {
            var images = [];

            for (var i = arguments.length; i--; ) {
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
        },*/

        clear: function(element) {
            while (element.hasChildNodes()) {
                element.firstChild.remove();
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

})(this.laroux);
