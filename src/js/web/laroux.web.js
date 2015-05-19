import laroux from '../laroux.js';

import events from '../laroux.events.js';
import helpers from '../laroux.helpers.js';
import timers from '../laroux.timers.js';

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
            function () {
                if (!laroux.readyPassed) {
                    events.invoke('ContentLoaded');
                    setInterval(timers.ontick, 100);
                    laroux.readyPassed = true;
                }
            }
        );
    }

    return laroux;

})();
