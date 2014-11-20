$l.dom.setEvent(
    $l(['.scroll-link']),
    'click',
    function(ev, element) {
        var targetElement = $l(element.getAttribute('href'));

        var targetPosition = targetElement.getBoundingClientRect().top +
            (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;

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