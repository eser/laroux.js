(function() {
    'use strict';

    $l.ready(function() {
        var dropdownToggleButton = $l.id('dropdown-toggle-button'),
            dropdownToggleElement = $l.id('dropdown-toggle-element');

        $l.dom.setEvent(
            dropdownToggleButton,
            'click',
            function(event, element) {
                $l.css.toggleClass(dropdownToggleElement, 'open');
                return false;
            }
        );

        var hrefButtons = $l(['.btn-href']);
        $l.dom.setEvent(
            hrefButtons,
            'click',
            function(event, element) {
                location.href = element.getAttribute('data-href');
                return false;
            }
        );
    });

})();
