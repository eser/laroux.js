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

        $l.web.dom.clear(target);
        $l.web.dom.append(target, 'Awaiting test results...' + crlf);

        // add tests
        for (var item in tests) {
            var test = tests[item];
            suite.add(test.name, test.fnc);
        }

        // add listeners
        suite
            .on('cycle', function(event) {
                $l.web.dom.append(target, String(event.target) + crlf);
            })
            .on('complete', function() {
                $l.web.dom.append(target, 'Fastest is <strong>' + this.filter('fastest').pluck('name') + '</strong>' + crlf);
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

    $l.ready(function() {
        prettyPrint();
    });

    // Selectors by Tagname
    $l.ready(function() {
        var graph = $l.web.id('graph-selectors-tagname');
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
                    'laroux.js': 161405,
                    'jQuery': 59934,
                    'Zepto': 96625
                }
            },
            {
                name: 'IE',
                color: ieColor,
                show: false,
                values: {
                    'laroux.js': 233558,
                    'jQuery': 152539,
                    'Zepto': 83891
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

        var button = $l.web.id('button-selectors-tagname');
        var text = $l.web.id('text-selectors-tagname');

        $l.web.dom.setEvent(
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
        var graph = $l.web.id('graph-selectors-elementid');
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
                    'laroux.js': 454690,
                    'laroux.js (Alt.)': 319715,
                    'laroux.js (Alt. 2)': 119086560,
                    'jQuery': 516144,
                    'Zepto': 73711
                }
            },
            {
                name: 'IE',
                color: ieColor,
                show: false,
                values: {
                    'laroux.js': 698106,
                    'laroux.js (Alt.)': 651679,
                    'laroux.js (Alt. 2)': 4505485,
                    'jQuery': 298208,
                    'Zepto': 88610
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

        var button = $l.web.id('button-selectors-elementid');
        var text = $l.web.id('text-selectors-elementid');

        $l.web.dom.setEvent(
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
                                $l.web.id('home');
                            }
                        },
                        {
                            name: 'laroux.js (Alternative)',
                            fnc: function() {
                                $l.web.id('home');
                            }
                        },
                        {
                            name: 'laroux.js (Alternative 2)',
                            fnc: function() {
                                $l.web.idc('home');
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
        var graph = $l.web.id('graph-selectors-class');
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
                    'laroux.js': 168815,
                    'laroux.js (Alt.)': 111615,
                    'jQuery': 44314,
                    'Zepto': 82399
                }
            },
            {
                name: 'IE',
                color: ieColor,
                show: false,
                values: {
                    'laroux.js': 199811,
                    'laroux.js (Alt.)': 321012,
                    'jQuery': 123138,
                    'Zepto': 70533
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

        var button = $l.web.id('button-selectors-class');
        var text = $l.web.id('text-selectors-class');

        $l.web.dom.setEvent(
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
                                $l.web.dom.selectByClass('container');
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
        var graph = $l.web.id('graph-main-each-arrays');
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
                    'laroux.js': 18958,
                    'laroux.js (Alt.)': 24862,
                    'jQuery': 22002,
                    'Zepto': 20270
                }
            },
            {
                name: 'IE',
                color: ieColor,
                show: false,
                values: {
                    'laroux.js': 261119,
                    'laroux.js (Alt.)': 287524,
                    'jQuery': 200929,
                    'Zepto': 195399
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

        var button = $l.web.id('button-main-each-arrays');
        var text = $l.web.id('text-main-each-arrays');

        $l.web.dom.setEvent(
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
        var graph = $l.web.id('graph-main-each-objects');
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
                    'laroux.js': 22096,
                    'jQuery': 20598,
                    'Zepto': 19909
                }
            },
            {
                name: 'IE',
                color: ieColor,
                show: false,
                values: {
                    'laroux.js': 265191,
                    'jQuery': 189605,
                    'Zepto': 193842
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

        var button = $l.web.id('button-main-each-objects');
        var text = $l.web.id('text-main-each-objects');

        $l.web.dom.setEvent(
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
        var graph = $l.web.id('graph-main-map-arrays');
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
                    'laroux.js': 192340,
                    'laroux.js (Alt.)': 717126,
                    'jQuery': 664320,
                    'Zepto': 671392
                }
            },
            {
                name: 'IE',
                color: ieColor,
                show: false,
                values: {
                    'laroux.js': 1068952,
                    'laroux.js (Alt.)': 1698577,
                    'jQuery': 560230,
                    'Zepto': 510865
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

        var button = $l.web.id('button-main-map-arrays');
        var text = $l.web.id('text-main-map-arrays');

        $l.web.dom.setEvent(
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
        var graph = $l.web.id('graph-main-map-objects');
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
                    'laroux.js': 2981061,
                    'jQuery': 518294,
                    'Zepto': 520718
                }
            },
            {
                name: 'IE',
                color: ieColor,
                show: false,
                values: {
                    'laroux.js': 1599831,
                    'jQuery': 469958,
                    'Zepto': 463648
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

        var button = $l.web.id('button-main-map-objects');
        var text = $l.web.id('text-main-map-objects');

        $l.web.dom.setEvent(
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
        var graph = $l.web.id('graph-dom-create-element');
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
                    'laroux.js': 25465,
                    'laroux.js (Alt.)': 18202,
                    'jQuery': 10451,
                    'Zepto': 10263
                }
            },
            {
                name: 'IE',
                color: ieColor,
                show: false,
                values: {
                    'laroux.js': 8977,
                    'laroux.js (Alt.)': 2857,
                    'jQuery': 1384,
                    'Zepto': 1354
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

        var button = $l.web.id('button-dom-create-element');
        var text = $l.web.id('text-dom-create-element');

        $l.web.dom.setEvent(
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
                                $l.web.dom.createElement('DIV', { class: 'x' }, 'y');
                            }
                        },
                        {
                            name: 'laroux.js (Alternative)',
                            fnc: function() {
                                $l.web.dom.create('<div class="x">y</div>');
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
        var graph = $l.web.id('graph-dom-manipulations');
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
                    'laroux.js': 17317,
                    'jQuery': 6902,
                    'Zepto': 6614
                }
            },
            {
                name: 'IE',
                color: ieColor,
                show: false,
                values: {
                    'laroux.js': 4960,
                    'jQuery': 1203,
                    'Zepto': 1358
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

        var button = $l.web.id('button-dom-manipulations');
        var text = $l.web.id('text-dom-manipulations');

        $l.web.dom.setEvent(
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
                                var div = $l.web.dom.createElement('DIV');
                                $l.web.dom.append(div, 'appended');
                                $l.web.dom.prepend(div, 'prepended');
                                $l.web.dom.clear(div);
                                $l.web.dom.remove(div);
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
