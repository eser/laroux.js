/*jslint node: true */
'use strict';

import PromiseObject from './laroux.promiseObject.js';

let require_ = function (...args) {
    let name, requirements, callback;

    if (args.length >= 3) {
        name = args[0];
        requirements = args[1];
        callback = args[2];
    } else if (args.length === 2) {
        if (args[0].constructor === Array) {
            name = null;
            requirements = args[0];
            callback = args[1];
        } else {
            name = args[0];
            requirements = [];
            callback = args[1];
        }
    } else {
        name = null;
        requirements = [];
        callback = args[0];
    }

    let dependencies = [];
    for (let i = 0, length = requirements.length; i < length; i++) {
        let requirement = requirements[i];

        if (!(requirement in require_.modules)) {
            throw new Error('dependency not loaded: ' + requirement + '.');
        }

        dependencies.push(require_.modules[requirement]);
    }

    if (callback.constructor === PromiseObject) {
        dependencies.push(callback);
    }

    let result = PromiseObject.all(dependencies);

    if (callback.constructor !== PromiseObject) {
        result = result.then(function (dependencies) {
            return callback.apply(global, dependencies);
        });
    }

    if (name !== null) {
        require_.modules[name] = result;
    }

    return result;
};

require_.modules = {};

export default require_;
