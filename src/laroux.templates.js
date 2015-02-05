(function (laroux) {
    'use strict';

    // requires $l.dom

    // templates
    laroux.templates = {
        engines: {
            plain: {
                compile: function (template, options) {
                    return [template, options];
                },

                render: function (compiled, model) {
                    var result = compiled[0],
                        dict = [],
                        lastIndex = 0,
                        nextIndex;

                    while ((nextIndex = result.indexOf('{{', lastIndex)) !== -1) {
                        nextIndex += 2;
                        var closeIndex = result.indexOf('}}', nextIndex);
                        if (closeIndex === -1) {
                            break;
                        }

                        var key = result.substring(nextIndex, closeIndex);
                        dict['{{' + key + '}}'] = laroux.helpers.getElement(model, key, '');
                        lastIndex = closeIndex + 2;
                    }

                    return laroux.helpers.replaceAll(result, dict);
                }
            },

            hogan: {
                compile: function (template, options) {
                    return laroux.parent.Hogan.compile(template, options);
                },

                render: function (compiled, model) {
                    return compiled.render(model);
                }
            },

            mustache: {
                compile: function (template, options) {
                    return laroux.parent.Mustache.compile(template, options);
                },

                render: function (compiled, model) {
                    return compiled(model);
                }
            },

            handlebars: {
                compile: function (template, options) {
                    return laroux.parent.Handlebars.compile(template, options);
                },

                render: function (compiled, model) {
                    return compiled(model);
                }
            },

            lodash: {
                compile: function (template, options) {
                    /*jslint nomen: true */
                    return laroux.parent._.compile(template, null, options);
                },

                render: function (compiled, model) {
                    return compiled(model);
                }
            },

            underscore: {
                compile: function (template, options) {
                    /*jslint nomen: true */
                    return laroux.parent._.compile(template, null, options);
                },

                render: function (compiled, model) {
                    return compiled(model);
                }
            }
        },
        engine: 'plain',

        apply: function (element, model, options) {
            var content, engine = laroux.templates.engines[laroux.templates.engine];

            if (element.nodeType === 1 || element.nodeType === 3 || element.nodeType === 11) {
                content = element.textContent;
            } else {
                content = element.nodeValue;
            }

            var compiled = engine.compile(content, options);
            return engine.render(compiled, model);
        },

        insert: function (element, model, target, position, options) {
            var output = laroux.templates.apply(element, model, options);

            laroux.dom.insert(target, position || 'beforeend', output);
        },

        replace: function (element, model, target, options) {
            var output = laroux.templates.apply(element, model, options);

            laroux.dom.replace(target, output);
        }
    };

}(this.laroux));
