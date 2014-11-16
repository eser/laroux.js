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
    );
});

// anim - Creating a CSS animation
$l.ready(function() {
    var button = $l('#button-anim-animate');
    var box = $l('#div-anim-animate');

    $l.dom.setEvent(
        button,
        'click',
        function() {
            $l.anim.setCss({
                object:   box,
                property: 'top',
                from:     0, // current value
                to:       50,
                time:     1200,
                unit:     'px',
                reset:    false
            });

            return false;
        }
    );
});
