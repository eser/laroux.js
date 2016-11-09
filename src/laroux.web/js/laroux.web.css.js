/*jslint node: true */
/*global $l, getComputedStyle, document, innerHeight, innerWidth */
'use strict';

let web_css = {
    // class features
    hasClass: function (element, className) {
        return element.classList.contains(className);
    },

    addClass: function (element, className) {
        let elements = $l.getAsArray(element);

        for (let i = 0, length = elements.length; i < length; i++) {
            elements[i].classList.add(className);
        }
    },

    removeClass: function (element, className) {
        let elements = $l.getAsArray(element);

        for (let i = 0, length = elements.length; i < length; i++) {
            elements[i].classList.remove(className);
        }
    },

    toggleClass: function (element, className) {
        let elements = $l.getAsArray(element);

        for (let i = 0, length = elements.length; i < length; i++) {
            if (elements[i].classList.contains(className)) {
                elements[i].classList.remove(className);
            } else {
                elements[i].classList.add(className);
            }
        }
    },

    cycleClass: function (elements, className) {
        for (let i = 0, length = elements.length; i < length; i++) {
            if (elements[i].classList.contains(className)) {
                elements[i].classList.remove(className);
                elements[(i + 1) % length].classList.add(className);
                return;
            }
        }
    },

    // style features
    getProperty: function (element, styleName) {
        let style = getComputedStyle(element);

        styleName = $l.antiCamelCase(styleName);

        return style.getPropertyValue(styleName);
    },

    setProperty: function (element, properties, value) {
        let elements = $l.getAsArray(element);

        if (typeof properties === 'string') {
            let oldProperties = properties;
            properties = {};
            properties[oldProperties] = value;
        }

        for (let styleName in properties) {
            if (!properties.hasOwnProperty(styleName)) {
                continue;
            }

            let newStyleName = $l.camelCase(styleName);

            for (let i = 0, length = elements.length; i < length; i++) {
                elements[i].style[newStyleName] = properties[styleName];
            }
        }
    },

    // transition features
    defaultTransition: '2s ease',

    setTransitionSingle: function (element, transition) {
        let transitions = $l.getAsArray(transition),
            style = getComputedStyle(element),
            currentTransitions = style.getPropertyValue('transition') || style.getPropertyValue('-webkit-transition') ||
                style.getPropertyValue('-ms-transition') || '',
            currentTransitionsArray;

        if (currentTransitions.length > 0) {
            currentTransitionsArray = currentTransitions.split(',');
        } else {
            currentTransitionsArray = [];
        }

        for (let item in transitions) {
            if (!transitions.hasOwnProperty(item)) {
                continue;
            }

            let styleName,
                transitionProperties,
                pos = transitions[item].indexOf(' ');

            if (pos !== -1) {
                styleName = transitions[item].substring(0, pos);
                transitionProperties = transitions[item].substring(pos + 1);
            } else {
                styleName = transitions[item];
                transitionProperties = web_css.defaultTransition;
            }

            let found = false;
            for (let j = 0; j < currentTransitionsArray.length; j++) {
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

        let value = currentTransitionsArray.join(', ');

        element.style.transition = value;
        element.style.webkitTransition = value;
        element.style.msTransition = value;
    },

    setTransition: function (element, transition) {
        let elements = $l.getAsArray(element);

        for (let i = 0, length = elements.length; i < length; i++) {
            web_css.setTransitionSingle(elements[i], transition);
        }
    },

    show: function (element, transitionProperties) {
        if (transitionProperties !== undefined) {
            web_css.setTransition(element, 'opacity ' + transitionProperties);
        } else {
            web_css.setTransition(element, 'opacity');
        }

        web_css.setProperty(element, { opacity: 1 });
    },

    hide: function (element, transitionProperties) {
        if (transitionProperties !== undefined) {
            web_css.setTransition(element, 'opacity ' + transitionProperties);
        } else {
            web_css.setTransition(element, 'opacity');
        }

        web_css.setProperty(element, { opacity: 0 });
    },

    // measurement features
    // height of element without padding, margin and border
    height: function (element) {
        let style = getComputedStyle(element),
            height = style.getPropertyCSSValue('height');

        return height.getFloatValue(height.primitiveType);
    },

    // height of element with padding but without margin and border
    innerHeight: function (element) {
        return element.clientHeight;
    },

    // height of element with padding and border but margin optional
    outerHeight: function (element, includeMargin) {
        if (includeMargin || false) {
            return element.offsetHeight;
        }

        let style = getComputedStyle(element),
            marginTop = style.getPropertyCSSValue('margin-top'),
            marginBottom = style.getPropertyCSSValue('margin-bottom'),
            margins = marginTop.getFloatValue(marginTop.primitiveType) +
                marginBottom.getFloatValue(marginBottom.primitiveType);

        return Math.ceil(element.offsetHeight + margins);
    },

    // width of element without padding, margin and border
    width: function (element) {
        let style = getComputedStyle(element),
            height = style.getPropertyCSSValue('width');

        return height.getFloatValue(height.primitiveType);
    },

    // width of element with padding but without margin and border
    innerWidth: function (element) {
        return element.clientWidth;
    },

    // width of element with padding and border but margin optional
    outerWidth: function (element, includeMargin) {
        if (includeMargin || false) {
            return element.offsetWidth;
        }

        let style = getComputedStyle(element),
            marginLeft = style.getPropertyCSSValue('margin-left'),
            marginRight = style.getPropertyCSSValue('margin-right'),
            margins = marginLeft.getFloatValue(marginLeft.primitiveType) +
                marginRight.getFloatValue(marginRight.primitiveType);

        return Math.ceil(element.offsetWidth + margins);
    },

    top: function (element) {
        return element.getBoundingClientRect().top +
            ((document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop);
    },

    left: function (element) {
        return element.getBoundingClientRect().left +
            ((document.documentElement && document.documentElement.scrollLeft) || document.body.scrollLeft);
    },

    aboveTheTop: function (element) {
        return element.getBoundingClientRect().bottom <= 0;
    },

    belowTheFold: function (element) {
        return element.getBoundingClientRect().top > innerHeight;
    },

    leftOfScreen: function (element) {
        return element.getBoundingClientRect().right <= 0;
    },

    rightOfScreen: function (element) {
        return element.getBoundingClientRect().left > innerWidth;
    },

    inViewport: function (element) {
        let rect = element.getBoundingClientRect();

        return !(rect.bottom <= 0 || rect.top > innerHeight ||
            rect.right <= 0 || rect.left > innerWidth);
    }
};

export default web_css;
