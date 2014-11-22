(function() {
    'use strict';

    var crlf = '<br />';

    // ajax - Making a GET request
    $l.ready(function() {
        var button = $l.id('button-ajax-get-request');
        var text = $l.id('text-ajax-get-request');

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

    // anim - Creating a variable animation
    $l.ready(function() {
        var button = $l.id('button-anim-var-animate');

        $l.dom.setEvent(
            button,
            'click',
            function() {
                $l.anim.set({
                    object:   document.body,
                    property: 'scrollTop',
                    from:     null,
                    to:       0,
                    time:     800,
                    unit:     '',
                    reset:    false
                });

                return false;
            }
        );
    });

    // anim - Creating a CSS animation
    $l.ready(function() {
        var button = $l.id('button-anim-css-animate');
        var box = $l.id('div-anim-css-animate');

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
        var button = $l.id('button-css-transition');
        var box = $l.id('div-css-transition');

        $l.css.setTransition(
            box,
            [
                'background-color',
                'width 1s linear'
            ]
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
        var button = $l.id('button-date-dates');
        var text = $l.id('text-date-dates');

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
                $l.dom.append(text, $l.date.getDateString(now) + crlf);

                $l.dom.append(text, '<div><strong>Short Date + month names:</strong></div>');
                $l.dom.append(text, $l.date.getDateString(now, true) + crlf);

                $l.dom.append(text, '<div><strong>Long Date:</strong></div>');
                $l.dom.append(text, $l.date.getLongDateString(now) + crlf);

                $l.dom.append(text, '<div><strong>Long Date + month names:</strong></div>');
                $l.dom.append(text, $l.date.getLongDateString(now, true) + crlf);

                $l.dom.append(text, '<div><strong>Long Date + month names + time:</strong></div>');
                $l.dom.append(text, $l.date.getLongDateString(now, true, true) + crlf);

                return false;
            }
        );
    });

    // dom - Clone
    $l.ready(function() {
        var button = $l.id('button-dom-clone');
        var target = $l.id('target-dom-clone');

        $l.dom.setEvent(
            button,
            'click',
            function() {
                $l.dom.clone(target.firstElementChild, $l.dom.cloneAppend);

                return false;
            }
        );
    });

    // events - Setting Events
    $l.ready(function() {
        var checkbox = $l.id('checkbox-events-setting-events');
        var text = $l.id('text-events-setting-events');

        $l.dom.setEvent(
            checkbox,
            'change',
            function(ev, element) {
                if (element.checked) {
                    $l.dom.replace(text, 'checked');
                } else {
                    $l.dom.replace(text, 'unchecked');
                }

                return false;
            }
        );
    });

    // forms - Serializing
    $l.ready(function() {
        var button = $l.id('button-forms-serializing');
        var target = $l.id('target-forms-serializing');
        var text = $l.id('text-forms-serializing');

        $l.dom.setEvent(
            button,
            'click',
            function() {
                var serialized = $l.forms.serialize(target);
                $l.dom.replace(text, JSON.stringify(serialized));

                return false;
            }
        );
    });

    // forms - Toggle Form Editing
    $l.ready(function() {
        var button = $l.id('button-forms-toggle');
        var target = $l.id('target-forms-toggle');

        $l.dom.setEvent(
            button,
            'click',
            function() {
                $l.forms.toggleFormEditing($l.id('target-forms-toggle'));

                return false;
            }
        );
    });

    // helpers - Helpers
    $l.ready(function() {
        var button = $l.id('button-helpers-helpers');
        var text = $l.id('text-helpers-helpers');

        $l.dom.setEvent(
            button,
            'click',
            function() {
                $l.dom.clear(text);

                $l.dom.append(text, '<div><strong>Unique Id Generator:</strong></div>');
                $l.dom.append(text, $l.helpers.getUniqueId() + crlf);
                $l.dom.append(text, $l.helpers.getUniqueId() + crlf);

                $l.dom.append(text, '<div><strong>Query String Generation:</strong></div>');
                $l.dom.append(text, $l.helpers.buildQueryString({ pageId: 5, showAll: 'yes' }) + crlf);

                $l.dom.append(text, '<div><strong>Transform string into camel case:</strong></div>');
                $l.dom.append(text, $l.helpers.camelCase('text-align') + crlf);

                $l.dom.append(text, '<div><strong>Transform string back from camel case:</strong></div>');
                $l.dom.append(text, $l.helpers.antiCamelCase('textAlign') + crlf);

                $l.dom.append(text, '<div><strong>Encoding special characters:</strong></div>');
                $l.dom.append(text, $l.helpers.quoteAttr('<br clear="all" />') + crlf);

                $l.dom.append(text, '<div><strong>Generating random value:</strong></div>');
                $l.dom.append(text, $l.helpers.random(1, 15) + crlf);
                $l.dom.append(text, $l.helpers.random(1, 15) + crlf);

                $l.dom.append(text, '<div><strong>Getting values from a single column:</strong></div>');
                var arr = [{id: 1, count: 5}, {id: 2, count: 12}];
                $l.dom.append(text, JSON.stringify($l.helpers.column(arr, 'count')) + crlf);

                $l.dom.append(text, '<div><strong>Shuffling values:</strong></div>');
                $l.dom.append(text, $l.helpers.shuffle([1, 2, 3, 4, 5]) + crlf);

                $l.dom.append(text, '<div><strong>Merging two arrays:</strong></div>');
                $l.dom.append(text, JSON.stringify($l.helpers.merge({id: 1}, {name: 'eser', count: 5})) + crlf);

                $l.dom.append(text, '<div><strong>Getting count of elements:</strong></div>');
                $l.dom.append(text, $l.helpers.getLength({id: 1, name: 'eser', count: 5}) + crlf);

                $l.dom.append(text, '<div><strong>Getting elements with dot notation:</strong></div>');
                $l.dom.append(text, $l.helpers.getElement({id: 1, child: { a: 1, b: 2 }}, 'child.a') + crlf);

                $l.dom.append(text, '<div><strong>Getting keys for dot notation:</strong></div>');
                $l.dom.append(text, JSON.stringify($l.helpers.getKeysRecursive({id: 1, child: { a: 1, b: 2 }})) + crlf);

                return false;
            }
        );
    });

    // mvc
    if (typeof Object.observe != 'undefined') {
        $l.ready(function() {
            $l.mvc.init();
        });

        // mvc - Simple Model Binding
        $l.ready(function() {
            var textbox = $l.id('textbox-mvc-simple');
            var myModel = { name: '' };

            $l.mvc.bind('mvcsimple', myModel);

            $l.dom.setEvent(
                textbox,
                'keyup',
                function(ev, element) {
                    myModel.name = element.value;

                    return false;
                }
            );
        });

        // mvc - Model Binding with Controller
        $l.ready(function() {
            var textboxes = $l(['.textboxes-mvc-controller']);
            var myModel = { a: 3, b: 5 };

            var controller = function($model) {
                $model.total = parseInt($model.a) + parseInt($model.b);
            };

            $l.mvc.bind('mvccontroller', myModel, controller);

            $l.dom.setEvent(
                textboxes,
                'keyup',
                function(ev, element) {
                    myModel[element.getAttribute('name')] = element.value;

                    return false;
                }
            );
        });
    }

    // stack - Examples
    $l.ready(function() {
        var button = $l.id('button-stack-example');
        var text = $l.id('text-stack-example');

        $l.dom.setEvent(
            button,
            'click',
            function() {
                var stack = new $l.stack();
                stack.add('id', 1);
                stack.addRange({count: 15, name: 'eser'});

                $l.dom.clear(text);

                $l.dom.append(text, '<div><strong>Element with key \'id\':</strong></div>');
                $l.dom.append(text, stack.get('id') + crlf);

                $l.dom.append(text, '<div><strong>Elements with keys \'id\' and \'name\':</strong></div>');
                $l.dom.append(text, JSON.stringify(stack.getRange(['id', 'name'])) + crlf);

                $l.dom.append(text, '<div><strong>Keys:</strong></div>');
                $l.dom.append(text, JSON.stringify(stack.keys()) + crlf);

                $l.dom.append(text, '<div><strong>Length:</strong></div>');
                $l.dom.append(text, JSON.stringify(stack.length()) + crlf);

                $l.dom.append(text, '<div><strong>Check if it has element with key \'name\':</strong></div>');
                $l.dom.append(text, JSON.stringify(stack.exists('name')) + crlf);

                $l.dom.append(text, '<div><strong>All data:</strong></div>');
                $l.dom.append(text, JSON.stringify(stack.data) + crlf);

                return false;
            }
        );
    });

    // timers - Set
    $l.ready(function() {
        var button = $l.id('button-timers-set');
        var text = $l.id('text-timers-set');

        $l.dom.setEvent(
            button,
            'click',
            function() {
                $l.dom.replace(text, 'waiting...' + crlf);
                $l.timers.set({
                    'timeout': 500,
                    'reset': false,
                    'ontick': function() {
                        $l.dom.append(text, 'time\'s up');
                    }
                });

                return false;
            }
        );
    });

    // ui
    $l.ready(function() {
        $l.ui.init();
    });

    // ui - Popup
    $l.ready(function() {
        var button = $l.id('button-ui-popup');

        $l.dom.setEvent(
            button,
            'click',
            function() {
                $l.ui.popup.msgbox(2000, 'test message');

                return false;
            }
        );
    });
})();
