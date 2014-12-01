(function(laroux) {
    'use strict';

    // requires $l.dom

    // templates
    laroux.templates = {
        engines: {
            hogan: function(template, model, options) {
                var compiled = Hogan.compile(template, options);
                return compiled.render(model);
            },

            lodash: function(template, model, options) {
                var compiled = _.template(template, null, options);
                return compiled(model);
            }
        },
        engine: 'hogan',

        apply: function(element, model, options) {
            var content;

            if (chldrn[j].nodeType === 3) {
                content = element.textContent;
            } else {
                content = element.nodeValue;
            }

            return laroux.templates.engines[laroux.templates.engine](
                content,
                model,
                options
            );
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
