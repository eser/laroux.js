function doBenchmark(target, tests) {
    var suite = new Benchmark.Suite;
    var text = $l('#content');
    var crlf = '<br />';

    $l.dom.clear(target);
    $l.dom.append(target, 'Awaiting test results...' + crlf);

    // add tests
    for (var item in tests) {
        var test = tests[item];
        suite.add(test.name, test.fnc);
    }

    // add listeners
    suite
        .on('cycle', function(event) {
            $l.dom.append(target, String(event.target) + crlf);
        })
        .on('complete', function() {
            $l.dom.append(target, 'Fastest is <strong>' + this.filter('fastest').pluck('name') + '</strong>' + crlf);
        });

    // run async
    suite.run({ 'async': true });
}

// Selectors by Tagname
$l.ready(function() {
    var button = $l('#button-selectors-tagname');
    var text = $l('#text-selectors-tagname');

    $l.dom.setEvent(
        button,
        'click',
        function() {
            doBenchmark(
                text,
                [
                    {
                        name: 'laroux.js',
                        fnc: function() {
                            $l('body');
                        }
                    },
                    {
                        name: 'jQuery',
                        fnc: function() {
                            $('body');
                        }
                    },
                ]
            );

            return false;
        }
    );
});

// Selectors by Element Id
$l.ready(function() {
    var button = $l('#button-selectors-elementid');
    var text = $l('#text-selectors-elementid');

    $l.dom.setEvent(
        button,
        'click',
        function() {
            doBenchmark(
                text,
                [
                    {
                        name: 'laroux.js',
                        fnc: function() {
                            $l('#home');
                        }
                    },
                    {
                        name: 'jQuery',
                        fnc: function() {
                            $('#home');
                        }
                    },
                ]
            );

            return false;
        }
    );
});

// Selectors by Class
$l.ready(function() {
    var button = $l('#button-selectors-class');
    var text = $l('#text-selectors-class');

    $l.dom.setEvent(
        button,
        'click',
        function() {
            doBenchmark(
                text,
                [
                    {
                        name: 'laroux.js',
                        fnc: function() {
                            $l('.container');
                        }
                    },
                    {
                        name: 'jQuery',
                        fnc: function() {
                            $('.container');
                        }
                    },
                ]
            );

            return false;
        }
    );
});
