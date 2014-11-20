(function(laroux) {
    "use strict";

    // requires $l

    // vars
    laroux.vars = {
        getCookie: function(name, defaultValue) {
            var re = new RegExp(encodeURIComponent(name) + '=[^;]+', 'i');
            var match = document.cookie.match(re);
            
            if (!match) {
                if (typeof defaultValue != 'undefined') {
                    return defaultValue;
                }

                return null;
            }

            return decodeURIComponent(match[0].split('=')[1]);
        },

        setCookie: function(name, value, expires) {
            var expireValue = '';
            if (typeof expires != 'undefined' || expires !== null) {
                expireValue = '; expires=' + expires.toGMTString();
            }

            var pathValue = laroux.baseLocation;
            if (pathValue.length === 0) {
                pathValue = '/';
            }

            document.cookie = encodeURIComponent(name) + '=' + encodeURIComponent(value) + expireValue + '; path=' + pathValue;
        },

        removeCookie: function(name) {
            var pathValue = laroux.baseLocation;
            if (pathValue.length === 0) {
                pathValue = '/';
            }

            document.cookie = encodeURIComponent(name) + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=' + pathValue;
        },

        getLocal: function(name, defaultValue) {
            if (typeof localStorage[name] == 'undefined') {
                if (typeof defaultValue != 'undefined') {
                    return defaultValue;
                }

                return null;
            }

            return JSON.parse(localStorage[name]);
        },

        setLocal: function(name, value) {
            localStorage[name] = JSON.stringify(value);
        },

        removeLocal: function(name) {
            delete localStorage[name];
        },

        getSession: function(name, defaultValue) {
            if (typeof sessionStorage[name] == 'undefined') {
                if (typeof defaultValue != 'undefined') {
                    return defaultValue;
                }

                return null;
            }

            return JSON.parse(sessionStorage[name]);
        },

        setSession: function(name, value) {
            sessionStorage[name] = JSON.stringify(value);
        },

        removeSession: function(name) {
            delete sessionStorage[name];
        }
    };

})(this.laroux);
