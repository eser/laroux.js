/*jslint node: true */
/*global FormData */
'use strict';

import ajax from '../laroux.ajax.js';
import dom from './laroux.dom.js';
import validation from '../laroux.validation.js';

let forms = {
    ajaxForm: function (formobj, callback, callbackBegin) {
        dom.setEvent(formobj, 'submit', function () {
            if (callbackBegin !== undefined) {
                callbackBegin();
            }

            let promise = ajax.fetch(
                formobj.getAttribute('action'),
                {
                    method: 'POST',
                    body: forms.serializeFormData(formobj)
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
            if (!forms.isFormField(selection[selected])) {
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
            let value = forms.getFormFieldValue(selection[selected]);

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
            let value = forms.getFormFieldValue(selection[selected]);

            if (value !== null) {
                values[selection[selected].getAttribute('name')] = value;
            }
        }

        return values;
    },

    validate: function (formobj, rules, messages) {

        messages = Object.assign({
            required: 'This field is required.',
            numeric: 'This field needs to be a number.',
            email: 'Not a valid email address.',
            min: 'Lower than minimun value.',
            max: 'Exceeds maximun value.'
        }, messages);

        formobj.addEventListener('submit', function (e) {
            e.preventDefault();

            let invalid = [];

            for (var key in rules) {
                if (rules.hasOwnProperty(key)) {
                    let formElement = dom.selectById(key);
                    if (formElement){

                        if (typeof rules[key].required != 'undefined' && rules[key].required === true)
                            if (formElement.value.length === 0)
                                invalid.push({ element: formElement, rule: 'required', msg: messages.required });

                        if (typeof rules[key].numeric != 'undefined' && rules[key].numeric === true && formElement.value.length > 0){
                            if (isNaN(parseInt(formElement.value)))
                                invalid.push({ element: formElement, rule: 'numeric', msg: messages.numeric });

                            if (typeof rules[key].min != 'undefined' && !isNaN(rules[key].min))
                                if (parseInt(formElement.value) < rules[key].min)
                                    invalid.push({ element: formElement, rule: 'min', msg: messages.min });

                            if (typeof rules[key].max != 'undefined' && !isNaN(rules[key].max))
                                if (parseInt(formElement.value) > rules[key].max)
                                    invalid.push({ element: formElement, rule: 'max', msg: messages.max });
                        }

                        //jscs:disable maximumLineLength
                        let isEmailReg = /^(([^<>()[]\.,;:s@"]+(.[^<>()[]\.,;:s@"]+)*)|(".+"))@(([[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}])|(([a-zA-Z-0-9]+.)+[a-zA-Z]{2,}))$/;
                        //jscs:enable maximumLineLength
                        if (typeof rules[key].email != 'undefined' && rules[key].email === true && formElement.value.length > 0)
                            if (!isEmailReg.test(formElement.value))
                                invalid.push({ element: formElement, rule: 'email', msg: messages.email });

                    }
                }
            }
            return forms.formValidationErrors(formobj, invalid);
        });

    },

    formValidationErrors: function (formobj, invalidFields) {

        var errorLabels = dom.selectByClass('error-message');
        errorLabels.forEach(function (el) { dom.remove(el) });

        invalidFields.forEach(function (invalid) {

            let parent = invalid.element.parentNode;
            let error = document.createElement('span');
            error.classList.add('error-message');
            error.innerHTML = invalid.msg;
            parent.appendChild(error);

        });
    },

    // validate: function (formobj, rules) {
    //     let fields = forms.serialize(formobj);
    //
    //     return validation.validate(fields, rules);
    // },

    deserialize: function (formobj, data) {
        let selection = formobj.querySelectorAll('*[name]');

        for (let selected = 0, length = selection.length; selected < length; selected++) {
            forms.setFormFieldValue(selection[selected], data[selection[selected].getAttribute('name')]);
        }
    }
};

export default forms;
