$l.web.dom.setEvent(
    $l(['.confirm-action']),
    'click',
    function(event, element) {
        if (!confirm('Are you sure to do it?')) {
            return false; // cancel event
        }
    }
);