(function(laroux) {
    "use strict";

    // requires $l.helpers
    // requires $l.dom

    // css
    laroux.css = {
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

        setTransitionSingle: function(element, transitions) {
            var style = getComputedStyle(element);
            var currentTransitions = style.getPropertyValue('transition') || style.getPropertyValue('-webkit-transition') ||
                style.getPropertyValue('-ms-transition') || '';

            var currentTransitionsArray;
            if (currentTransitions.length > 0) {
                currentTransitionsArray = currentTransitions.split(',');
            } else {
                currentTransitionsArray = [];
            }

            for (var styleName in transitions) {
                if (!transitions.hasOwnProperty(styleName)) {
                    continue;
                }

                var found = false;
                for (var j = 0; j < currentTransitionsArray.length; j++) {
                    if (currentTransitionsArray[j].trim().localeCompare(styleName) === 0) {
                        currentTransitionsArray[j] = styleName + ' ' + transitions[styleName];
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    currentTransitionsArray.push(styleName + ' ' + transitions[styleName]);
                }
            }

            var value = currentTransitionsArray.join(', ');

            element.style.transition = value;
            element.style.webkitTransition = value;
            element.style.msTransition = value;
        },

        setTransition: function(element, transitions) {
            var elements = laroux.helpers.getAsArray(element);

            for (var i = elements.length - 1;i >= 0; i--) {
                laroux.css.setTransitionSingle(element, transitions);
            }
        },

        defaultTransition: '2s ease',
        // todo: move this under anim to get rid of $l.dom dependency
        transition: function(element, transitions, callback) {
            var elements = laroux.helpers.getAsArray(element);

            var newTransitions = {};
            var newValues = {};
            for (var styleName in transitions) {
                if (!transitions.hasOwnProperty(styleName)) {
                    continue;
                }

                if (transitions[styleName] instanceof Array) {
                    newValues[styleName] = transitions[styleName][0];

                    if (typeof transitions[styleName][1] != 'undefined') {
                        newTransitions[styleName] = transitions[styleName][1];
                    } else {
                        newTransitions[styleName] = laroux.css.defaultTransition;
                    }
                } else {
                    newValues[styleName] = transitions[styleName];
                    newTransitions[styleName] = laroux.css.defaultTransition;
                }
            }

            for (var i = elements.length - 1;i >= 0; i--) {
                laroux.css.setTransitionSingle(elements[i], newTransitions);
                laroux.css.setProperty(elements[i], newValues);

                laroux.dom.unsetEvent(elements[i], 'transitionend');
                if (typeof callback != 'undefined') {
                    laroux.dom.setEvent(elements[i], 'transitionend', callback);
                }
            }
        },

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
