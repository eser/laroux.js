(function() {
    'use strict';

    $l.ready(function() {
        var dropdownToggleButton = $l.web.id('dropdown-toggle-button'),
            dropdownToggleElement = $l.web.id('dropdown-toggle-element');

        $l.web.dom.setEvent(
            dropdownToggleButton,
            'click',
            function(event, element) {
                $l.web.css.toggleClass(dropdownToggleElement, 'open');
                return false;
            }
        );

        var hrefButtons = $l(['.btn-href']);
        $l.web.dom.setEvent(
            hrefButtons,
            'click',
            function(event, element) {
                location.href = element.getAttribute('data-href');
                return false;
            }
        );

        var slides = $l(['#slider .slide']);
        $l.timers.set({
            timeout: 8000,
            reset: true,
            ontick: function() {
                $l.web.css.cycleClass(slides, 'active');
            }
        });
    });

})();
