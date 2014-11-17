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

// css - Transitions
$l.ready(function() {
    var button = $l('#button-css-transition');
    var box = $l('#div-css-transition');

    $l.css.setTransition(
        box,
        {
            'background-color': '2s',
            'width': '1s ease'
        }
    );

    $l.dom.setEvent(
        button,
        'click',
        function() {
            $l.css.toggleClass(
                box,
                'box-silver'
            );

            return false;
        }
    );
});

// date - Dates
$l.ready(function() {
    var button = $l('#button-date-dates');
    var text = $l('#text-date-dates');

    $l.dom.setEvent(
        button,
        'click',
        function() {
            var now = new Date();
            var yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            $l.dom.clear(text);

            $l.dom.append(text, '<div><strong>From yesterday to today:</strong></div>');
            $l.dom.append(text, $l.date.parseEpoch(now.getTime() - yesterday.getTime()));

            $l.dom.append(text, '<div><strong>Short Date:</strong></div>');
            $l.dom.append(text, $l.date.getDateString(now) + '<br />');

            $l.dom.append(text, '<div><strong>Short Date + month names:</strong></div>');
            $l.dom.append(text, $l.date.getDateString(now, true) + '<br />');

            $l.dom.append(text, '<div><strong>Long Date:</strong></div>');
            $l.dom.append(text, $l.date.getLongDateString(now) + '<br />');

            $l.dom.append(text, '<div><strong>Long Date + month names:</strong></div>');
            $l.dom.append(text, $l.date.getLongDateString(now, true) + '<br />');

            $l.dom.append(text, '<div><strong>Long Date + month names + time:</strong></div>');
            $l.dom.append(text, $l.date.getLongDateString(now, true, true) + '<br />');

            return false;
        }
    );
});

// dom - Clone
$l.ready(function() {
    var button = $l('#button-dom-clone');
    var target = $l('#target-dom-clone');

    $l.dom.setEvent(
        button,
        'click',
        function() {
            $l.dom.clone(target.firstElementChild, $l.dom.cloneAppend);

            return false;
        }
    );
});
