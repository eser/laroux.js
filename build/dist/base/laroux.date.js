/**
 * laroux.js - A jquery substitute for modern browsers (base bundle)
 *
 * @version v2.0.0
 * @link https://larukedi.github.io/laroux.js
 * @license Apache-2.0
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

exports['default'] = (function () {
    'use strict';

    var date = {
        shortDateFormat: 'dd.MM.yyyy',
        longDateFormat: 'dd MMMM yyyy',
        timeFormat: 'HH:mm',

        monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        monthsLong: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],

        strings: {
            now: 'now',
            later: 'later',
            ago: 'ago',
            seconds: 'seconds',
            aminute: 'a minute',
            minutes: 'minutes',
            ahour: 'a hour',
            hours: 'hours',
            aday: 'a day',
            days: 'days',
            aweek: 'a week',
            weeks: 'weeks',
            amonth: 'a month',
            months: 'months',
            ayear: 'a year',
            years: 'years'
        },

        parseEpoch: function parseEpoch(timespan, limitWithWeeks) {
            if (timespan < 60 * 1000) {
                timespan = Math.ceil(timespan / 1000);

                return timespan + ' ' + date.strings.seconds;
            }

            if (timespan < 60 * 60 * 1000) {
                timespan = Math.ceil(timespan / (60 * 1000));

                if (timespan === 1) {
                    return date.strings.aminute;
                }

                return timespan + ' ' + date.strings.minutes;
            }

            if (timespan < 24 * 60 * 60 * 1000) {
                timespan = Math.ceil(timespan / (60 * 60 * 1000));

                if (timespan === 1) {
                    return date.strings.ahour;
                }

                return timespan + ' ' + date.strings.hours;
            }

            if (timespan < 7 * 24 * 60 * 60 * 1000) {
                timespan = Math.ceil(timespan / (24 * 60 * 60 * 1000));

                if (timespan === 1) {
                    return date.strings.aday;
                }

                return timespan + ' ' + date.strings.days;
            }

            if (timespan < 4 * 7 * 24 * 60 * 60 * 1000) {
                timespan = Math.ceil(timespan / (7 * 24 * 60 * 60 * 1000));

                if (timespan === 1) {
                    return date.strings.aweek;
                }

                return timespan + ' ' + date.strings.weeks;
            }

            if (limitWithWeeks === true) {
                return null;
            }

            if (timespan < 30 * 7 * 24 * 60 * 60 * 1000) {
                timespan = Math.ceil(timespan / (30 * 24 * 60 * 60 * 1000));

                if (timespan === 1) {
                    return date.strings.amonth;
                }

                return timespan + ' ' + date.strings.months;
            }

            timespan = Math.ceil(timespan / (365 * 24 * 60 * 60 * 1000));

            if (timespan === 1) {
                return date.strings.ayear;
            }

            return timespan + ' ' + date.strings.years;
        },

        getCustomDateString: function getCustomDateString(format, date) {
            var now = date || new Date();

            return format.replace(/yyyy|yy|MMMM|MMM|MM|M|dd|d|hh|h|HH|H|mm|m|ss|s|tt|t/g, function (match) {
                switch (match) {
                    case 'yyyy':
                        return now.getFullYear();

                    case 'yy':
                        return now.getYear();

                    case 'MMMM':
                        return date.monthsLong[now.getMonth()];

                    case 'MMM':
                        return date.monthsShort[now.getMonth()];

                    case 'MM':
                        return ('0' + (now.getMonth() + 1)).substr(-2, 2);

                    case 'M':
                        return now.getMonth() + 1;

                    case 'dd':
                        return ('0' + now.getDate()).substr(-2, 2);

                    case 'd':
                        return now.getDate();

                    case 'hh':
                        var hour1 = now.getHours();
                        return ('0' + (hour1 % 12 > 0 ? hour1 % 12 : 12)).substr(-2, 2);

                    case 'h':
                        var hour2 = now.getHours();
                        return hour2 % 12 > 0 ? hour2 % 12 : 12;

                    case 'HH':
                        return ('0' + now.getHours()).substr(-2, 2);

                    case 'H':
                        return now.getHours();

                    case 'mm':
                        return ('0' + now.getMinutes()).substr(-2, 2);

                    case 'm':
                        return now.getMinutes();

                    case 'ss':
                        return ('0' + now.getSeconds()).substr(-2, 2);

                    case 's':
                        return now.getSeconds();

                    case 'tt':
                        if (now.getHours() >= 12) {
                            return 'pm';
                        }

                        return 'am';

                    case 't':
                        if (now.getHours() >= 12) {
                            return 'p';
                        }

                        return 'a';
                }

                return match;
            });
        },

        getDateDiffString: function getDateDiffString(date) {
            var now = Date.now(),
                timespan = now - date.getTime(),
                absTimespan = Math.abs(timespan),
                past = timespan > 0;

            if (absTimespan <= 3000) {
                return date.strings.now;
            }

            var timespanstring = date.parseEpoch(absTimespan, true);
            if (timespanstring !== null) {
                return timespanstring + ' ' + (past ? date.strings.ago : date.strings.later);
            }

            return date.getShortDateString(date, true);
        },

        getShortDateString: function getShortDateString(date, includeTime) {
            return date.getCustomDateString(includeTime ? date.shortDateFormat + ' ' + date.timeFormat : date.shortDateFormat, date);
        },

        getLongDateString: function getLongDateString(date, includeTime) {
            return date.getCustomDateString(includeTime ? date.longDateFormat + ' ' + date.timeFormat : date.longDateFormat, date);
        }
    };

    return date;
})();

module.exports = exports['default'];