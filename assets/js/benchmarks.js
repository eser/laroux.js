(function() {
    'use strict';

    var chromeColor = 'rgba(237, 194, 64, 0.85)';
    var firefoxColor = 'rgba(255, 164, 34, 0.85)';
    var ieColor = 'rgba(84, 164, 215, 0.85)';
    var safariColor = 'rgba(210, 210, 210, 0.85)';

    function doBenchmark(button, target, tests) {
        var suite = new Benchmark.Suite;
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
                dataPoints.unshift({ y: currentItem.values[pointItem], label: pointItem });
            }

            chartData.data.push({
                type: 'bar',
                showInLegend: true,
                name: currentItem.name,
                color: currentItem.color,
                visible: currentItem.show,
                dataPoints: dataPoints
            });
        }

        var chart = new CanvasJS.Chart(target, chartData);
        chart.render();
    }

    // Selectors by Tagname
    $l.ready(function() {
        var graph = $l.id('graph-selectors-tagname');
        var graphdata = [
            {
                name: 'Chrome',
                color: chromeColor,
                show: true,
                values: {
                    'laroux.js': 1976721,
                    'jQuery': 137778,
                    'Zepto': 116871
                }
            },
            {
                name: 'Firefox',
                color: firefoxColor,
                show: true,
                values: {
                    'laroux.js': 231524,
                    'jQuery': 59402,
                    'Zepto': 88427
                }
            },
            {
                name: 'IE',
                color: ieColor,
                show: false,
                values: {
                    'laroux.js': 223489,
                    'jQuery': 147338,
                    'Zepto': 78652
                }
            },
            {
                name: 'Safari',
                color: safariColor,
                show: false,
                values: {
                    'laroux.js': 4333683,
                    'jQuery': 327924,
                    'Zepto': 409258
                }
            }
        ];
        drawGraph(graph, graphdata);

        var button = $l.id('button-selectors-tagname');
        var text = $l.id('text-selectors-tagname');

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
        var graph = $l.id('graph-selectors-elementid');
        var graphdata = [
            {
                name: 'Chrome',
                color: chromeColor,
                show: true,
                values: {
                    'laroux.js': 7983949,
                    'laroux.js (Alt.)': 8168951,
                    'laroux.js (Alt. 2)': 23675789,
                    'jQuery': 370479,
                    'Zepto': 441020
                }
            },
            {
                name: 'Firefox',
                color: firefoxColor,
                show: true,
                values: {
                    'laroux.js': 200722,
                    'laroux.js (Alt.)': 421946,
                    'laroux.js (Alt. 2)': 0,
                    'jQuery': 286514,
                    'Zepto': 74654
                }
            },
            {
                name: 'IE',
                color: ieColor,
                show: false,
                values: {
                    'laroux.js': 309592,
                    'laroux.js (Alt.)': 632975,
                    'laroux.js (Alt. 2)': 0,
                    'jQuery': 314907,
                    'Zepto': 86235
                }
            },
            {
                name: 'Safari',
                color: safariColor,
                show: false,
                values: {
                    'laroux.js': 5848097,
                    'laroux.js (Alt.)': 14050558,
                    'laroux.js (Alt. 2)': 0,
                    'jQuery': 635188,
                    'Zepto': 411847
                }
            }
        ];
        drawGraph(graph, graphdata);

        var button = $l.id('button-selectors-elementid');
        var text = $l.id('text-selectors-elementid');

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
                                $l.id('home');
                            }
                        },
                        {
                            name: 'laroux.js (Alternative)',
                            fnc: function() {
                                $l.id('home');
                            }
                        },
                        {
                            name: 'laroux.js (Alternative 2)',
                            fnc: function() {
                                $l.idc('home');
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
        var graph = $l.id('graph-selectors-class');
        var graphdata = [
            {
                name: 'Chrome',
                color: chromeColor,
                show: true,
                values: {
                    'laroux.js': 1956844,
                    'laroux.js (Alt.)': 158550,
                    'jQuery': 89110,
                    'Zepto': 80006
                }
            },
            {
                name: 'Firefox',
                color: firefoxColor,
                show: true,
                values: {
                    'laroux.js': 203644,
                    'laroux.js (Alt.)': 121056,
                    'jQuery': 44510,
                    'Zepto': 71562
                }
            },
            {
                name: 'IE',
                color: ieColor,
                show: false,
                values: {
                    'laroux.js': 199585,
                    'laroux.js (Alt.)': 308762,
                    'jQuery': 117656,
                    'Zepto': 65597
                }
            },
            {
                name: 'Safari',
                color: safariColor,
                show: false,
                values: {
                    'laroux.js': 4060241,
                    'laroux.js (Alt.)': 3064627,
                    'jQuery': 292788,
                    'Zepto': 298792
                }
            }
        ];
        drawGraph(graph, graphdata);

        var button = $l.id('button-selectors-class');
        var text = $l.id('text-selectors-class');

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
                            name: 'laroux.js (Alternative)',
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
        var graph = $l.id('graph-main-each-arrays');
        var graphdata = [
            {
                name: 'Chrome',
                color: chromeColor,
                show: true,
                values: {
                    'laroux.js': 7081,
                    'laroux.js (Alt.)': 7674,
                    'jQuery': 7271,
                    'Zepto': 7058
                }
            },
            {
                name: 'Firefox',
                color: firefoxColor,
                show: true,
                values: {
                    'laroux.js': 21242,
                    'laroux.js (Alt.)': 18972,
                    'jQuery': 25108,
                    'Zepto': 24782
                }
            },
            {
                name: 'IE',
                color: ieColor,
                show: false,
                values: {
                    'laroux.js': 237065,
                    'laroux.js (Alt.)': 174020,
                    'jQuery': 196511,
                    'Zepto': 187453
                }
            },
            {
                name: 'Safari',
                color: safariColor,
                show: false,
                values: {
                    'laroux.js': 98140,
                    'laroux.js (Alt.)': 77570,
                    'jQuery': 103823,
                    'Zepto': 100608
                }
            }
        ];
        drawGraph(graph, graphdata);

        var button = $l.id('button-main-each-arrays');
        var text = $l.id('text-main-each-arrays');

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
                            name: 'laroux.js (Alternative)',
                            fnc: function() {
                                $l.aeach([52, 97], function(index, value) {
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
        var graph = $l.id('graph-main-each-objects');
        var graphdata = [
            {
                name: 'Chrome',
                color: chromeColor,
                show: true,
                values: {
                    'laroux.js': 8233,
                    'jQuery': 6785,
                    'Zepto': 6626
                }
            },
            {
                name: 'Firefox',
                color: firefoxColor,
                show: true,
                values: {
                    'laroux.js': 26740,
                    'jQuery': 24509,
                    'Zepto': 23855
                }
            },
            {
                name: 'IE',
                color: ieColor,
                show: false,
                values: {
                    'laroux.js': 259837,
                    'jQuery': 189345,
                    'Zepto': 187967
                }
            },
            {
                name: 'Safari',
                color: safariColor,
                show: false,
                values: {
                    'laroux.js': 119123,
                    'jQuery': 103770,
                    'Zepto': 103894
                }
            }
        ];
        drawGraph(graph, graphdata);

        var button = $l.id('button-main-each-objects');
        var text = $l.id('text-main-each-objects');

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
        var graph = $l.id('graph-main-map-arrays');
        var graphdata = [
            {
                name: 'Chrome',
                color: chromeColor,
                show: true,
                values: {
                    'laroux.js': 378533,
                    'laroux.js (Alt.)': 1240165,
                    'jQuery': 169422,
                    'Zepto': 167668
                }
            },
            {
                name: 'Firefox',
                color: firefoxColor,
                show: true,
                values: {
                    'laroux.js': 177761,
                    'laroux.js (Alt.)': 443161,
                    'jQuery': 648821,
                    'Zepto': 644681
                }
            },
            {
                name: 'IE',
                color: ieColor,
                show: false,
                values: {
                    'laroux.js': 1052153,
                    'laroux.js (Alt.)': 1408633,
                    'jQuery': 511160,
                    'Zepto': 485873
                }
            },
            {
                name: 'Safari',
                color: safariColor,
                show: false,
                values: {
                    'laroux.js': 1008297,
                    'laroux.js (Alt.)': 2768481,
                    'jQuery': 1455137,
                    'Zepto': 1441696
                }
            }
        ];
        drawGraph(graph, graphdata);

        var button = $l.id('button-main-map-arrays');
        var text = $l.id('text-main-map-arrays');

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
                            name: 'laroux.js (Alternative)',
                            fnc: function() {
                                $l.amap(['eser', 'ozvataf'], function(value) {
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
        var graph = $l.id('graph-main-map-objects');
        var graphdata = [
            {
                name: 'Chrome',
                color: chromeColor,
                show: true,
                values: {
                    'laroux.js': 4340077,
                    'jQuery': 148900,
                    'Zepto': 148136
                }
            },
            {
                name: 'Firefox',
                color: firefoxColor,
                show: true,
                values: {
                    'laroux.js': 2701741,
                    'jQuery': 525629,
                    'Zepto': 521860
                }
            },
            {
                name: 'IE',
                color: ieColor,
                show: false,
                values: {
                    'laroux.js': 1533039,
                    'jQuery': 431474,
                    'Zepto': 431442
                }
            },
            {
                name: 'Safari',
                color: safariColor,
                show: false,
                values: {
                    'laroux.js': 3793695,
                    'jQuery': 1401082,
                    'Zepto': 1363933
                }
            }
        ];
        drawGraph(graph, graphdata);

        var button = $l.id('button-main-map-objects');
        var text = $l.id('text-main-map-objects');

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
        var graph = $l.id('graph-dom-create-element');
        var graphdata = [
            {
                name: 'Chrome',
                color: chromeColor,
                show: true,
                values: {
                    'laroux.js': 22042,
                    'laroux.js (Alt.)': 17080,
                    'jQuery': 6743,
                    'Zepto': 7143
                }
            },
            {
                name: 'Firefox',
                color: firefoxColor,
                show: true,
                values: {
                    'laroux.js': 27208,
                    'laroux.js (Alt.)': 19259,
                    'jQuery': 10401,
                    'Zepto': 10487
                }
            },
            {
                name: 'IE',
                color: ieColor,
                show: false,
                values: {
                    'laroux.js': 8851,
                    'laroux.js (Alt.)': 2797,
                    'jQuery': 1389,
                    'Zepto': 1394
                }
            },
            {
                name: 'Safari',
                color: safariColor,
                show: false,
                values: {
                    'laroux.js': 166257,
                    'laroux.js (Alt.)': 95836,
                    'jQuery': 28640,
                    'Zepto': 27779
                }
            }
        ];
        drawGraph(graph, graphdata);

        var button = $l.id('button-dom-create-element');
        var text = $l.id('text-dom-create-element');

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
                            name: 'laroux.js (Alternative)',
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
        var graph = $l.id('graph-dom-manipulations');
        var graphdata = [
            {
                name: 'Chrome',
                color: chromeColor,
                show: true,
                values: {
                    'laroux.js': 14932,
                    'jQuery': 6398,
                    'Zepto': 5951
                }
            },
            {
                name: 'Firefox',
                color: firefoxColor,
                show: true,
                values: {
                    'laroux.js': 18946,
                    'jQuery': 5212,
                    'Zepto': 5078
                }
            },
            {
                name: 'IE',
                color: ieColor,
                show: false,
                values: {
                    'laroux.js': 5793,
                    'jQuery': 1029,
                    'Zepto': 1127
                }
            },
            {
                name: 'Safari',
                color: safariColor,
                show: false,
                values: {
                    'laroux.js': 96953,
                    'jQuery': 22014,
                    'Zepto': 21463
                }
            }
        ];
        drawGraph(graph, graphdata);

        var button = $l.id('button-dom-manipulations');
        var text = $l.id('text-dom-manipulations');

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
