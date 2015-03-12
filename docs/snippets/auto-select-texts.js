$l.dom.setEvent(
    $l(['input[type=text], input[type=password], textarea']),
    'click',
    function(event, element) {
        element.select();
    }
);