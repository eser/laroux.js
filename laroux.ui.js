(function(laroux) {
    // "use strict";

    // ui
    laroux.ui = {
        floatContainer: null,
        defaultPopupTimeout: 5,

        createFloatContainer: function() {
            if (!laroux.ui.floatContainer) {
                laroux.ui.floatContainer = laroux.dom.createElement('DIV', { id: 'laroux_floatdiv' }, '');
                document.body.insertBefore(laroux.ui.floatContainer, document.body.firstChild);
            }
        },

        createBox: function(id, xclass, message) {
            return laroux.dom.createElement('DIV', { 'id': id, 'class': xclass },
                message
            );
        },

        msgbox: function(timeout, message) {
            var id = laroux.helpers.getUniqueId();
            var obj = laroux.ui.createBox(id, 'laroux_msgbox', message);
            laroux.ui.floatContainer.appendChild(obj);

            laroux.css.setProperty(obj, 'opacity', '1');

            laroux.timers.set(timeout, function(x) {
                // laroux.css.setProperty(x, 'opacity', '0');
                laroux.dom.remove(x);
            }, obj);
        },

        parseEpoch: function(timespan) {
            if (timespan <= 3000) // minimum 2 seconds, otherwise not worth it
            {
                return 'now';
            }

            if (timespan < 60*1000) {
                timespan = Math.ceil(timespan / 1000);

                return timespan + ' seconds';
            }

            if (timespan < 60*60*1000) {
                timespan = Math.ceil(timespan / (60*1000));

                if (timespan == 1) {
                    return 'a minute';
                }

                return timespan + ' minutes';
            }

            if (timespan < 24*60*60*1000) {
                timespan = Math.ceil(timespan / (60*60*1000));

                if (timespan == 1) {
                    return 'an hour';
                }

                return timespan + ' hours';
            }

            if (timespan < 7*24*60*60*1000) {
                timespan = Math.ceil(timespan / (24*60*60*1000));

                if (timespan == 1) {
                    return 'a day';
                }

                return timespan + ' days';
            }

            if (timespan < 4*7*24*60*60*1000) {
                timespan = Math.ceil(timespan / (7*24*60*60*1000));

                if (timespan == 1) {
                    return 'a week';
                }

                return timespan + ' weeks';
            }

            return null;
        },

        getDateString: function(timestamp) {
            var date = new Date(timestamp);
            var now = new Date();

            var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            var leadingDate = ('0' + date.getDate()).substr(-2, 2);
            var monthName = months[date.getMonth()];
            var leadingYear = ('' + date.getFullYear()).substr(2, 2);

            // timespan
            var timespan = now.getTime() - date.getTime();
            var future;
            if (timespan < 0) {
                future = true;
                timespan = Math.abs(timespan);
            } else {
                future = false;
            }

            var timespanstring = laroux.ui.parseEpoch(timespan);
            if (timespanstring != null) {
                if (future) {
                    return timespanstring + ' later';
                }

                return timespanstring;
            }

            return leadingDate + ' ' + monthName + ' ' + leadingYear;
        },

        updateDates: function() {
            var elements = laroux.dom.select('*[data-epoch]');
            elements.forEach(function(obj) {
                laroux.dom.replace(
                    obj,
                    laroux.ui.getDateString(parseInt(obj.getAttribute('data-epoch')) * 1000)
                );
            });
        }
    };

    laroux.ready(laroux.ui.createFloatContainer);

    laroux.popupFunc = function(message) {
        laroux.ui.msgbox(laroux.ui.defaultPopupTimeout, message);
    };

})(window.laroux);
