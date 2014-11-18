function doBenchmark(button, target, tests) {
    var suite = new Benchmark.Suite;
    var text = $l('#content');
    var crlf = '<br />';

    button.setAttribute('disabled', 'disabled');

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
            button.removeAttribute('disabled');
        });

    // run async
    suite.run({ 'async': true });
}

function unitFormatter(val, axis) {
    if (val === 0) {
        return '';
    }

    if (val >= 1000000) {
        return (val / 1000000).toFixed(axis.tickDecimals) + 'M';
    }

    if (val >= 1000) {
        return (val / 1000).toFixed(axis.tickDecimals) + 'K';
    }

    return val.toFixed(axis.tickDecimals);
}

function drawGraph(target, data) {
    $.plot(
        target,
        [
            { data: data, label: 'ops/sec' } // , color: '#333333'
        ],
        {
            grid: {
                borderWidth: 0
            },
            series: {
                bars: {
                    show: true,
                    barWidth: 0.3,
                    align: 'center'
                }
            },
            xaxis: {
                mode: 'categories',
                tickLength: 0
            },
            yaxis: {
                show: true,
                ticks: 5,
                tickDecimals: 1,
                tickFormatter: unitFormatter
            }
        }
    );
}

// Selectors by Tagname
$l.ready(function() {
    var graph = $l('#graph-selectors-tagname');
    var graphdata = [
        ['laroux.js', 2196203],
        ['jQuery', 127885],
        ['Zepto', 123737]
    ];
    drawGraph(graph, graphdata);

    var button = $l('#button-selectors-tagname');
    var text = $l('#text-selectors-tagname');

    $l.dom.setEvent(
        button,
        'click',
        function() {
            doBenchmark(
                button,
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
    var graph = $l('#graph-selectors-elementid');
    var graphdata = [
        ['laroux.js', 3051122],
        ['jQuery', 383496],
        ['Zepto', 488508]
    ];
    drawGraph(graph, graphdata);

    var button = $l('#button-selectors-elementid');
    var text = $l('#text-selectors-elementid');

    $l.dom.setEvent(
        button,
        'click',
        function() {
            doBenchmark(
                button,
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
    var graph = $l('#graph-selectors-class');
    var graphdata = [
        ['laroux.js', 2099914],
        ['laroux.js (II)', 177507],
        ['jQuery', 86141],
        ['Zepto', 88549]
    ];
    drawGraph(graph, graphdata);

    var button = $l('#button-selectors-class');
    var text = $l('#text-selectors-class');

    $l.dom.setEvent(
        button,
        'click',
        function() {
            doBenchmark(
                button,
                text,
                [
                    {
                        name: 'laroux.js',
                        fnc: function() {
                            $l('.container');
                        }
                    },
                    {
                        name: 'laroux.js (II)',
                        fnc: function() {
                            $l.dom.selectByClass('container');
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
    var graph = $l('#graph-main-each-arrays');
    var graphdata = [
        ['laroux.js', 7474],
        ['jQuery', 7041],
        ['Zepto', 6976]
    ];
    drawGraph(graph, graphdata);

    var button = $l('#button-main-each-arrays');
    var text = $l('#text-main-each-arrays');

    $l.dom.setEvent(
        button,
        'click',
        function() {
            doBenchmark(
                button,
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
    var graph = $l('#graph-main-each-objects');
    var graphdata = [
        ['laroux.js', 7882],
        ['jQuery', 7111],
        ['Zepto', 7067]
    ];
    drawGraph(graph, graphdata);

    var button = $l('#button-main-each-objects');
    var text = $l('#text-main-each-objects');

    $l.dom.setEvent(
        button,
        'click',
        function() {
            doBenchmark(
                button,
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
    var graph = $l('#graph-main-map-arrays');
    var graphdata = [
        ['laroux.js', 305799],
        ['jQuery', 134039],
        ['Zepto', 153342]
    ];
    drawGraph(graph, graphdata);

    var button = $l('#button-main-map-arrays');
    var text = $l('#text-main-map-arrays');

    $l.dom.setEvent(
        button,
        'click',
        function() {
            doBenchmark(
                button,
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
    var graph = $l('#graph-main-map-objects');
    var graphdata = [
        ['laroux.js', 1937590],
        ['jQuery', 138664],
        ['Zepto', 138091]
    ];
    drawGraph(graph, graphdata);

    var button = $l('#button-main-map-objects');
    var text = $l('#text-main-map-objects');

    $l.dom.setEvent(
        button,
        'click',
        function() {
            doBenchmark(
                button,
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

// Create DOM element
$l.ready(function() {
    var graph = $l('#graph-dom-create-element');
    var graphdata = [
        ['laroux.js', 22216],
        ['laroux.js (II)', 17178],
        ['jQuery', 6275],
        ['Zepto', 6901]
    ];
    drawGraph(graph, graphdata);

    var button = $l('#button-dom-create-element');
    var text = $l('#text-dom-create-element');

    $l.dom.setEvent(
        button,
        'click',
        function() {
            doBenchmark(
                button,
                text,
                [
                    {
                        name: 'laroux.js',
                        fnc: function() {
                            $l.dom.createElement('DIV', { class: 'x' }, 'y');
                        }
                    },
                    {
                        name: 'laroux.js (II)',
                        fnc: function() {
                            $l.dom.create('<div class="x">y</div>');
                        }
                    },
                    {
                        name: 'jQuery',
                        fnc: function() {
                            $('<div class="x">y</div>');
                        }
                    },
                    {
                        name: 'Zepto',
                        fnc: function() {
                            $('<div class="x">y</div>');
                        }
                    }
                ]
            );

            return false;
        }
    );
});

// DOM Manipulations
$l.ready(function() {
    var graph = $l('#graph-dom-manipulations');
    var graphdata = [
        ['laroux.js', 14268],
        ['jQuery', 5856],
        ['Zepto', 6242]
    ];
    drawGraph(graph, graphdata);

    var button = $l('#button-dom-manipulations');
    var text = $l('#text-dom-manipulations');

    $l.dom.setEvent(
        button,
        'click',
        function() {
            doBenchmark(
                button,
                text,
                [
                    {
                        name: 'laroux.js',
                        fnc: function() {
                            var div = $l.dom.createElement('DIV');
                            $l.dom.append(div, 'appended');
                            $l.dom.prepend(div, 'prepended');
                            $l.dom.clear(div);
                            $l.dom.remove(div);
                        }
                    },
                    {
                        name: 'jQuery',
                        fnc: function() {
                            $('<div>')
                                .append('appended')
                                .prepend('prepended')
                                .empty()
                                .remove();
                        }
                    },
                    {
                        name: 'Zepto',
                        fnc: function() {
                            $('<div>')
                                .append('appended')
                                .prepend('prepended')
                                .empty()
                                .remove();
                        }
                    }
                ]
            );

            return false;
        }
    );
});
