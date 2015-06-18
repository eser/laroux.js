import helpers from './laroux.helpers.js';

export default (function () {
    'use strict';

    let require_ = function (...args) {
        let name = (args.length >= 3) ? args.shift() : null,
            requirements = args.shift(),
            source = args.shift();

        let resolved = [];
        for (let i = 0, length = requirements.length; i < length; i++) {
            if (!(requirements[i] in require_.modules)) {
                throw 'dependency not loaded: ' + requirements[i] + '.';
            }

            resolved.push(require_.modules[requirements[i]]);
        }

        let result = null;
        if (source instanceof Function) {
            result = source.apply(global, resolved);
        } else {
            result = require_.loadSource(source, resolved);
        }

        if (name !== null) {
            require_.modules[name] = result;
        }

        return result;
    };

    require_.modules = {};
    require_.loadSource = function (url, requirements) {
        // load source from external url
    };

    return require_;

})();
