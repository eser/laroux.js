$l.ready(function() {
    prettyPrint();
});

// ajax - Making a GET request
$l.ready(function() {
    var button = $l('#button-ajax-get-request');
    var text = $l('#text-ajax-get-request');

    $l.dom.setEvent(
        button,
        'click',
        function() {
            $l.ajax.getJson(
                'test.json',
                null,
                function(response) {
                    $l.dom.replace(text, response.testResponse);
                }
            );

            return false;
        }
    )
});
