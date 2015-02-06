module.exports = (function () {
    'use strict';

    var laroux_dom = require('./laroux.dom.js'),
        laroux_ajax = require('./laroux.ajax.js');

    // forms
    var laroux_forms = {
        ajaxForm: function (formobj, fnc, fncBegin) {
            laroux_dom.setEvent(formobj, 'submit', function () {
                if (fncBegin !== undefined) {
                    fncBegin();
                }

                laroux_ajax.post(
                    formobj.getAttribute('action'),
                    laroux_forms.serializeFormData(formobj),
                    fnc
                );

                return false;
            });
        },

        isFormField: function (element) {
            if (element.tagName === 'SELECT') {
                return true;
            }

            if (element.tagName === 'INPUT') {
                var type = element.getAttribute('type').toUpperCase();

                if (type === 'FILE' || type === 'CHECKBOX' || type === 'RADIO' || type === 'TEXT' || type === 'PASSWORD' || type === 'HIDDEN') {
                    return true;
                }

                return false;
            }

            if (element.tagName === 'TEXTAREA') {
                return true;
            }

            return false;
        },

        getFormFieldValue: function (element) {
            if (element.disabled === true) {
                return null;
            }

            if (element.tagName === 'SELECT') {
                return element.options[element.selectedIndex].value;
            }

            if (element.tagName === 'INPUT') {
                var type = element.getAttribute('type').toUpperCase();

                if (type === 'FILE') {
                    return element.files[0];
                }

                if (type === 'CHECKBOX' || type === 'RADIO') {
                    if (element.checked) {
                        return element.value;
                    }

                    return null;
                }

                if (type === 'TEXT' || type === 'PASSWORD' || type === 'HIDDEN') {
                    return element.value;
                }

                return null;
            }

            if (element.tagName === 'TEXTAREA') {
                return element.value;
            }

            return null;
        },

        setFormFieldValue: function (element, value) {
            if (element.disabled === true) {
                return;
            }

            if (element.tagName === 'SELECT') {
                for (var option in element.options) {
                    if (!element.options.hasOwnProperty(option)) {
                        continue;
                    }

                    if (element.options[option].value == value) {
                        element.selectedIndex = option;
                        return;
                    }
                }

                return;
            }

            if (element.tagName == 'INPUT') {
                var type = element.getAttribute('type').toUpperCase();

                if (type == 'FILE') {
                    element.files[0] = value;
                    return;
                }

                if (type == 'CHECKBOX' || type == 'RADIO') {
                    if (value === true || value == element.value) {
                        element.checked = true;
                    }

                    return;
                }

                if (type == 'TEXT' || type == 'PASSWORD' || type == 'HIDDEN') {
                    element.value = value;
                    return;
                }

                return;
            }

            if (element.tagName == 'TEXTAREA') {
                element.value = value;
                return;
            }
        },

        toggleFormEditing: function (formobj, value) {
            var selection = formobj.querySelectorAll('*[name]');

            if (value === undefined) {
                if (formobj.getAttribute('data-last-enabled') === null) {
                    formobj.setAttribute('data-last-enabled', 'enabled');
                    value = false;
                } else {
                    formobj.removeAttribute('data-last-enabled');
                    value = true;
                }
            }

            for (var selected = 0, length = selection.length; selected < length; selected++) {
                if (!laroux_forms.isFormField(selection[selected])) {
                    continue;
                }

                var lastDisabled = selection[selected].getAttribute('data-last-disabled');
                if (!value) {
                    if (lastDisabled === null) {
                        if (selection[selected].getAttribute('disabled') !== null) {
                            selection[selected].setAttribute('data-last-disabled', 'disabled');
                        }
                    }

                    selection[selected].setAttribute('disabled', 'disabled');
                    continue;
                }

                if (lastDisabled !== null) {
                    selection[selected].removeAttribute('data-last-disabled');
                } else {
                    selection[selected].removeAttribute('disabled');
                }
            }
        },

        serializeFormData: function (formobj) {
            var formdata = new FormData();
            var selection = formobj.querySelectorAll('*[name]');

            for (var selected = 0, length = selection.length; selected < length; selected++) {
                var value = laroux_forms.getFormFieldValue(selection[selected]);

                if (value !== null) {
                    formdata.append(selection[selected].getAttribute('name'), value);
                }
            }

            return formdata;
        },

        serialize: function (formobj) {
            var values = {};
            var selection = formobj.querySelectorAll('*[name]');

            for (var selected = 0, length = selection.length; selected < length; selected++) {
                var value = laroux_forms.getFormFieldValue(selection[selected]);

                if (value !== null) {
                    values[selection[selected].getAttribute('name')] = value;
                }
            }

            return values;
        },

        deserialize: function (formobj, data) {
            var selection = formobj.querySelectorAll('*[name]');

            for (var selected = 0, length = selection.length; selected < length; selected++) {
                laroux_forms.setFormFieldValue(selection[selected], data[selection[selected].getAttribute('name')]);
            }
        }
    };

    return laroux_forms;

}());
