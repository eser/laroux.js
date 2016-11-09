/*jslint node: true */
/*global Hogan, Mustache, Handlebars, _ */
'use strict';

import helpers from './laroux.helpers.js';

let templates = {
    engines: {
        plain: {
            compile: function (template, options) {
                return [template, options];
            },

            render: function (compiled, model) {
                let result = compiled[0],
                    dict = [],
                    lastIndex = 0,
                    nextIndex;

                while ((nextIndex = result.indexOf('{{', lastIndex)) !== -1) {
                    nextIndex += 2;
                    let closeIndex = result.indexOf('}}', nextIndex);
                    if (closeIndex === -1) {
                        break;
                    }

                    let key = result.substring(nextIndex, closeIndex);
                    dict['{{' + key + '}}'] = helpers.getElement(model, key, '');
                    lastIndex = closeIndex + 2;
                }

                return helpers.replaceAll(result, dict);
            }
        },

        hogan: {
            compile: function (template, options) {
                return Hogan.compile(template, options);
            },

            render: function (compiled, model) {
                return compiled.render(model);
            }
        },

        mustache: {
            compile: function (template, options) {
                return Mustache.compile(template, options);
            },

            render: function (compiled, model) {
                return compiled(model);
            }
        },

        handlebars: {
            compile: function (template, options) {
                return Handlebars.compile(template, options);
            },

            render: function (compiled, model) {
                return compiled(model);
            }
        },

        lodash: {
            compile: function (template, options) {
                /*jslint nomen: true */
                return _.compile(template, null, options);
            },

            render: function (compiled, model) {
                return compiled(model);
            }
        },

        underscore: {
            compile: function (template, options) {
                /*jslint nomen: true */
                return _.compile(template, null, options);
            },

            render: function (compiled, model) {
                return compiled(model);
            }
        }
    },
    engine: 'plain',

    apply: function (element, model, options) {
        let content, engine = templates.engines[templates.engine];

        if (element.nodeType === 1 || element.nodeType === 3 || element.nodeType === 11) {
            content = element.textContent;
        } else {
            content = element.nodeValue;
        }

        let compiled = engine.compile(content, options);
        return engine.render(compiled, model);
    }

    /*
    insert: function (element, model, target, position, options) {
        let output = templates.apply(element, model, options);

        dom.insert(target, position || 'beforeend', output);
    },

    replace: function (element, model, target, options) {
        let output = templates.apply(element, model, options);

        dom.replace(target, output);
    }
    */
};

export default templates;
