(function(laroux) {
    'use strict';

    // stack
    laroux.stack = function() {
        this.data = {};

        this.add = function(key, value) {
            this.data[key] = value;
        };

        this.addRange = function(values) {
            for (var valueKey in values) {
                if (!values.hasOwnProperty(valueKey)) {
                    continue;
                }

                this.data[valueKey] = values[valueKey];
            }
        };

        this.get = function(key, defaultValue) {
            return this.data[key] || defaultValue || null;
        };

        this.getRange = function(keys) {
            var values = {};

            for (var key in keys) {
                if (!keys.hasOwnProperty(key)) {
                    continue;
                }

                values[keys[key]] = this.data[keys[key]];
            }

            return values;
        };

        this.keys = function() {
            return Object.keys(this.data);
        };

        this.length = function() {
            return Object.keys(this.data).length;
        };

        this.exists = function(key) {
            return (typeof this.data[key] != 'undefined');
        };

        this.remove = function(key) {
            delete this.data[key];
        };

        this.clear = function() {
            this.data = {};
        };
    };

})(this.laroux);
