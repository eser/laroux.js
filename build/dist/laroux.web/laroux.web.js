/**
 * laroux.js - A jquery substitute for modern browsers (laroux.web bundle)
 *
 * @version v2.2.0
 * @link https://larukedi.github.io/laroux.js
 * @license Apache-2.0
 */
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*jslint node: true */
/*global $l, document, requestAnimationFrame, scrollTo */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _larouxWebCssJs = require('./laroux.web.css.js');

var _larouxWebCssJs2 = _interopRequireDefault(_larouxWebCssJs);

var web_anim = {
    data: [],

    fx: {
        interpolate: function interpolate(source, target, shift) {
            return source + (target - source) * shift;
        },

        easing: function easing(pos) {
            return -Math.cos(pos * Math.PI) / 2 + 0.5;
        }
    },

    // {object, property, from, to, time, unit, reset}
    set: function set(newanim) {
        newanim.deferred = new $l.promise(function (resolve, reject) {
            newanim.deferredResolve = resolve;
            newanim.deferredReject = reject;
        });

        newanim.startTime = undefined;

        if (newanim.unit === null || newanim.unit === undefined) {
            newanim.unit = '';
        }

        if (newanim.from === null || newanim.from === undefined) {
            if (newanim.object === document.body && newanim.property === 'scrollTop') {
                newanim.from = document.documentElement && document.documentElement.scrollTop || document.body.scrollTop;
            } else {
                newanim.from = newanim.object[newanim.property];
            }
        }

        if (newanim.from.constructor === String) {
            newanim.from = Number(newanim.from);
        }

        // if (newanim.id === undefined) {
        //     newanim.id = $l.getUniqueId();
        // }

        web_anim.data.push(newanim);
        if (web_anim.data.length === 1) {
            requestAnimationFrame(web_anim.onframe);
        }

        return newanim.deferred;
    },

    setCss: function setCss(newanim) {
        if (newanim.from === null || newanim.from === undefined) {
            newanim.from = _larouxWebCssJs2['default'].getProperty(newanim.object, newanim.property);
        }

        newanim.object = newanim.object.style;
        newanim.property = $l.camelCase(newanim.property);

        return web_anim.set(newanim);
    },

    remove: function remove(id) {
        var targetKey = null;

        for (var item in web_anim.data) {
            if (!web_anim.data.hasOwnProperty(item)) {
                continue;
            }

            var currentItem = web_anim.data[item];

            if (currentItem.id !== undefined && currentItem.id == id) {
                targetKey = item;
                break;
            }
        }

        if (targetKey !== null) {
            var deferred = web_anim.data[targetKey];

            deferred.deferredReject('stop');

            web_anim.data.splice(targetKey, 1);
            return true;
        }

        return false;
    },

    onframe: function onframe(timestamp) {
        var removeKeys = [];

        for (var item in web_anim.data) {
            if (!web_anim.data.hasOwnProperty(item)) {
                continue;
            }

            var currentItem = web_anim.data[item];
            if (currentItem.startTime === undefined) {
                currentItem.startTime = timestamp;
            }

            web_anim.step(currentItem, timestamp);

            if (timestamp > currentItem.startTime + currentItem.time) {
                if (currentItem.reset === true) {
                    currentItem.startTime = timestamp;
                    if (currentItem.object === document.body && currentItem.property === 'scrollTop') {
                        scrollTo(0, currentItem.from);
                        // setTimeout(function () { scrollTo(0, currentItem.from); }, 1);
                    } else {
                        currentItem.object[currentItem.property] = currentItem.from;
                    }
                } else {
                    removeKeys = $l.prependArray(removeKeys, item);
                    currentItem.deferredResolve();
                }
            }
        }

        for (var item2 in removeKeys) {
            if (!removeKeys.hasOwnProperty(item2)) {
                continue;
            }

            web_anim.data.splice(removeKeys[item2], 1);
        }

        if (web_anim.data.length > 0) {
            requestAnimationFrame(web_anim.onframe);
        }
    },

    step: function step(newanim, timestamp) {
        var finishT = newanim.startTime + newanim.time,
            shift = timestamp > finishT ? 1 : (timestamp - newanim.startTime) / newanim.time;

        var value = web_anim.fx.interpolate(newanim.from, newanim.to, web_anim.fx.easing(shift)) + newanim.unit;

        if (newanim.object === document.body && newanim.property === 'scrollTop') {
            scrollTo(0, value);
            // setTimeout(function () { scrollTo(0, value); }, 1);
        } else {
            newanim.object[newanim.property] = value;
        }
    }
};

exports['default'] = web_anim;
module.exports = exports['default'];
},{"./laroux.web.css.js":2}],2:[function(require,module,exports){
/*jslint node: true */
/*global $l, getComputedStyle, document, innerHeight, innerWidth */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
var web_css = {
    // class features
    hasClass: function hasClass(element, className) {
        return element.classList.contains(className);
    },

    addClass: function addClass(element, className) {
        var elements = $l.getAsArray(element);

        for (var i = 0, _length = elements.length; i < _length; i++) {
            elements[i].classList.add(className);
        }
    },

    removeClass: function removeClass(element, className) {
        var elements = $l.getAsArray(element);

        for (var i = 0, _length2 = elements.length; i < _length2; i++) {
            elements[i].classList.remove(className);
        }
    },

    toggleClass: function toggleClass(element, className) {
        var elements = $l.getAsArray(element);

        for (var i = 0, _length3 = elements.length; i < _length3; i++) {
            if (elements[i].classList.contains(className)) {
                elements[i].classList.remove(className);
            } else {
                elements[i].classList.add(className);
            }
        }
    },

    cycleClass: function cycleClass(elements, className) {
        for (var i = 0, _length4 = elements.length; i < _length4; i++) {
            if (elements[i].classList.contains(className)) {
                elements[i].classList.remove(className);
                elements[(i + 1) % _length4].classList.add(className);
                return;
            }
        }
    },

    // style features
    getProperty: function getProperty(element, styleName) {
        var style = getComputedStyle(element);

        styleName = $l.antiCamelCase(styleName);

        return style.getPropertyValue(styleName);
    },

    setProperty: function setProperty(element, properties, value) {
        var elements = $l.getAsArray(element);

        if (typeof properties === 'string') {
            var oldProperties = properties;
            properties = {};
            properties[oldProperties] = value;
        }

        for (var styleName in properties) {
            if (!properties.hasOwnProperty(styleName)) {
                continue;
            }

            var newStyleName = $l.camelCase(styleName);

            for (var i = 0, _length5 = elements.length; i < _length5; i++) {
                elements[i].style[newStyleName] = properties[styleName];
            }
        }
    },

    // transition features
    defaultTransition: '2s ease',

    setTransitionSingle: function setTransitionSingle(element, transition) {
        var transitions = $l.getAsArray(transition),
            style = getComputedStyle(element),
            currentTransitions = style.getPropertyValue('transition') || style.getPropertyValue('-webkit-transition') || style.getPropertyValue('-ms-transition') || '',
            currentTransitionsArray = undefined;

        if (currentTransitions.length > 0) {
            currentTransitionsArray = currentTransitions.split(',');
        } else {
            currentTransitionsArray = [];
        }

        for (var item in transitions) {
            if (!transitions.hasOwnProperty(item)) {
                continue;
            }

            var styleName = undefined,
                transitionProperties = undefined,
                pos = transitions[item].indexOf(' ');

            if (pos !== -1) {
                styleName = transitions[item].substring(0, pos);
                transitionProperties = transitions[item].substring(pos + 1);
            } else {
                styleName = transitions[item];
                transitionProperties = web_css.defaultTransition;
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

    setTransition: function setTransition(element, transition) {
        var elements = $l.getAsArray(element);

        for (var i = 0, _length6 = elements.length; i < _length6; i++) {
            web_css.setTransitionSingle(elements[i], transition);
        }
    },

    show: function show(element, transitionProperties) {
        if (transitionProperties !== undefined) {
            web_css.setTransition(element, 'opacity ' + transitionProperties);
        } else {
            web_css.setTransition(element, 'opacity');
        }

        web_css.setProperty(element, { opacity: 1 });
    },

    hide: function hide(element, transitionProperties) {
        if (transitionProperties !== undefined) {
            web_css.setTransition(element, 'opacity ' + transitionProperties);
        } else {
            web_css.setTransition(element, 'opacity');
        }

        web_css.setProperty(element, { opacity: 0 });
    },

    // measurement features
    // height of element without padding, margin and border
    height: function height(element) {
        var style = getComputedStyle(element),
            height = style.getPropertyCSSValue('height');

        return height.getFloatValue(height.primitiveType);
    },

    // height of element with padding but without margin and border
    innerHeight: function innerHeight(element) {
        return element.clientHeight;
    },

    // height of element with padding and border but margin optional
    outerHeight: function outerHeight(element, includeMargin) {
        if (includeMargin || false) {
            return element.offsetHeight;
        }

        var style = getComputedStyle(element),
            marginTop = style.getPropertyCSSValue('margin-top'),
            marginBottom = style.getPropertyCSSValue('margin-bottom'),
            margins = marginTop.getFloatValue(marginTop.primitiveType) + marginBottom.getFloatValue(marginBottom.primitiveType);

        return Math.ceil(element.offsetHeight + margins);
    },

    // width of element without padding, margin and border
    width: function width(element) {
        var style = getComputedStyle(element),
            height = style.getPropertyCSSValue('width');

        return height.getFloatValue(height.primitiveType);
    },

    // width of element with padding but without margin and border
    innerWidth: function innerWidth(element) {
        return element.clientWidth;
    },

    // width of element with padding and border but margin optional
    outerWidth: function outerWidth(element, includeMargin) {
        if (includeMargin || false) {
            return element.offsetWidth;
        }

        var style = getComputedStyle(element),
            marginLeft = style.getPropertyCSSValue('margin-left'),
            marginRight = style.getPropertyCSSValue('margin-right'),
            margins = marginLeft.getFloatValue(marginLeft.primitiveType) + marginRight.getFloatValue(marginRight.primitiveType);

        return Math.ceil(element.offsetWidth + margins);
    },

    top: function top(element) {
        return element.getBoundingClientRect().top + (document.documentElement && document.documentElement.scrollTop || document.body.scrollTop);
    },

    left: function left(element) {
        return element.getBoundingClientRect().left + (document.documentElement && document.documentElement.scrollLeft || document.body.scrollLeft);
    },

    aboveTheTop: function aboveTheTop(element) {
        return element.getBoundingClientRect().bottom <= 0;
    },

    belowTheFold: function belowTheFold(element) {
        return element.getBoundingClientRect().top > innerHeight;
    },

    leftOfScreen: function leftOfScreen(element) {
        return element.getBoundingClientRect().right <= 0;
    },

    rightOfScreen: function rightOfScreen(element) {
        return element.getBoundingClientRect().left > innerWidth;
    },

    inViewport: function inViewport(element) {
        var rect = element.getBoundingClientRect();

        return !(rect.bottom <= 0 || rect.top > innerHeight || rect.right <= 0 || rect.left > innerWidth);
    }
};

exports['default'] = web_css;
module.exports = exports['default'];
},{}],3:[function(require,module,exports){
(function (global){
/*jslint node: true */
/*global $l, document, event, Element */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
var web_dom = {
    docprop: function docprop(propName) {
        return document.documentElement.classList.contains(propName);
    },

    select: function select(selector, parent) {
        return $l.toArray((parent || document).querySelectorAll(selector));
    },

    selectByClass: function selectByClass(selector, parent) {
        return $l.toArray((parent || document).getElementsByClassName(selector));
    },

    selectByTag: function selectByTag(selector, parent) {
        return $l.toArray((parent || document).getElementsByTagName(selector));
    },

    selectById: function selectById(selector, parent) {
        return (parent || document).getElementById(selector);
    },

    selectSingle: function selectSingle(selector, parent) {
        return (parent || document).querySelector(selector);
    },

    attr: function attr(element, attributes, value) {
        if (value === undefined && attributes.constructor !== Object) {
            return element.getAttribute(attributes);
        }

        var elements = $l.getAsArray(element);
        if (typeof attributes === 'string') {
            var oldAttributes = attributes;
            attributes = {};
            attributes[oldAttributes] = value;
        }

        for (var attributeName in attributes) {
            if (!attributes.hasOwnProperty(attributeName)) {
                continue;
            }

            for (var i = 0, _length = elements.length; i < _length; i++) {
                if (attributes[attributeName] === null) {
                    element.removeAttribute(attributeName);
                } else {
                    element.setAttribute(attributeName, attributes[attributeName]);
                }
            }
        }
    },

    data: function data(element, datanames, value) {
        if (value === undefined && datanames.constructor !== Object) {
            return element.getAttribute('data-' + datanames);
        }

        var elements = $l.getAsArray(element);
        if (typeof datanames === 'string') {
            var oldDatanames = datanames;
            datanames = {};
            datanames[oldDatanames] = value;
        }

        for (var dataName in datanames) {
            if (!datanames.hasOwnProperty(dataName)) {
                continue;
            }

            for (var i = 0, _length2 = elements.length; i < _length2; i++) {
                if (datanames[dataName] === null) {
                    element.removeAttribute('data-' + dataName);
                } else {
                    element.setAttribute('data-' + dataName, datanames[dataName]);
                }
            }
        }
    },

    eventHistory: [],
    setEvent: function setEvent(element, eventname, callback) {
        var elements = $l.getAsArray(element);

        for (var i = 0, _length3 = elements.length; i < _length3; i++) {
            web_dom.setEventSingle(elements[i], eventname, callback);
        }
    },

    setEventSingle: function setEventSingle(element, eventname, callback) {
        var callbackWrapper = function callbackWrapper(e) {
            if (callback(e, element) === false) {
                if (e.preventDefault) {
                    e.preventDefault();
                } else {
                    event.returnValue = false;
                }
            }
        };

        web_dom.eventHistory.push({ element: element, eventname: eventname, callback: callback, callbackWrapper: callbackWrapper });
        element.addEventListener(eventname, callbackWrapper, false);
    },

    unsetEvent: function unsetEvent(element, eventname, callback) {
        var elements = $l.getAsArray(element);

        for (var i1 = 0, length1 = elements.length; i1 < length1; i1++) {
            for (var i2 = 0, length2 = web_dom.eventHistory.length; i2 < length2; i2++) {
                var item = web_dom.eventHistory[i2];

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
                delete web_dom.eventHistory[i2];
            }
        }
    },

    dispatchEvent: function dispatchEvent(element, eventname, data) {
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

    create: function create(html) {
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

    createElement: function createElement(element, attributes, children) {
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
            } else if ( /* typeof children === 'string' && */children.length > 0) {
                web_dom.append(elem, children);
            }
        }

        return elem;
    },

    createOption: function createOption(element, key, value, isDefault) {
        /* old behaviour, does not support optgroups as parents.
        let count = element.options.length;
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

        web_dom.append(option, value);
        element.appendChild(option);
    },

    selectByValue: function selectByValue(element, value) {
        for (var i = 0, _length4 = element.options.length; i < _length4; i++) {
            if (element.options[i].getAttribute('value') == value) {
                element.selectedIndex = i;
                break;
            }
        }
    }, /*,
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

    clear: function clear(element) {
        while (element.hasChildNodes()) {
            element.removeChild(element.firstChild);
        }
    },

    insert: function insert(element, position, content) {
        element.insertAdjacentHTML(position, content);
    },

    prepend: function prepend(element, content) {
        element.insertAdjacentHTML('afterbegin', content);
    },

    append: function append(element, content) {
        element.insertAdjacentHTML('beforeend', content);
    },

    replace: function replace(element, content) {
        web_dom.clear(element);
        element.insertAdjacentHTML('afterbegin', content);
    },

    replaceText: function replaceText(element, content) {
        // web_dom.clear(element);
        element.textContent = content;
    },

    remove: function remove(element) {
        element.remove();
    },

    cloneReturn: 0,
    cloneAppend: 1,
    cloneInsertAfter: 2,
    cloneInsertBefore: 3,

    clone: function clone(element, type, container, target) {
        var newElement = element.cloneNode(true);

        if (container === undefined) {
            container = element.parentNode;
        }
        if (target === undefined) {
            target = element;
        }

        if (type !== undefined && type != web_dom.cloneReturn) {
            if (type == web_dom.cloneAppend) {
                container.appendChild(newElement);
            } else if (type == web_dom.cloneInsertAfter) {
                container.insertBefore(newElement, target.nextSibling);
            } else {
                // type == web_dom.cloneInsertBefore
                container.insertBefore(newElement, target);
            }
        }

        return newElement;
    },

    loadScript: function loadScript(url, async) {
        return new $l.promise(function (resolve, reject) {
            var elem = document.createElement('script');

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

            var head = document.getElementsByTagName('head')[0];
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
                            web_dom.replace(element, value);
                            continue;
                        }
                        break;
                    case 'addprop':
                        if (binding.substring(0, 1) === '_') {
                            element.setAttribute(binding.substring(1), element.getAttribute(binding.substring(1)) + value);
                            continue;
                        }
                         if (binding === 'content') {
                            web_dom.append(element, value);
                            continue;
                        }
                        break;
                    case 'removeprop':
                        if (value.substring(0, 1) === '_') {
                            element.removeAttribute(value.substring(1));
                            continue;
                        }
                         if (value === 'content') {
                            web_dom.clear(element);
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
if ('Element' in global) {
    if (Element.prototype.remove === undefined) {
        Element.prototype.remove = function () {
            if (this.parentElement !== null) {
                this.parentElement.removeChild(this);
            }
        };
    }
}

exports['default'] = web_dom;
module.exports = exports['default'];
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],4:[function(require,module,exports){
/*jslint node: true */
/*global $l, FormData */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
var web_forms = {
    ajaxForm: function ajaxForm(formobj, callback, callbackBegin) {
        $l.dom.setEvent(formobj, 'submit', function () {
            if (callbackBegin !== undefined) {
                callbackBegin();
            }

            var promise = $l.ajax.fetch(formobj.getAttribute('action'), {
                method: 'POST',
                body: web_forms.serializeFormData(formobj)
            });

            if (callback !== undefined) {
                promise.then(callback);
            }

            return false;
        });
    },

    isFormField: function isFormField(element) {
        if (element.tagName === 'SELECT') {
            return true;
        }

        if (element.tagName === 'INPUT') {
            var type = element.getAttribute('type').toUpperCase();

            if (type === 'FILE' || type === 'CHECKBOX' || type === 'RADIO' || type === 'TEXT' || type === 'PASSWORD' || type === 'HIDDEN') {
                return true;
            }

            return false;
        }

        if (element.tagName === 'TEXTAREA') {
            return true;
        }

        return false;
    },

    getFormFieldValue: function getFormFieldValue(element) {
        if (element.disabled === true) {
            return null;
        }

        if (element.tagName === 'SELECT') {
            return element.options[element.selectedIndex].value;
        }

        if (element.tagName === 'INPUT') {
            var type = element.getAttribute('type').toUpperCase();

            if (type === 'FILE') {
                return element.files[0];
            }

            if (type === 'CHECKBOX' || type === 'RADIO') {
                if (element.checked) {
                    return element.value;
                }

                return null;
            }

            if (type === 'TEXT' || type === 'PASSWORD' || type === 'HIDDEN') {
                return element.value;
            }

            return null;
        }

        if (element.tagName === 'TEXTAREA') {
            return element.value;
        }

        return null;
    },

    setFormFieldValue: function setFormFieldValue(element, value) {
        if (element.disabled === true) {
            return;
        }

        if (element.tagName === 'SELECT') {
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

        if (element.tagName === 'INPUT') {
            var type = element.getAttribute('type').toUpperCase();

            if (type === 'FILE') {
                element.files[0] = value;
                return;
            }

            if (type === 'CHECKBOX' || type === 'RADIO') {
                if (value === true || value == element.value) {
                    element.checked = true;
                }

                return;
            }

            if (type === 'TEXT' || type === 'PASSWORD' || type === 'HIDDEN') {
                element.value = value;
                return;
            }

            return;
        }

        if (element.tagName === 'TEXTAREA') {
            element.value = value;
            return;
        }
    },

    toggleFormEditing: function toggleFormEditing(formobj, value) {
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

        for (var selected = 0, _length = selection.length; selected < _length; selected++) {
            if (!web_forms.isFormField(selection[selected])) {
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

    serializeFormData: function serializeFormData(formobj) {
        var formdata = new FormData();
        var selection = formobj.querySelectorAll('*[name]');

        for (var selected = 0, _length2 = selection.length; selected < _length2; selected++) {
            var value = web_forms.getFormFieldValue(selection[selected]);

            if (value !== null) {
                formdata.append(selection[selected].getAttribute('name'), value);
            }
        }

        return formdata;
    },

    serialize: function serialize(formobj) {
        var values = {};
        var selection = formobj.querySelectorAll('*[name]');

        for (var selected = 0, _length3 = selection.length; selected < _length3; selected++) {
            var value = web_forms.getFormFieldValue(selection[selected]);

            if (value !== null) {
                values[selection[selected].getAttribute('name')] = value;
            }
        }

        return values;
    },

    deserialize: function deserialize(formobj, data) {
        var selection = formobj.querySelectorAll('*[name]');

        for (var selected = 0, _length4 = selection.length; selected < _length4; selected++) {
            web_forms.setFormFieldValue(selection[selected], data[selection[selected].getAttribute('name')]);
        }
    },

    validate: function validate(formobj, rules) {
        var fields = web_forms.serialize(formobj);

        return $l.validation.validate(fields, rules);
    }
};

exports['default'] = web_forms;
module.exports = exports['default'];
},{}],5:[function(require,module,exports){
(function (global){
/*jslint node: true */
/*global $l, document */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _larouxWebAnimJs = require('./laroux.web.anim.js');

var _larouxWebAnimJs2 = _interopRequireDefault(_larouxWebAnimJs);

var _larouxWebCssJs = require('./laroux.web.css.js');

var _larouxWebCssJs2 = _interopRequireDefault(_larouxWebCssJs);

var _larouxWebDomJs = require('./laroux.web.dom.js');

var _larouxWebDomJs2 = _interopRequireDefault(_larouxWebDomJs);

var _larouxWebFormsJs = require('./laroux.web.forms.js');

var _larouxWebFormsJs2 = _interopRequireDefault(_larouxWebFormsJs);

var _larouxWebKeysJs = require('./laroux.web.keys.js');

var _larouxWebKeysJs2 = _interopRequireDefault(_larouxWebKeysJs);

var _larouxWebRoutesJs = require('./laroux.web.routes.js');

var _larouxWebRoutesJs2 = _interopRequireDefault(_larouxWebRoutesJs);

var _larouxWebTouchJs = require('./laroux.web.touch.js');

var _larouxWebTouchJs2 = _interopRequireDefault(_larouxWebTouchJs);

var web = {
    anim: _larouxWebAnimJs2['default'],
    css: _larouxWebCssJs2['default'],
    dom: _larouxWebDomJs2['default'],
    forms: _larouxWebFormsJs2['default'],
    keys: _larouxWebKeysJs2['default'],
    routes: _larouxWebRoutesJs2['default'],
    touch: _larouxWebTouchJs2['default'],

    cached: {
        single: {},
        array: {},
        id: {}
    },

    c: function c(selector) {
        if (selector.constructor === Array) {
            return web.cached.array[selector] || (web.cached.array[selector] = $l.toArray(document.querySelectorAll(selector)));
        }

        return web.cached.single[selector] || (web.cached.single[selector] = document.querySelector(selector));
    },

    id: function id(selector, parent) {
        return (parent || document).getElementById(selector);
    },

    idc: function idc(selector) {
        return web.cached.id[selector] || (web.cached.id[selector] = document.getElementById(selector));
    }
};

if ('document' in global) {
    document.addEventListener('DOMContentLoaded', $l.setReady);
}

// $l.extendNs('web', web);
$l.extend(web);

exports['default'] = web;
module.exports = exports['default'];
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./laroux.web.anim.js":1,"./laroux.web.css.js":2,"./laroux.web.dom.js":3,"./laroux.web.forms.js":4,"./laroux.web.keys.js":6,"./laroux.web.routes.js":7,"./laroux.web.touch.js":8}],6:[function(require,module,exports){
/*jslint node: true */
/*global $l, event, document */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _larouxWebFormsJs = require('./laroux.web.forms.js');

var _larouxWebFormsJs2 = _interopRequireDefault(_larouxWebFormsJs);

var web_keys = {
    keyName: function keyName(keycode) {
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

    // {target, key, shift, ctrl, alt, disableInputs, callback}
    assign: function assign(options) {
        var wrapper = function wrapper(ev) {
            if (!ev) {
                ev = event;
            }

            var element = ev.target || ev.srcElement;
            if (element.nodeType === 3 || element.nodeType === 11) {
                // element.nodeType === 1 ||
                element = element.parentNode;
            }

            if (options.disableInputs && _larouxWebFormsJs2['default'].isFormField(element)) {
                return;
            }

            if (options.shift && !ev.shiftKey) {
                return;
            }

            if (options.ctrl && !ev.ctrlKey) {
                return;
            }

            if (options.alt && !ev.altKey) {
                return;
            }

            var key = web_keys.keyName(options.key);
            if (key !== (ev.keyCode || ev.which)) {
                return;
            }

            options.callback(ev);

            return false;
        };

        $l.dom.setEvent(options.target || document, 'keydown', wrapper);
    }
};

exports['default'] = web_keys;
module.exports = exports['default'];
},{"./laroux.web.forms.js":4}],7:[function(require,module,exports){
(function (global){
/*jslint node: true */
/*global $l, location, addEventListener, removeEventListener */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
// routes - partially taken from 'routie' project
//          can be found at: https://github.com/jgallen23/routie
//          see laroux.web.routes.LICENSE file for details
var web_routes = {
    map: {},
    attached: false,
    current: null,

    regexConverter: function regexConverter(path, sensitive, strict) {
        var keys = [],
            regexString = path.concat(strict ? '' : '/?').replace(/\/\(/g, '(?:/').replace(/\+/g, '__plus__').replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?/g, function (_, slash, format, key, capture, optional) {
            keys.push({ name: key, optional: !!optional });
            slash = slash || '';

            return '' + (optional ? '' : slash) + '(?:' + (optional ? slash : '') + (format || '') + (capture || (format && '([^/.]+?)' || '([^/]+?)')) + ')' + (optional || '');
        }).replace(/([\/.])/g, '\\$1').replace(/__plus__/g, '(.+)').replace(/\*/g, '(.*)');

        return {
            regex: new RegExp('^' + regexString + '$', sensitive ? '' : 'i'),
            keys: keys
        };
    },

    add: function add(path, callback) {
        web_routes.addNamed(null, path, callback);
    },

    addNamed: function addNamed(name, path, callback) {
        if (!(path in web_routes.map)) {
            var converted = web_routes.regexConverter(path);

            web_routes.map[path] = {
                name: name,
                callback: callback,
                params: {},
                keys: converted.keys,
                regex: converted.regex
            };
        } else {
            web_routes.map[path].callback = callback;
        }
    },

    get: function get(path) {
        for (var item in web_routes.map) {
            if (!web_routes.map.hasOwnProperty(item)) {
                continue;
            }

            var route = web_routes.map[item],
                match = route.regex.exec(path);

            if (!match) {
                continue;
            }

            var params = {};
            for (var i = 1, _length = match.length; i < _length; i++) {
                var key = route.keys[i - 1];

                if (key !== undefined) {
                    params[key.name] = typeof match[i] === 'string' ? decodeURIComponent(match[i]) : match[i];
                }
            }

            return {
                route: item,
                resolved: path,
                params: params,
                callback: route.callback
            };
        }

        return null;
    },

    getNamed: function getNamed(name, params) {
        for (var item in web_routes.map) {
            if (!web_routes.map.hasOwnProperty(item)) {
                continue;
            }

            var route = web_routes.map[item],
                path = item;

            for (var i = 0, _length2 = route.keys.length; i < _length2; i++) {
                var key = route.keys[i];

                path = path.replace(':' + key.name, params[key.name] || '');
            }

            if (route.name == name) {
                return {
                    route: item,
                    resolved: path,
                    params: params,
                    callback: route.callback
                };
            }
        }

        return null;
    },

    link: function link(name, params) {
        var route = web_routes.getNamed(name, params);

        if (route === null) {
            return null;
        }

        return route.resolved;
    },

    exec: function exec(route) {
        var previous = web_routes.current,
            args = $l.map(route.params, function (value) {
            return value;
        });

        web_routes.current = route;
        args.push({
            previous: previous,
            current: web_routes.current
        });

        return route.callback.apply(global, args);
    },

    go: function go(path, silent) {
        var attached = web_routes.attached;

        if (silent && attached) {
            web_routes.detach();
        }

        setTimeout(function () {
            location.hash = path;

            if (silent && attached) {
                setTimeout(function () {
                    web_routes.attach();
                }, 1);
            }
        }, 1);
    },

    goNamed: function goNamed(name, params, silent) {
        var path = web_routes.link(name, params);

        if (path === null) {
            return null;
        }

        web_routes.go(path, silent);
    },

    reload: function reload() {
        var hash = location.hash.substring(1),
            route = web_routes.get(hash);

        if (route === null) {
            return;
        }

        web_routes.exec(route);
    },

    attach: function attach() {
        addEventListener('hashchange', web_routes.reload, false);
        web_routes.attached = true;
    },

    detach: function detach() {
        removeEventListener('hashchange', web_routes.reload);
        web_routes.attached = false;
    }
};

$l.ready(web_routes.attach);

exports['default'] = web_routes;
module.exports = exports['default'];
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],8:[function(require,module,exports){
/*jslint node: true */
/*global $l, document, navigator */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
// touch - partially taken from 'tocca.js' project
//         can be found at: https://github.com/GianlucaGuarini/Tocca.js
//         see laroux.web.touch.LICENSE file for details
var web_touch = {
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

    locatePointer: function locatePointer(event) {
        if (event.targetTouches) {
            event = event.targetTouches[0];
        }

        web_touch.pos = [event.pageX, event.pageY];
    },

    init: function init() {
        var events = [0, navigator.msPointerEnabled ? 2 : 1, 3];

        for (var i = 0, _length = events.length; i < _length; i++) {
            $l.dom.setEventSingle(document, web_touch.events.start[events[i]], web_touch.onstart);
            $l.dom.setEventSingle(document, web_touch.events.end[events[i]], web_touch.onend);
            $l.dom.setEventSingle(document, web_touch.events.move[events[i]], web_touch.locatePointer);
        }
    },

    onstart: function onstart(event) {
        web_touch.locatePointer(event);
        web_touch.cached = [web_touch.pos[0], web_touch.pos[1]];
        web_touch.touchStarted = Date.now();
        /*jslint plusplus: true */
        web_touch.tapCount++;

        var callback = function callback() {
            if (web_touch.cached[0] >= web_touch.pos[0] - web_touch.precision && web_touch.cached[0] <= web_touch.pos[0] + web_touch.precision && web_touch.cached[1] >= web_touch.pos[1] - web_touch.precision && web_touch.cached[1] <= web_touch.pos[1] + web_touch.precision) {
                if (web_touch.touchStarted === null) {
                    $l.dom.dispatchEvent(event.target, web_touch.tapCount === 2 ? 'dbltap' : 'tap', {
                        innerEvent: event,
                        x: web_touch.pos[0],
                        y: web_touch.pos[1]
                    });

                    web_touch.tapCount = 0;
                    return;
                }

                if (Date.now() - web_touch.touchStarted > web_touch.longTapTreshold) {
                    $l.dom.dispatchEvent(event.target, 'longtap', {
                        innerEvent: event,
                        x: web_touch.pos[0],
                        y: web_touch.pos[1]
                    });

                    web_touch.touchStarted = null;
                    web_touch.tapCount = 0;
                    return;
                }

                web_touch.tapTimer = setTimeout(callback, web_touch.tapTreshold);
                return;
            }

            web_touch.tapCount = 0;
        };

        clearTimeout(web_touch.tapTimer);
        web_touch.tapTimer = setTimeout(callback, web_touch.tapTreshold);
    },

    onend: function onend(event) {
        var delta = [web_touch.pos[0] - web_touch.cached[0], web_touch.pos[1] - web_touch.cached[1]],
            data = {
            innerEvent: event,
            x: web_touch.pos[0],
            y: web_touch.pos[1],
            distance: {
                x: Math.abs(delta[0]),
                y: Math.abs(delta[1])
            }
        };

        web_touch.touchStarted = null;

        if (delta[0] <= -web_touch.swipeTreshold) {
            $l.dom.dispatchEvent(event.target, 'swiperight', data);
        }

        if (delta[0] >= web_touch.swipeTreshold) {
            $l.dom.dispatchEvent(event.target, 'swipeleft', data);
        }

        if (delta[1] <= -web_touch.swipeTreshold) {
            $l.dom.dispatchEvent(event.target, 'swipedown', data);
        }

        if (delta[1] >= web_touch.swipeTreshold) {
            $l.dom.dispatchEvent(event.target, 'swipeup', data);
        }
    }
};

$l.ready(web_touch.init);

exports['default'] = web_touch;
module.exports = exports['default'];
},{}]},{},[5]);
