$l.dom.setEvent(
    $l(['input[type=text], input[type=password], textarea']),
    'focus',
    function(event, element) {
        element.value = '';
    }
);