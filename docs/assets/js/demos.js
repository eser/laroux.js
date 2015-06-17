(function() {
    'use strict';

    var crlf = '<br />';

    $l.ready(function() {
        prettyPrint();
    });

    // ajax - Making a GET request
    $l.ready(function() {
        var button = $l.id('button-ajax-get-request');
        var text = $l.id('text-ajax-get-request');

        $l.dom.setEvent(
            button,
            'click',
            function() {
                $l.ajax.getJson(
                    'test.json'

                ).done(function (response) {
                    $l.dom.replace(text, response.testResponse);

                }).fail(function (error) {
                    $l.dom.replace(text, 'Error: ' + error.message);

                });

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
                $l.dom.append(text, $l.date.getShortDateString(now) + crlf);

                $l.dom.append(text, '<div><strong>Short Date + month names:</strong></div>');
                $l.dom.append(text, $l.date.getShortDateString(now, true) + crlf);

                $l.dom.append(text, '<div><strong>Long Date:</strong></div>');
                $l.dom.append(text, $l.date.getLongDateString(now) + crlf);

                $l.dom.append(text, '<div><strong>Long Date + month names:</strong></div>');
                $l.dom.append(text, $l.date.getLongDateString(now, true) + crlf);

                $l.dom.append(text, '<div><strong>Custom Date:</strong></div>');
                $l.dom.append(text, $l.date.getCustomDateString('dd/MM/yyyy HH:ss', now) + crlf);

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
                $l.dom.append(text, $l.getUniqueId() + crlf);
                $l.dom.append(text, $l.getUniqueId() + crlf);

                $l.dom.append(text, '<div><strong>Query String Generation:</strong></div>');
                $l.dom.append(text, $l.buildQueryString({pageId: 5, showAll: 'yes'}) + crlf);

                $l.dom.append(text, '<div><strong>Transform string into camel case:</strong></div>');
                $l.dom.append(text, $l.camelCase('text-align') + crlf);

                $l.dom.append(text, '<div><strong>Transform string back from camel case:</strong></div>');
                $l.dom.append(text, $l.antiCamelCase('textAlign') + crlf);

                $l.dom.append(text, '<div><strong>Encoding special characters:</strong></div>');
                $l.dom.append(text, $l.quoteAttr('<br clear="all" />') + crlf);

                $l.dom.append(text, '<div><strong>Generating random value:</strong></div>');
                $l.dom.append(text, $l.random(1, 15) + crlf);
                $l.dom.append(text, $l.random(1, 15) + crlf);

                $l.dom.append(text, '<div><strong>Getting values from a single column:</strong></div>');
                var arr = [{id: 1, count: 5}, {id: 2, count: 12}];
                $l.dom.append(text, JSON.stringify($l.column(arr, 'count')) + crlf);

                $l.dom.append(text, '<div><strong>Shuffling values:</strong></div>');
                $l.dom.append(text, $l.shuffle([1, 2, 3, 4, 5]) + crlf);

                $l.dom.append(text, '<div><strong>Merging objects:</strong></div>');
                $l.dom.append(text, JSON.stringify($l.merge({id: 1}, {name: 'eser', count: 5})) + crlf);

                $l.dom.append(text, '<div><strong>Getting count of elements:</strong></div>');
                $l.dom.append(text, $l.getLength({id: 1, name: 'eser', count: 5}) + crlf);

                $l.dom.append(text, '<div><strong>Getting elements with dot notation:</strong></div>');
                $l.dom.append(text, $l.getElement({id: 1, child: {a: 1, b: 2}}, 'child.a') + crlf);

                $l.dom.append(text, '<div><strong>Getting keys for dot notation:</strong></div>');
                $l.dom.append(text, JSON.stringify($l.getKeysRecursive({id: 1, child: {a: 1, b: 2}})) + crlf);

                return false;
            }
        );
    });

    // storyboard - Animation
    $l.ready(function() {
        var button = $l.id('button-storyboard-animation');
        var box = $l.id('div-storyboard-animation');

        $l.dom.setEvent(
            button,
            'click',
            function() {
                var step1action1 = function () {
                    $l.css.setProperty(box, 'background-color', 'blue');
                };

                var step1action2 = $l.anim.setCss({
                    object:   box,
                    property: 'left',
                    from:     0, // current value
                    to:       50,
                    time:     1200,
                    unit:     'px',
                    reset:    false
                });

                var step2 = function () {
                    var deferred = $l.anim.setCss({
                        object:   box,
                        property: 'left',
                        from:     50, // current value
                        to:       0,
                        time:     600,
                        unit:     'px',
                        reset:    false
                    });

                    myStory.add('second-step', deferred);
                };

                var step3 = function () {
                    $l.css.setProperty(box, 'background-color', 'red');
                };

                var myStory = new $l.storyboard();
                myStory.addPhase('first-step');
                myStory.addPhase('second-step');
                myStory.addPhase('third-step');

                myStory.add('first-step', step1action1);
                myStory.add('first-step', step1action2);

                myStory.add('second-step', step2);

                myStory.add('third-step', step3);

                myStory.start();

                return false;
            }
        );
    });

    // keys - Assign a key
    $l.ready(function() {
        var button = $l.id('button-keys-assign');
        var text = $l.id('text-keys-assign');
        var pressCount = 0;

        $l.dom.setEvent(
            button,
            'click',
            function(ev, element) {
                $l.dom.replace(text, 'Key is assigned, press F7 to trigger the event');

                $l.keys.assign({
                    target: document,
                    key: 'f7',
                    callback: function() {
                        $l.dom.replace(text, 'pressed: ' + ++pressCount);
                    }
                });

                return false;
            }
        );
    });

    // mvc - Simple Model Binding
    $l.ready(function() {
        var textbox = $l.id('textbox-mvc-simple');
        var myModel = new $l.types.observable({
            name: ''
        });

        $l.mvc.init('mvcsimple', myModel);

        $l.dom.setEvent(
            textbox,
            'keyup',
            function(ev, element) {
                myModel.name = element.value;

                return false;
            }
        );
    });

    // mvc - Model Binding with Calculation
    $l.ready(function() {
        var myModel = new $l.types.observable({
            a: 3,
            b: 5,
            total: function() {
                return parseInt(this.a) + parseInt(this.b);
            }
        });

        $l.mvc.init('mvccalculation', myModel);
    });

    // mvc - Model Binding in two-way
    $l.ready(function() {
        var myModel = new $l.types.observable({
            text: 'initial'
        });

        $l.mvc.init('mvctwoway', myModel);
    });

    // routes - Routing
    $l.ready(function() {
        var text = $l.id('text-routes-routing');
        var button1 = $l.id('button-routes-routing-1');
        var button2 = $l.id('button-routes-routing-2');
        var button3 = $l.id('button-routes-routing-3');

        $l.routes.add(
            'test/:name',
            function (name, trans) {
                $l.dom.clear(text);

                $l.dom.append(text, '<div><strong>Name:</strong></div>');
                $l.dom.append(text, name + crlf);

                $l.dom.append(text, '<div><strong>Transition Data:</strong></div>');
                $l.dom.append(text, JSON.stringify(trans) + crlf);
            }
        );
        $l.routes.reload();

        $l.dom.setEvent(button1, 'click', function () { $l.routes.go('test/route1'); });
        $l.dom.setEvent(button2, 'click', function () { $l.routes.go('test/route2'); });
        $l.dom.setEvent(button3, 'click', function () { $l.routes.go('test/route3'); });
    });

    // routes - Named Routing
    $l.ready(function() {
        var text = $l.id('text-routes-namedrouting');
        var button1 = $l.id('button-routes-namedrouting-1');
        var button2 = $l.id('button-routes-namedrouting-2');
        var button3 = $l.id('button-routes-namedrouting-3');

        $l.routes.addNamed(
            'test2',
            'testNamed/:name',
            function (name, trans) {
                $l.dom.clear(text);

                $l.dom.append(text, '<div><strong>Name:</strong></div>');
                $l.dom.append(text, name + crlf);

                $l.dom.append(text, '<div><strong>Transition Data:</strong></div>');
                $l.dom.append(text, JSON.stringify(trans) + crlf);
            }
        );
        $l.routes.reload();

        $l.dom.setEvent(button1, 'click', function () { $l.routes.goNamed('test2', { name: 'route1' }); });
        $l.dom.setEvent(button2, 'click', function () { $l.routes.goNamed('test2', { name: 'route2' }); });
        $l.dom.setEvent(button3, 'click', function () { $l.routes.goNamed('test2', { name: 'route3' }); });
    });

    // templates - Examples
    $l.ready(function() {
        var button = $l.id('button-templates-example');
        var text = $l.id('text-templates-example');
        var script = $l.id('script-templates-example');

        $l.dom.setEvent(
            button,
            'click',
            function() {
                var myModel = { name: { first: 'Jane', last: 'Doe' }, age: 25 };
                var result = $l.templates.apply(script, myModel);
                $l.dom.replace(text, result);
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

    // touch - Touch Events
    $l.ready(function() {
        var box = $l.id('div-touch-events');
        var target = $l.id('target-touch-events');

        $l.dom.setEvent(
            box,
            'tap',
            function(event) {
                var createdElement = $l.dom.createElement('LI', { }, 'tap');
                target.appendChild(createdElement);
            }
        );

        $l.dom.setEvent(
            box,
            'dbltap',
            function(event) {
                var createdElement = $l.dom.createElement('LI', { }, 'dbltap');
                target.appendChild(createdElement);
            }
        );

        $l.dom.setEvent(
            box,
            'longtap',
            function(event) {
                var createdElement = $l.dom.createElement('LI', { }, 'longtap');
                target.appendChild(createdElement);
            }
        );
    });

    // types - Examples
    $l.ready(function() {
        var button = $l.id('button-types-example');
        var text = $l.id('text-types-example');

        $l.dom.setEvent(
            button,
            'click',
            function() {
                var myModel = new $l.types.observable();
                myModel.set('id', 1);
                myModel.setRange({count: 15, name: 'eser'});

                $l.dom.clear(text);

                $l.dom.append(text, '<div><strong>Element with key \'id\':</strong></div>');
                $l.dom.append(text, myModel.get('id') + crlf);

                $l.dom.append(text, '<div><strong>Elements with keys \'id\' and \'name\':</strong></div>');
                $l.dom.append(text, JSON.stringify(myModel.getRange(['id', 'name'])) + crlf);

                $l.dom.append(text, '<div><strong>Keys:</strong></div>');
                $l.dom.append(text, JSON.stringify(myModel.keys()) + crlf);

                $l.dom.append(text, '<div><strong>Length:</strong></div>');
                $l.dom.append(text, JSON.stringify(myModel.length()) + crlf);

                $l.dom.append(text, '<div><strong>Check if it has element with key \'name\':</strong></div>');
                $l.dom.append(text, JSON.stringify(myModel.exists('name')) + crlf);

                return false;
            }
        );
    });

    // vars - Set / Read / Remove
    $l.ready(function() {
        var text = $l.id('text-vars');
        var select = $l.id('select-vars');
        var buttonSet = $l.id('button-vars-set');
        var buttonRead = $l.id('button-vars-read');
        var buttonRemove = $l.id('button-vars-remove');

        $l.dom.setEvent(
            buttonSet,
            'click',
            function() {
                var storage = select.options[select.selectedIndex].value;
                $l.vars.set(storage, 'demopage', 'a ' + storage + ' test');
                $l.dom.append(text, storage + ' set' + crlf);

                return false;
            }
        );

        $l.dom.setEvent(
            buttonRead,
            'click',
            function() {
                var storage = select.options[select.selectedIndex].value;
                var value = $l.vars.get(storage, 'demopage');
                if (value !== null) {
                    $l.dom.append(text, storage + '\'s value is: ' + value + crlf);
                } else {
                    $l.dom.append(text, 'you need to set a ' + storage + ' first' + crlf);
                }

                return false;
            }
        );

        $l.dom.setEvent(
            buttonRemove,
            'click',
            function() {
                var storage = select.options[select.selectedIndex].value;
                $l.vars.remove(storage, 'demopage');
                $l.dom.append(text, storage + ' is removed' + crlf);

                return false;
            }
        );
    });

    // when - Set
    $l.ready(function() {
        var button1 = $l.id('button-when-set-1');
        var button2 = $l.id('button-when-set-2');
        var buttonReset = $l.id('button-when-set-reset');
        var text = $l.id('text-when-set');

        $l.dom.append(text, 'click both buttons in any order' + crlf);

        var promise1;
        var promise2;

        var resetFunc = function() {
            promise1 = new $l.deferred();
            promise2 = new $l.deferred();

            new $l.when(promise1, promise2)
                .then(function() {
                    $l.dom.append(text, 'all set' + crlf);
                    $l.dom.attr(buttonReset, 'disabled', null);
                });

            $l.dom.attr(buttonReset, 'disabled', 'disabled');
        };
        resetFunc();

        $l.dom.setEvent(
            button1,
            'click',
            function() {
                $l.dom.append(text, 'button1 clicked...' + crlf);
                promise1.resolve();

                return false;
            }
        );

        $l.dom.setEvent(
            button2,
            'click',
            function() {
                $l.dom.append(text, 'button2 clicked...' + crlf);
                promise2.resolve();

                return false;
            }
        );

        $l.dom.setEvent(
            buttonReset,
            'click',
            function() {
                resetFunc();

                return false;
            }
        );
    });

})();
