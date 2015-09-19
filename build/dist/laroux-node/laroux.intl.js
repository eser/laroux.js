/**
 * laroux.js - A jquery substitute for modern browsers (laroux-node bundle)
 *
 * @version v2.2.0
 * @link https://eserozvataf.github.io/laroux.js
 * @license Apache-2.0
 */
/*jslint node: true */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _larouxHelpersJs = require('./laroux.helpers.js');

var _larouxHelpersJs2 = _interopRequireDefault(_larouxHelpersJs);

var intl = {
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

            return timespan + ' ' + intl.strings.seconds;
        }

        if (timespan < 60 * 60 * 1000) {
            timespan = Math.ceil(timespan / (60 * 1000));

            if (timespan === 1) {
                return intl.strings.aminute;
            }

            return timespan + ' ' + intl.strings.minutes;
        }

        if (timespan < 24 * 60 * 60 * 1000) {
            timespan = Math.ceil(timespan / (60 * 60 * 1000));

            if (timespan === 1) {
                return intl.strings.ahour;
            }

            return timespan + ' ' + intl.strings.hours;
        }

        if (timespan < 7 * 24 * 60 * 60 * 1000) {
            timespan = Math.ceil(timespan / (24 * 60 * 60 * 1000));

            if (timespan === 1) {
                return intl.strings.aday;
            }

            return timespan + ' ' + intl.strings.days;
        }

        if (timespan < 4 * 7 * 24 * 60 * 60 * 1000) {
            timespan = Math.ceil(timespan / (7 * 24 * 60 * 60 * 1000));

            if (timespan === 1) {
                return intl.strings.aweek;
            }

            return timespan + ' ' + intl.strings.weeks;
        }

        if (limitWithWeeks === true) {
            return null;
        }

        if (timespan < 30 * 7 * 24 * 60 * 60 * 1000) {
            timespan = Math.ceil(timespan / (30 * 24 * 60 * 60 * 1000));

            if (timespan === 1) {
                return intl.strings.amonth;
            }

            return timespan + ' ' + intl.strings.months;
        }

        timespan = Math.ceil(timespan / (365 * 24 * 60 * 60 * 1000));

        if (timespan === 1) {
            return intl.strings.ayear;
        }

        return timespan + ' ' + intl.strings.years;
    },

    customDate: function customDate(format, timestamp) {
        var now = timestamp || new Date();

        return format.replace(/yyyy|yy|MMMM|MMM|MM|M|dd|d|hh|h|HH|H|mm|m|ss|s|tt|t/g, function (match) {
            switch (match) {
                case 'yyyy':
                    return now.getFullYear();

                case 'yy':
                    return now.getYear();

                case 'MMMM':
                    return intl.monthsLong[now.getMonth()];

                case 'MMM':
                    return intl.monthsShort[now.getMonth()];

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

    dateDiff: function dateDiff(timestamp) {
        var now = Date.now(),
            timespan = now - timestamp.getTime(),
            absTimespan = Math.abs(timespan),
            past = timespan > 0;

        if (absTimespan <= 3000) {
            return intl.strings.now;
        }

        var timespanstring = intl.parseEpoch(absTimespan, true);
        if (timespanstring !== null) {
            return timespanstring + ' ' + (past ? intl.strings.ago : intl.strings.later);
        }

        return intl.shortDate(timestamp, true);
    },

    shortDate: function shortDate(timestamp, includeTime) {
        return intl.customDate(includeTime ? intl.shortDateFormat + ' ' + intl.timeFormat : intl.shortDateFormat, timestamp);
    },

    longDate: function longDate(timestamp, includeTime) {
        return intl.customDate(includeTime ? intl.longDateFormat + ' ' + intl.timeFormat : intl.longDateFormat, timestamp);
    },

    format: function format(message, dictionary) {
        var temp = {};
        Object.keys(dictionary).forEach(function (x) {
            return temp['{' + x + '}'] = dictionary[x];
        });

        return _larouxHelpersJs2['default'].replaceAll(message, temp);
    },

    translations: {},

    addTranslations: function addTranslations(culture, dictionary) {
        _larouxHelpersJs2['default'].mergeNs(intl.translations, culture, dictionary);
    },

    translate: function translate(culture, message) {
        return intl.format(message, intl.translations[culture]);
    }
};

exports['default'] = intl;
module.exports = exports['default'];