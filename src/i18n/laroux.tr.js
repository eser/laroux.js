(function (laroux) {
    'use strict';

    // date
    laroux.extend({
        date: {
            shortDateFormat: 'dd.MM.yyyy',
            longDateFormat: 'dd MMMM yyyy',
            timeFormat: 'HH:mm',

            monthsShort: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
            monthsLong: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],

            strings: {
                now:     'şimdi',
                later:   'sonra',
                ago:     'önce',
                seconds: 'saniye',
                aminute: '1 dakika',
                minutes: 'dakika',
                ahour:   '1 saat',
                hours:   'saat',
                aday:    '1 gün',
                days:    'gün',
                aweek:   '1 hafta',
                weeks:   'hafta',
                amonth:  '1 ay',
                months:  'ay',
                ayear:   '1 sene',
                years:   'sene'
            }
        }
    });

}(this.laroux));
