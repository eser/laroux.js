/**
 * laroux.js - A jquery substitute for modern browsers (base bundle)
 *
 * @version v2.0.0
 * @link https://larukedi.github.io/laroux.js
 * @license Apache-2.0
 */
/*jslint node: true */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _larouxDeferredJs = require('./laroux.deferred.js');

var _larouxDeferredJs2 = _interopRequireDefault(_larouxDeferredJs);

var _larouxHelpersJs = require('./laroux.helpers.js');

var _larouxHelpersJs2 = _interopRequireDefault(_larouxHelpersJs);

var When = (function () {
    function When() {
        _classCallCheck(this, When);

        var self = this;

        this.queues = [];
        this.remaining = -1;

        this.deferredCompleted = function () {
            self.remaining--;
            self.check();
        };

        if (arguments.length > 0) {
            this.then.apply(this, arguments);
        }
    }

    _createClass(When, [{
        key: 'then',
        value: function then() {
            var args = _larouxHelpersJs2['default'].toArray(arguments);
            this.queues.push(args);

            this.check();

            return this;
        }
    }, {
        key: 'check',
        value: function check() {
            while (this.remaining <= 0) {
                if (this.remaining !== -1) {
                    this.queues.shift();
                }

                if (this.queues.length === 0) {
                    this.remaining = -1;
                    return;
                }

                var queue = this.queues[0];
                console.log('queue: ', queue);

                this.remaining = 0;
                for (var i = 0, _length = queue.length; i < _length; i++) {
                    if (queue[i] instanceof _larouxDeferredJs2['default']) {
                        // and still pending
                        this.remaining++;
                        queue[i].on('completed', this.deferredCompleted);
                    }
                }
            }
        }
    }]);

    return When;
})();

exports['default'] = When;
module.exports = exports['default'];