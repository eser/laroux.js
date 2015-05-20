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

var Async = (function () {
    function Async(fnc) {
        _classCallCheck(this, Async);

        this.fnc = fnc;
        this.deferred = new _larouxDeferredJs2['default']();

        this.invoke();
    }

    _createClass(Async, [{
        key: 'invoke',
        value: function invoke() {
            var self = this,
                args = arguments;

            setTimeout(function () {
                try {
                    var result = self.fnc.apply(undefined, args);
                    self.deferred.invoke('done', result);
                } catch (err) {
                    self.deferred.invoke('fail', err);
                }
            }, 0);

            return this;
        }
    }]);

    return Async;
})();

exports['default'] = Async;
module.exports = exports['default'];