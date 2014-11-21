(function(laroux) {
    'use strict';

    // date
    laroux.date = {
        parseEpoch: function(timespan, limitWithWeeks) {
            if (timespan <= 3000) {
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

            if (typeof limitWithWeeks != 'undefined' && limitWithWeeks === true) {
                return null;
            }

            if (timespan < 30*7*24*60*60*1000) {
                timespan = Math.ceil(timespan / (30*24*60*60*1000));

                if (timespan == 1) {
                    return 'a month';
                }

                return timespan + ' months';
            }

            timespan = Math.ceil(timespan / (365*24*60*60*1000));

            if (timespan == 1) {
                return 'a year';
            }

            return timespan + ' years';
        },

        monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        getDateString: function(date, monthNames) {
            var now = Date.now();

            var leadingDate = ('0' + date.getDate()).substr(-2, 2);
            var leadingMonth = ('0' + (date.getMonth() + 1)).substr(-2, 2);
            var monthName = laroux.date.monthsShort[date.getMonth()];
            var fullYear = date.getFullYear();

            // timespan
            var timespan = now - date.getTime();
            var future;
            if (timespan < 0) {
                future = true;
                timespan = Math.abs(timespan);
            } else {
                future = false;
            }

            var timespanstring = laroux.date.parseEpoch(timespan, true);
            if (timespanstring !== null) {
                if (future) {
                    return timespanstring + ' later';
                }

                return timespanstring;
            }

            if (typeof monthNames != 'undefined' && monthNames) {
                return leadingDate + ' ' + monthName + ' ' + fullYear;
            }

            return leadingDate + '.' + leadingMonth + '.' + fullYear;
        },

        getLongDateString: function(date, monthNames, includeTime) {
            var leadingDate = ('0' + date.getDate()).substr(-2, 2);
            var leadingMonth = ('0' + (date.getMonth() + 1)).substr(-2, 2);
            var monthName = laroux.date.monthsShort[date.getMonth()];
            var fullYear = date.getFullYear();

            var result;

            if (typeof monthNames != 'undefined' && monthNames) {
                result = leadingDate + ' ' + monthName + ' ' + fullYear;
            } else {
                result = leadingDate + '.' + leadingMonth + '.' + fullYear;
            }

            if (typeof includeTime != 'undefined' && includeTime) {
                var leadingHour = ('0' + date.getHours()).substr(-2, 2);
                var leadingMinute = ('0' + date.getMinutes()).substr(-2, 2);

                result += ' ' + leadingHour + ':' + leadingMinute;
            }

            return result;
        }
    };

})(this.laroux);
