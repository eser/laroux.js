/**
 * laroux.js - A jquery substitute for modern browsers (laroux-node bundle)
 *
 * @version v2.2.0
 * @link https://eserozvataf.github.io/laroux.js
 * @license Apache-2.0
 */
/*jslint node: true */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _larouxHelpersJs = require('./laroux.helpers.js');

var _larouxHelpersJs2 = _interopRequireDefault(_larouxHelpersJs);

var validation = {
    // TODO: email, date, equalTo
    rules: {
        required: {
            keys: ['message'],
            callback: function callback(dictionary, name, rule) {
                return name in dictionary;
            }
        },

        minlength: {
            keys: ['length', 'message'],
            callback: function callback(dictionary, name, rule) {
                return dictionary[name].length >= rule.length;
            }
        },

        maxlength: {
            keys: ['length', 'message'],
            callback: function callback(dictionary, name, rule) {
                return dictionary[name].length <= rule.length;
            }
        },

        min: {
            keys: ['value', 'message'],
            callback: function callback(dictionary, name, rule) {
                var floatValue = parseFloat(dictionary[name]);
                return floatValue >= rule.value;
            }
        },

        max: {
            keys: ['value', 'message'],
            callback: function callback(dictionary, name, rule) {
                var floatValue = parseFloat(dictionary[name]);
                return floatValue <= rule.value;
            }
        }
    },

    // {rule: 'required', message: 'isrequired'}
    // 'required'

    // {
    //    'name': 'required',
    //    'age': [
    //        'required|The field is required.',
    //        { rule: 'range', min: 10, max: 18 },
    //    ]
    // }

    validate: function validate(fields, rules) {
        var rulesKeys = Object.keys(rules),
            result = {
            success: true,
            details: {}
        };

        for (var i = 0, _length = rulesKeys.length; i < _length; i++) {
            var key = rulesKeys[i],
                rule = rules[key];

            var fieldRules = _larouxHelpersJs2['default'].getAsArray(rule);
            for (var j = 0, length2 = fieldRules.length; j < length2; j++) {
                var fieldRule = fieldRules[j];

                if (fieldRule.constructor !== Object) {
                    var fieldRuleSplitted = fieldRule.split('|'),
                        fieldRuleName = fieldRuleSplitted[0];

                    fieldRule = _larouxHelpersJs2['default'].assign(fieldRuleSplitted, ['name'].concat(validation.rules[fieldRuleName].keys));
                }

                if (!validation.rules[fieldRule.name].callback(fields, key, fieldRule)) {
                    result.success = false;

                    if (!(key in result.details)) {
                        result.details[key] = [];
                    }

                    result.details[key].push(fieldRule);
                }
            }
        }

        return result;
    }
};

exports['default'] = validation;
module.exports = exports['default'];