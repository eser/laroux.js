(function(laroux) {
    'use strict';

    // stack
    laroux.stack = function(data) {
        this.data = {};

        this.add = function(key, value) {
            switch (typeof value) {
                case 'function':
                    this[key] = value;
                    break;

                // case 'object':
                //     break;

                default:
                    this.data[key] = value;

                    Object.defineProperty(
                        this,
                        key,
                        {
                            get: function() { return this.data[key]; },
                            set: function(newValue) { this.data[key] = newValue; this.onupdate(); }
                        }
                    );
                    break;
            }
        };

        this.addRange = function(values) {
            for (var valueKey in values) {
                if (!values.hasOwnProperty(valueKey)) {
                    continue;
                }

                this.add(valueKey, values[valueKey]);
            }
        };

        this.get = function(key, defaultValue) {
            return this.data[key] || defaultValue || null;
        };

        this.getRange = function(keys) {
            var values = {};

            for (var item in keys) {
                if (!keys.hasOwnProperty(item)) {
                    continue;
                }

                values[keys[item]] = this.data[keys[item]];
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
            return (key in this.data);
        };

        this.remove = function(key) {
            if (key in this.data) {
                delete this[key];
            }

            delete this.data[key];
        };

        this.clear = function() {
            for (var item in this.data) {
                if (!this.data.hasOwnProperty(item)) {
                    continue;
                }

                delete this[item];
            }

            this.data = {};
        };

        this.onupdate = function() {
        };

        if (data) {
            this.addRange(data);
        }
    };

})(this.laroux);
