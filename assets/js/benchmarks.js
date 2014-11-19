(function() {
    'use strict';

    var chromeColor = 'rgba(237, 194, 64, 0.85)';
    var firefoxColor = 'rgba(255, 164, 34, 0.85)';

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

    function drawGraph(target, data) {
        var chartData = {
            legend: {
                cursor: 'pointer',
                itemclick : function(e) {
                    if (typeof e.dataSeries.visible == 'undefined' || e.dataSeries.visible) {
                        e.dataSeries.visible = false;
                    } else {
                        e.dataSeries.visible = true;
                    }
                    chart.render();
                }
            },
            axisX: {
                gridColor: 'rgba(220, 220, 220, 1)',
                gridThickness: 1
            },
            axisY: {
                gridColor: 'rgba(220, 220, 220, 1)',
                gridThickness: 1
            },
            data: []
        };

        for (var item in data) {
            var currentItem = data[item];

            var dataPoints = [];
            for (var pointItem in currentItem.values) {
                dataPoints.push({ y: currentItem.values[pointItem], label: pointItem });
            }

            chartData.data.push({
                type: 'bar',
                showInLegend: true,
                name: currentItem.name,
                color: currentItem.color,
                dataPoints: dataPoints
            });
        }

        var chart = new CanvasJS.Chart(target, chartData);
        chart.render();
    }

    // Selectors by Tagname
    $l.ready(function() {
        var graph = $l('#graph-selectors-tagname');
        var graphdata = [
            {
                name: 'Chrome',
                color: chromeColor,
                values: {
                    'laroux.js': 2196203,
                    'jQuery': 127885,
                    'Zepto': 123737
                }
            },
            {
                name: 'Firefox',
                color: firefoxColor,
                values: {
                    'laroux.js': 231524,
                    'jQuery': 59402,
                    'Zepto': 88427
                }
            }
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
            {
                name: 'Chrome',
                color: chromeColor,
                values: {
                    'laroux.js': 3190454,
                    'laroux.js (II)': 7489227,
                    'jQuery': 345253,
                    'Zepto': 465402
                }
            },
            {
                name: 'Firefox',
                color: firefoxColor,
                values: {
                    'laroux.js': 200722,
                    'laroux.js (II)': 421946,
                    'jQuery': 286514,
                    'Zepto': 74654
                }
            }
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
                            name: 'laroux.js (II)',
                            fnc: function() {
                                $l.dom.selectById('home');
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
            {
                name: 'Chrome',
                color: chromeColor,
                values: {
                    'laroux.js': 2099914,
                    'laroux.js (II)': 177507,
                    'jQuery': 86141,
                    'Zepto': 88549
                }
            },
            {
                name: 'Firefox',
                color: firefoxColor,
                values: {
                    'laroux.js': 203644,
                    'laroux.js (II)': 121056,
                    'jQuery': 44510,
                    'Zepto': 71562
                }
            }
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
            {
                name: 'Chrome',
                color: chromeColor,
                values: {
                    'laroux.js': 7474,
                    'jQuery': 7041,
                    'Zepto': 6976
                }
            },
            {
                name: 'Firefox',
                color: firefoxColor,
                values: {
                    'laroux.js': 21242,
                    'jQuery': 25108,
                    'Zepto': 24782
                }
            }
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
            {
                name: 'Chrome',
                color: chromeColor,
                values: {
                    'laroux.js': 7882,
                    'jQuery': 7111,
                    'Zepto': 7067
                }
            },
            {
                name: 'Firefox',
                color: firefoxColor,
                values: {
                    'laroux.js': 26740,
                    'jQuery': 24509,
                    'Zepto': 23855
                }
            }
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
            {
                name: 'Chrome',
                color: chromeColor,
                values: {
                    'laroux.js': 305799,
                    'jQuery': 134039,
                    'Zepto': 153342
                }
            },
            {
                name: 'Firefox',
                color: firefoxColor,
                values: {
                    'laroux.js': 145883,
                    'jQuery': 313516,
                    'Zepto': 309091
                }
            }
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
                                    return value;
                                });
                            }
                        },
                        {
                            name: 'jQuery',
                            fnc: function() {
                                $.map(['eser', 'ozvataf'], function(value) {
                                    return value;
                                });
                            }
                        },
                        {
                            name: 'Zepto',
                            fnc: function() {
                                $.map(['eser', 'ozvataf'], function(value) {
                                    return value;
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
            {
                name: 'Chrome',
                color: chromeColor,
                values: {
                    'laroux.js': 1937590,
                    'jQuery': 138664,
                    'Zepto': 138091
                }
            },
            {
                name: 'Firefox',
                color: firefoxColor,
                values: {
                    'laroux.js': 821219,
                    'jQuery': 290456,
                    'Zepto': 287355
                }
            }
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
                                    return value
                                });
                            }
                        },
                        {
                            name: 'jQuery',
                            fnc: function() {
                                $.map({a: 'eser', b: 'ozvataf'}, function(value) {
                                    return value;
                                });
                            }
                        },
                        {
                            name: 'Zepto',
                            fnc: function() {
                                $.map({a: 'eser', b: 'ozvataf'}, function(value) {
                                    return value;
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
            {
                name: 'Chrome',
                color: chromeColor,
                values: {
                    'laroux.js': 22216,
                    'laroux.js (II)': 17178,
                    'jQuery': 6275,
                    'Zepto': 6901
                }
            },
            {
                name: 'Firefox',
                color: firefoxColor,
                values: {
                    'laroux.js': 27208,
                    'laroux.js (II)': 19259,
                    'jQuery': 10401,
                    'Zepto': 10487
                }
            }
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
            {
                name: 'Chrome',
                color: chromeColor,
                values: {
                    'laroux.js': 14268,
                    'jQuery': 5856,
                    'Zepto': 6242
                }
            },
            {
                name: 'Firefox',
                color: firefoxColor,
                values: {
                    'laroux.js': 18946,
                    'jQuery': 5212,
                    'Zepto': 5078
                }
            }
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
})();
