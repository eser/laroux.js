module.exports = (function () {
    'use strict';

    var tempPath = './build/temp/',
        resolveFnc = function (path) {
            if (path.substr(0, 2) === '~/') {
                path = tempPath + path.substr(2);
            } else if (path.substr(0, 3) === '!~/') {
                path = '!' + tempPath + path.substr(3);
            }

            return path;
        };

    resolveFnc.array = function (paths) {
        for (var item in paths) {
            paths[item] = resolveFnc(paths[item]);
        }

        return paths;
    };

    return resolveFnc;

}());
