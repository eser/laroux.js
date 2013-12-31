(function(laroux) {
    "use strict";

    // cookies
    laroux.cookies = {
        get: function(name) {
            re = new RegExp(name + '=[^;]+', 'i');
            if (!document.cookie.match(re)) {
                return null;
            }

            return document.cookie.match(re)[0].split('=')[1];
        },

        set: function(name, value) {
            document.cookie = name + '=' + value + '; path=' + laroux.baseLocation;
        }
    };

})(this.laroux);
