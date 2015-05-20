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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Async = (function () {
    function Async(fnc, completedCallback) {
        _classCallCheck(this, Async);

        this.fnc = fnc;
        this.completedCallbacks = [];
        this.isCompleted = false;
        this.result = undefined;

        if (completedCallback) {
            this.completedCallbacks.push(completedCallback);
        }
    }

    _createClass(Async, [{
        key: 'onCompleted',
        value: function onCompleted(completedCallback) {
            if (this.isCompleted) {
                completedCallback.call(undefined, this.result);
                return this;
            }

            this.completedCallbacks.push(completedCallback);
            return this;
        }
    }, {
        key: 'invoke',
        value: function invoke() {
            var self = this,
                args = arguments;

            setTimeout(function () {
                var result = {};

                try {
                    result.result = self.fnc.apply(undefined, args);
                    result.success = true;
                } catch (err) {
                    result.exception = err;
                    result.success = false;
                }

                self.result = result;
                self.isCompleted = true;

                while (self.completedCallbacks.length > 0) {
                    var fnc = self.completedCallbacks.shift();
                    fnc.call(undefined, self.result);
                }
            }, 0);

            return this;
        }
    }]);

    return Async;
})();

exports['default'] = Async;
module.exports = exports['default'];