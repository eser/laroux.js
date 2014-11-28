(function(laroux) {
    'use strict';

    // date
    laroux.date = {
        shortDateFormat: 'dd.MMM.yyyy',
        longDateFormat: 'dd.MMMM.yyyy',
        timeFormat: 'HH:mm',

        monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        monthsLong: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],

        strings: {
            now:     'now',
            later:   'later',
            seconds: 'seconds',
            aminute: 'a minute',
            minutes: 'minutes',
            ahour:   'a hour',
            hours:   'hours',
            aday:    'a day',
            days:    'days',
            aweek:   'a week',
            weeks:   'weeks',
            amonth:  'a month',
            months:  'months',
            ayear:   'a year',
            years:   'years'
        },

        parseEpoch: function(timespan, limitWithWeeks) {
            if (timespan <= 3000) {
                return laroux.date.strings.now;
            }

            if (timespan < 60*1000) {
                timespan = Math.ceil(timespan / 1000);

                return timespan + ' ' + laroux.date.strings.seconds;
            }

            if (timespan < 60*60*1000) {
                timespan = Math.ceil(timespan / (60*1000));

                if (timespan == 1) {
                    return laroux.date.strings.aminute;
                }

                return timespan + ' ' + laroux.date.strings.minutes;
            }

            if (timespan < 24*60*60*1000) {
                timespan = Math.ceil(timespan / (60*60*1000));

                if (timespan == 1) {
                    return laroux.date.strings.ahour;
                }

                return timespan + ' ' + laroux.date.strings.hours;
            }

            if (timespan < 7*24*60*60*1000) {
                timespan = Math.ceil(timespan / (24*60*60*1000));

                if (timespan == 1) {
                    return laroux.date.strings.aday;
                }

                return timespan + ' ' + laroux.date.strings.days;
            }

            if (timespan < 4*7*24*60*60*1000) {
                timespan = Math.ceil(timespan / (7*24*60*60*1000));

                if (timespan == 1) {
                    return laroux.date.strings.aweek;
                }

                return timespan + ' ' + laroux.date.strings.weeks;
            }

            if (limitWithWeeks === true) {
                return null;
            }

            if (timespan < 30*7*24*60*60*1000) {
                timespan = Math.ceil(timespan / (30*24*60*60*1000));

                if (timespan == 1) {
                    return laroux.date.strings.amonth;
                }

                return timespan + ' ' + laroux.date.strings.months;
            }

            timespan = Math.ceil(timespan / (365*24*60*60*1000));

            if (timespan == 1) {
                return laroux.date.strings.ayear;
            }

            return timespan + ' ' + laroux.date.strings.years;
        },

        getCustomDateString: function(format, date) {
            var now = date || new Date(),
                day = now.getDate(),
                leadingDay = ('0' + day).substr(-2, 2),
                month = now.getMonth() + 1,
                leadingMonth = ('0' + month).substr(-2, 2),
                monthNameShort = laroux.date.monthsShort[now.getMonth()],
                monthNameLong = laroux.date.monthsLong[now.getMonth()];

            return format.replace('yyyy', now.getFullYear())
                            .replace('yy', now.getYear())
                            .replace('MMMM', monthNameLong)
                            .replace('MMM', monthNameShort)
                            .replace('MM', leadingMonth)
                            .replace('M', month)
                            .replace('dd', leadingDay)
                            .replace('d', day);
        },

        getCustomTimeString: function(format, date) {
            var now = date || new Date(),
                militaryHour = now.getHours(),
                leadingMilitaryHour = ('0' + militaryHour).substr(-2, 2),
                hour = ((militaryHour % 12) > 0) ? militaryHour % 12 : 12,
                leadingHour = ('0' + hour).substr(-2, 2),
                minute = now.getMinutes(),
                leadingMinute = ('0' + minute).substr(-2, 2),
                second = now.getSeconds(),
                leadingSecond = ('0' + second).substr(-2, 2),
                ampm = (hour >= 12) ? 'pm' : 'am';

            return format.replace('hh', leadingHour)
                            .replace('h', hour)
                            .replace('HH', leadingMilitaryHour)
                            .replace('H', militaryHour)
                            .replace('mm', leadingMinute)
                            .replace('m', minute)
                            .replace('ss', leadingSecond)
                            .replace('s', second)
                            .replace('tt', ampm)
                            .replace('t', ampm.substr(0, 1));
        },

        getDateString: function(date, includeTime) {
            var now = Date.now();

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
                    return timespanstring + ' ' + laroux.date.strings.later;
                }

                return timespanstring;
            }

            return laroux.date.getShortDateString(date, includeTime);
        },

        getShortDateString: function(date, includeTime) {
            if (includeTime) {
                return laroux.date.getCustomDateString(laroux.date.shortDateFormat, date) +
                    ' ' +
                    laroux.date.getCustomTimeString(laroux.date.timeFormat, date);
            }

            return laroux.date.getCustomDateString(laroux.date.shortDateFormat, date);
        },

        getLongDateString: function(date, includeTime) {
            if (includeTime) {
                return laroux.date.getCustomDateString(laroux.date.longDateFormat, date) +
                    ' ' +
                    laroux.date.getCustomTimeString(laroux.date.timeFormat, date);
            }

            return laroux.date.getCustomDateString(laroux.date.longDateFormat, date);
        }
    };

})(this.laroux);
