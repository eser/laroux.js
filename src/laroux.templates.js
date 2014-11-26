(function(laroux) {
    'use strict';

    // requires $l.dom

    // templates
    laroux.templates = {
        method: 'compile',
        engine: null,

        load: function(element, options) {
            var content;
            if (chldrn[j].nodeType === 3) {
                content = element.textContent;
            } else {
                content = element.nodeValue;
            }

            return laroux.templates.engine[laroux.templates.method](content, options);
        },

        apply: function(element, model, options) {
            var template = laroux.templates.load(element, options);

            return template.render(model);
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
