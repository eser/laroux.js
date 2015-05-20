import laroux from '../laroux.js';

import helpers from '../laroux.helpers.js';

import anim from './laroux.anim.js';
import css from './laroux.css.js';
import dom from './laroux.dom.js';
import forms from './laroux.forms.js';
import keys from './laroux.keys.js';
import mvc from './laroux.mvc.js';
import touch from './laroux.touch.js';

export default (function () {
    'use strict';

    helpers.extend(laroux, {
        anim,
        css,
        dom,
        forms,
        keys,
        mvc,
        touch
    });

    if (typeof document !== 'undefined') {
        document.addEventListener(
            'DOMContentLoaded',
            laroux.setReady
        );
    }

    return laroux;

})();
