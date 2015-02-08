module.exports = (function (scope) {
    'use strict';

    // core
    var laroux = function () {
    };

    if (!('$l' in scope)) {
        scope.$l = laroux;
    }

    // core modules
    laroux.events = require('./laroux.events.js');
    laroux.helpers = require('./laroux.helpers.js');
    laroux.timers = require('./laroux.timers.js');

    laroux.extend = function () {
        Array.prototype.unshift.call(arguments, laroux);
        laroux.helpers.extendObject.apply(this, arguments);
    };

    laroux.extendObject = laroux.helpers.extendObject;
    laroux.each = laroux.helpers.each;
    laroux.map = laroux.helpers.map;
    laroux.index = laroux.helpers.index;
    laroux.aeach = laroux.helpers.aeach;
    laroux.amap = laroux.helpers.amap;
    laroux.aindex = laroux.helpers.aindex;

    // optional modules
    laroux.wrapper = require('./laroux.wrapper.js');
    laroux.ajax = require('./laroux.ajax.js');
    // laroux.css = require('./laroux.css.js');
    // laroux.dom = require('./laroux.dom.js');
    // laroux.events = require('./laroux.events.js');
    // laroux.forms = require('./laroux.forms.js');
    // laroux.helpers = require('./laroux.helpers.js');
    // laroux.timers = require('./laroux.timers.js');
    laroux.triggers = require('./laroux.triggers.js');
    laroux.vars = require('./laroux.vars.js');

    // laroux.anim = require('./laroux.anim.js');
    laroux.date = require('./laroux.date.js');
    // laroux.keys = require('./laroux.keys.js');
    // laroux.mvc = require('./laroux.mvc.js');
    laroux.stack = require('./laroux.stack.js');
    laroux.templates = require('./laroux.templates.js');
    // laroux.touch = require('./laroux.touch.js');
    // laroux.ui = require('./laroux.ui.js');

    return laroux;

}(typeof window !== 'undefined' ? window : global));
