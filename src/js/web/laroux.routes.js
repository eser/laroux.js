import dom from './laroux.dom.js';
import forms from './laroux.forms.js';

export default (function () {
    'use strict';

    let routes = {
        maps: [],

        add: function (path, callback) {
            let keys = ['path'],
                regex = '^\#?\!?' + path
                    .replace(/[\/\=\?\$\^]/g, '\\$&')
                    .replace(/\*/g, '.*')
                    .replace(
                        /\{(\w+)\}/g,
                        function (match, key) {
                            keys.push(key);
                            return '([\\w\\-]+)';
                        }
                    ) + '$';

            routes.maps.push({
                regex: new Regex(regex),
                keys: keys,
                callback: callback
            });
        },

        go: function (path, callback) {
            for (let i = 0, length = routes.maps.length; i < length; i++) {
                routes.execute(path, routes.maps[i]);
            }

        }
    };

    return routes;

})();
