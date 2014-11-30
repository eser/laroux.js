(function(laroux) {
    'use strict';

    // stack
    laroux.stack = function(data, depth, top) {
        this._data = {};
        this._depth = depth;
        this._top = top || this;

        this.add = function(key, value) {
            var type = typeof value;
            switch (type) {
                case 'function':
                    this[key] = value;
                    break;

                default:
                    if (type == 'object') {
                        this._data[key] = new laroux.stack(
                            value,
                            this._depth ?
                                this._depth + '.' + key :
                                key,
                            this._top
                        );
                    } else {
                        this._data[key] = value;
                    }

                    Object.defineProperty(
                        this,
                        key,
                        {
                            get: function() {
                                return this._data[key];
                            },
                            set: function(newValue) {
                                var oldValue = this._data[key];
                                if (this._data[key] === newValue) {
                                    return;
                                }

                                this._data[key] = newValue;
                                this._top.onupdate(this, key, oldValue, newValue);
                            }
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
            return this._data[key] || defaultValue || null;
        };

        this.getRange = function(keys) {
            var values = {};

            for (var item in keys) {
                if (!keys.hasOwnProperty(item)) {
                    continue;
                }

                values[keys[item]] = this._data[keys[item]];
            }

            return values;
        };

        this.keys = function() {
            return Object.keys(this._data);
        };

        this.length = function() {
            return Object.keys(this._data).length;
        };

        this.exists = function(key) {
            return (key in this._data);
        };

        this.remove = function(key) {
            if (key in this._data) {
                delete this[key];
            }

            delete this._data[key];
        };

        this.clear = function() {
            for (var item in this._data) {
                if (!this._data.hasOwnProperty(item)) {
                    continue;
                }

                delete this[item];
            }

            this._data = {};
        };

        this.onupdate = function(scope, key, oldValue, newValue) {
        };

        if (data) {
            this.addRange(data);
        }
    };

})(this.laroux);
