/**
 * laroux.js - A jquery substitute for modern browsers (base bundle)
 *
 * @version v2.1.1
 * @link https://eserozvataf.github.io/laroux.js
 * @license Apache-2.0
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _larouxHelpersJs = require('./laroux.helpers.js');

var _larouxHelpersJs2 = _interopRequireDefault(_larouxHelpersJs);

exports['default'] = (function () {
    'use strict';

    var templates = {
        engines: {
            plain: {
                compile: function compile(template, options) {
                    return [template, options];
                },

                render: function render(compiled, model) {
                    var result = compiled[0],
                        dict = [],
                        lastIndex = 0,
                        nextIndex = undefined;

                    while ((nextIndex = result.indexOf('{{', lastIndex)) !== -1) {
                        nextIndex += 2;
                        var closeIndex = result.indexOf('}}', nextIndex);
                        if (closeIndex === -1) {
                            break;
                        }

                        var key = result.substring(nextIndex, closeIndex);
                        dict['{{' + key + '}}'] = _larouxHelpersJs2['default'].getElement(model, key, '');
                        lastIndex = closeIndex + 2;
                    }

                    return _larouxHelpersJs2['default'].replaceAll(result, dict);
                }
            },

            hogan: {
                compile: function compile(template, options) {
                    return Hogan.compile(template, options);
                },

                render: function render(compiled, model) {
                    return compiled.render(model);
                }
            },

            mustache: {
                compile: function compile(template, options) {
                    return Mustache.compile(template, options);
                },

                render: function render(compiled, model) {
                    return compiled(model);
                }
            },

            handlebars: {
                compile: function compile(template, options) {
                    return Handlebars.compile(template, options);
                },

                render: function render(compiled, model) {
                    return compiled(model);
                }
            },

            lodash: {
                compile: function compile(template, options) {
                    /*jslint nomen: true */
                    return _.compile(template, null, options);
                },

                render: function render(compiled, model) {
                    return compiled(model);
                }
            },

            underscore: {
                compile: function compile(template, options) {
                    /*jslint nomen: true */
                    return _.compile(template, null, options);
                },

                render: function render(compiled, model) {
                    return compiled(model);
                }
            }
        },
        engine: 'plain',

        apply: function apply(element, model, options) {
            var content = undefined,
                engine = templates.engines[templates.engine];

            if (element.nodeType === 1 || element.nodeType === 3 || element.nodeType === 11) {
                content = element.textContent;
            } else {
                content = element.nodeValue;
            }

            var compiled = engine.compile(content, options);
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

    return templates;
})();

module.exports = exports['default'];