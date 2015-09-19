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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _larouxPromiseObjectJs = require('./laroux.promiseObject.js');

var _larouxPromiseObjectJs2 = _interopRequireDefault(_larouxPromiseObjectJs);

var Storyboard = (function () {
    function Storyboard() {
        _classCallCheck(this, Storyboard);

        var self = this;

        this.phases = [];
        this.phaseKeys = {};
        this.currentIteration = 0;
        this.running = false;

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        for (var i = 0, _length = args.length; i < _length; i++) {
            this.addPhase(args[i]);
        }

        this.checkPromise = function () {
            if (--self.phases[self.currentIteration].promises === 0 && !self.running) {
                self.start();
            }
        };
    }

    _createClass(Storyboard, [{
        key: 'addPhase',
        value: function addPhase(key) {
            this.phaseKeys[key] = this.phases.length;
            this.phases.push({
                key: key,
                callbacks: [],
                promises: 0
            });
        }
    }, {
        key: 'add',
        value: function add(phase, callback) {
            if (callback.constructor === _larouxPromiseObjectJs2['default']) {
                return this.addPromise(phase, callback);
            }

            var phaseId = this.phaseKeys[phase];

            if (phaseId < this.currentIteration) {
                // execute immediately if phase is already passed
                callback.apply(global);
                return;
            }

            this.phases[phaseId].callbacks.push(callback);
        }
    }, {
        key: 'addPromise',
        value: function addPromise(phase, promise) {
            var phaseId = this.phaseKeys[phase];

            // skips if phase is already passed
            if (phaseId < this.currentIteration) {
                return;
            }

            this.phases[phaseId].promises++;
            // FIXME: must be handled even if it has failed
            promise.then(this.checkPromise);
        }
    }, {
        key: 'start',
        value: function start() {
            this.running = true;

            while (this.phases.length > this.currentIteration) {
                var currentPhase = this.phases[this.currentIteration];

                while (currentPhase.callbacks.length > 0) {
                    var fnc = currentPhase.callbacks.shift();
                    fnc.apply(global);
                }

                if (currentPhase.promises > 0) {
                    break;
                }

                this.currentIteration++;
            }

            this.running = false;
        }
    }]);

    return Storyboard;
})();

exports['default'] = Storyboard;
module.exports = exports['default'];