$l.dom.setEvent(
    $l(['.scroll-link']),
    'click',
    function(ev, element) {
        var targetElement = $l(element.getAttribute('href'));
        var targetPosition = $l.css.top(targetElement);

        $l.anim.set({
            object:   document.body,
            property: 'scrollTop',
            from:     null,
            to:       targetPosition,
            time:     800,
            unit:     '',
            reset:    false
        });

        return false;
    }
);