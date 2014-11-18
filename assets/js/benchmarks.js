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
                    {
                        name: 'Zepto',
                        fnc: function() {
                            Zepto('body');
                        }
                    }
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
                    {
                        name: 'Zepto',
                        fnc: function() {
                            Zepto('#home');
                        }
                    }
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
                    {
                        name: 'Zepto',
                        fnc: function() {
                            Zepto('.container');
                        }
                    }
                ]
            );

            return false;
        }
    );
});

// Each on Arrays
$l.ready(function() {
    var button = $l('#button-main-each-arrays');
    var text = $l('#text-main-each-arrays');

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
                            $l.each([52, 97], function(index, value) {
                                console.log(index + ': ' + value);
                            });
                        }
                    },
                    {
                        name: 'jQuery',
                        fnc: function() {
                            $.each([52, 97], function(index, value) {
                                console.log(index + ': ' + value);
                            });
                        }
                    },
                    {
                        name: 'Zepto',
                        fnc: function() {
                            $.each([52, 97], function(index, value) {
                                console.log(index + ': ' + value);
                            });
                        }
                    }
                ]
            );

            return false;
        }
    );
});

// Each on Objects
$l.ready(function() {
    var button = $l('#button-main-each-objects');
    var text = $l('#text-main-each-objects');

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
                            $l.each({a: 1, b: 2}, function(index, value) {
                                console.log(index + ': ' + value);
                            });
                        }
                    },
                    {
                        name: 'jQuery',
                        fnc: function() {
                            $.each({a: 1, b: 2}, function(index, value) {
                                console.log(index + ': ' + value);
                            });
                        }
                    },
                    {
                        name: 'Zepto',
                        fnc: function() {
                            $.each({a: 1, b: 2}, function(index, value) {
                                console.log(index + ': ' + value);
                            });
                        }
                    }
                ]
            );

            return false;
        }
    );
});

// Map on Arrays
$l.ready(function() {
    var button = $l('#button-main-map-arrays');
    var text = $l('#text-main-map-arrays');

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
                            $l.map(['eser', 'ozvataf'], function(value) {
                                return value.toUpperCase();
                            });
                        }
                    },
                    {
                        name: 'jQuery',
                        fnc: function() {
                            $.map(['eser', 'ozvataf'], function(value) {
                                return value.toUpperCase();
                            });
                        }
                    },
                    {
                        name: 'Zepto',
                        fnc: function() {
                            $.map(['eser', 'ozvataf'], function(value) {
                                return value.toUpperCase();
                            });
                        }
                    }
                ]
            );

            return false;
        }
    );
});

// Map on Objects
$l.ready(function() {
    var button = $l('#button-main-map-objects');
    var text = $l('#text-main-map-objects');

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
                            $l.map({a: 'eser', b: 'ozvataf'}, function(value) {
                                return value.toUpperCase();
                            });
                        }
                    },
                    {
                        name: 'jQuery',
                        fnc: function() {
                            $.map({a: 'eser', b: 'ozvataf'}, function(value) {
                                return value.toUpperCase();
                            });
                        }
                    },
                    {
                        name: 'Zepto',
                        fnc: function() {
                            $.map({a: 'eser', b: 'ozvataf'}, function(value) {
                                return value.toUpperCase();
                            });
                        }
                    }
                ]
            );

            return false;
        }
    );
});
