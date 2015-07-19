/*jslint node: true */
/*global $l, FormData */
'use strict';

let web_forms = {
    ajaxForm: function (formobj, callback, callbackBegin) {
        $l.web.dom.setEvent(formobj, 'submit', function () {
            if (callbackBegin !== undefined) {
                callbackBegin();
            }

            let promise = $l.ajax.fetch(
                formobj.getAttribute('action'),
                {
                    method: 'POST',
                    body: web_forms.serializeFormData(formobj)
                }
            );

            if (callback !== undefined) {
                promise.then(callback);
            }

            return false;
        });
    },

    isFormField: function (element) {
        if (element.tagName === 'SELECT') {
            return true;
        }

        if (element.tagName === 'INPUT') {
            let type = element.getAttribute('type').toUpperCase();

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
            let type = element.getAttribute('type').toUpperCase();

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
            for (let option in element.options) {
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

        if (element.tagName === 'INPUT') {
            let type = element.getAttribute('type').toUpperCase();

            if (type === 'FILE') {
                element.files[0] = value;
                return;
            }

            if (type === 'CHECKBOX' || type === 'RADIO') {
                if (value === true || value == element.value) {
                    element.checked = true;
                }

                return;
            }

            if (type === 'TEXT' || type === 'PASSWORD' || type === 'HIDDEN') {
                element.value = value;
                return;
            }

            return;
        }

        if (element.tagName === 'TEXTAREA') {
            element.value = value;
            return;
        }
    },

    toggleFormEditing: function (formobj, value) {
        let selection = formobj.querySelectorAll('*[name]');

        if (value === undefined) {
            if (formobj.getAttribute('data-last-enabled') === null) {
                formobj.setAttribute('data-last-enabled', 'enabled');
                value = false;
            } else {
                formobj.removeAttribute('data-last-enabled');
                value = true;
            }
        }

        for (let selected = 0, length = selection.length; selected < length; selected++) {
            if (!web_forms.isFormField(selection[selected])) {
                continue;
            }

            let lastDisabled = selection[selected].getAttribute('data-last-disabled');
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
        let formdata = new FormData();
        let selection = formobj.querySelectorAll('*[name]');

        for (let selected = 0, length = selection.length; selected < length; selected++) {
            let value = web_forms.getFormFieldValue(selection[selected]);

            if (value !== null) {
                formdata.append(selection[selected].getAttribute('name'), value);
            }
        }

        return formdata;
    },

    serialize: function (formobj) {
        let values = {};
        let selection = formobj.querySelectorAll('*[name]');

        for (let selected = 0, length = selection.length; selected < length; selected++) {
            let value = web_forms.getFormFieldValue(selection[selected]);

            if (value !== null) {
                values[selection[selected].getAttribute('name')] = value;
            }
        }

        return values;
    },

    deserialize: function (formobj, data) {
        let selection = formobj.querySelectorAll('*[name]');

        for (let selected = 0, length = selection.length; selected < length; selected++) {
            web_forms.setFormFieldValue(selection[selected], data[selection[selected].getAttribute('name')]);
        }
    },

    validate: function (formobj, rules) {
        let fields = web_forms.serialize(formobj);

        return $l.validation.validate(fields, rules);
    }
};

export default web_forms;
