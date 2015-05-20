import dom from './laroux.dom.js';
import forms from './laroux.forms.js';

export default (function () {
    'use strict';

    var keys = {
        keyName: function (keycode) {
            keycode = keycode.toLowerCase();

            switch (keycode) {
            case 'backspace':
                return 8;

            case 'tab':
                return 9;

            case 'enter':
            case 'return':
                return 13;

            case 'esc':
            case 'escape':
                return 27;

            case 'space':
                return 32;

            case 'pgup':
                return 33;

            case 'pgdn':
                return 34;

            case 'end':
                return 35;

            case 'home':
                return 36;

            case 'left':
                return 37;

            case 'up':
                return 38;

            case 'right':
                return 39;

            case 'down':
                return 40;

            case 'insert':
                return 45;

            case 'delete':
                return 46;

            case 'f1':
                return 112;

            case 'f2':
                return 113;

            case 'f3':
                return 114;

            case 'f4':
                return 115;

            case 'f5':
                return 116;

            case 'f6':
                return 117;

            case 'f7':
                return 118;

            case 'f8':
                return 119;

            case 'f9':
                return 120;

            case 'f10':
                return 121;

            case 'f11':
                return 122;

            case 'f12':
                return 123;

            case ',':
                return 188;

            case '.':
                return 190;
            }

            return String.fromCharCode(keycode);
        },

        // {target, key, shift, ctrl, alt, disableInputs, fnc}
        assign: function (options) {
            var wrapper = function (ev) {
                if (!ev) {
                    ev = event;
                }

                var element = ev.target || ev.srcElement;
                if (element.nodeType === 3 || element.nodeType === 11) { // element.nodeType === 1 ||
                    element = element.parentNode;
                }

                if (options.disableInputs && forms.isFormField(element)) {
                    return;
                }

                if (options.shift && !ev.shiftKey) {
                    return;
                }

                if (options.ctrl && !ev.ctrlKey) {
                    return;
                }

                if (options.alt && !ev.altKey) {
                    return;
                }

                var key = keys.keyName(options.key);
                if (key !== (ev.keyCode || ev.which)) {
                    return;
                }

                options.fnc(ev);

                return false;
            };

            dom.setEvent(options.target || document, 'keydown', wrapper);
        }
    };

    return keys;

})();
