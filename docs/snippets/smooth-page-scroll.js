$l.web.dom.setEvent(
    $l(['.scroll-link']),
    'click',
    function(ev, element) {
        var targetElement = $l(element.getAttribute('href'));
        var targetPosition = $l.web.css.top(targetElement);

        $l.web.anim.set({
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