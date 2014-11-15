(function(laroux) {
    "use strict";

    // cookies
    laroux.cookies = {
        get: function(name, defaultValue) {
            if (typeof defaultValue == 'undefined') {
                defaultValue = null;
            }

            var re = new RegExp(name + '=[^;]+', 'i');
            if (!document.cookie.match(re)) {
                return defaultValue;
            }

            return document.cookie.match(re)[0].split('=')[1];
        },

        set: function(name, value, expires) {
            var expireValue = '';
            if (typeof expires != 'undefined' || expires !== null) {
                expireValue = '; expires=' + expires.toGMTString();
            }

            var pathValue = laroux.baseLocation;
            if (pathValue.length === 0) {
                pathValue = '/';
            }

            document.cookie = name + '=' + value + expireValue + '; path=' + pathValue;
        }
    };

})(this.laroux);
