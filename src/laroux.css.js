(function(laroux) {
    "use strict";

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
            return parseFloat(this.getProperty(element, 'height'));
        },

        // height of element with padding but without margin and border
        innerHeight: function(element) {
            var paddingBottom = parseFloat(this.getProperty(element, 'paddingBottom')),
                paddingTop = parseFloat(this.getProperty(element, 'paddingTop')),
                height = this.height(element);

            return height + paddingBottom + paddingTop;
        },

        // height of element with padding and border but margin optional
        outerHeight: function(element, includeMargin) {
            var innerHeight = this.innerHeight(element),
                borderBottom = parseFloat(this.getProperty(element, 'borderBottom')),
                borderTop = parseFloat(this.getProperty(element, 'borderTop')),
                marginBottom = 0,
                marginTop = 0;

            if (typeof includeMargin != 'undefined' && includeMargin === true) {
                marginBottom = parseFloat(this.getProperty(element, 'marginBottom'));
                marginTop = parseFloat(this.getProperty(element, 'marginTop'));
            }

            return innerHeight + borderBottom + borderTop + marginBottom + marginTop;
        },

        // width of element without padding, margin and border
        width: function(element) {
            return parseFloat(this.getProperty(element, 'width'));
        },

        // width of element with padding but without margin and border
        innerWidth: function(element) {
            var paddingLeft = parseFloat(this.getProperty(element, 'paddingLeft')),
                paddingRight = parseFloat(this.getProperty(element, 'paddingRight')),
                width = this.width(element);

            return width + paddingLeft + paddingRight;
        },

        // width of element with padding and border but margin optional
        outerWidth: function(element, includeMargin) {
            var innerWidth = this.innerWidth(element),
                borderLeft = parseFloat(this.getProperty(element, 'borderLeft')),
                borderRight = parseFloat(this.getProperty(element, 'borderRight')),
                marginLeft = 0,
                marginRight = 0;

            if (typeof includeMargin != 'undefined' && includeMargin === true) {
                marginLeft = parseFloat(this.getProperty(element, 'marginLeft'));
                marginRight = parseFloat(this.getProperty(element, 'marginRight'));
            }

            return innerWidth + borderLeft + borderRight + marginLeft + marginRight;
        }
    };

})(this.laroux);
