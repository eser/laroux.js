(function(laroux) {
    'use strict';

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
