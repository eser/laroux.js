import ajax from './laroux.ajax.js';
import Deferred from './laroux.deferred.js';
import When from './laroux.when.js';

export default (function () {
    'use strict';

    let require_ = function (...args) {
        let name, requirements, source;

        if (args.length >= 3) {
            name = args[0];
            requirements = args[1];
            source = args[2];
        } else if (args.length === 2) {
            if (args[0] instanceof Array) {
                name = null;
                requirements = args[0];
                source = args[1];
            } else {
                name = args[0];
                requirements = [];
                source = args[1];
            }
        } else {
            name = null;
            requirements = [];
            source = args[0];
        }

        let resolved = [];
        for (let i = 0, length = requirements.length; i < length; i++) {
            if (!(requirements[i] in require_.modules)) {
                throw 'dependency not loaded: ' + requirements[i] + '.';
            }

            resolved.push(require_.modules[requirements[i]]);
        }

        let when = new When(...resolved),
            promise = new Deferred();

        if (source instanceof Function) {
            when.then(function (...args) {
                promise.resolve(source.apply(global, args));
            });
        } else {
            let request = ajax.makeRequest({
                type: 'GET',
                url: source
                // datatype: 'plain'
            });

            when.then(function () {
                request.done(function (script) {
                    /*jshint evil:true */
                    /*jslint evil:true */
                    promise.resolve(eval(script));
                });
            });
        }

        if (name !== null) {
            require_.modules[name] = promise;
        }

        return when;
    };

    require_.modules = {};

    return require_;

})();
