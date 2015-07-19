(function() {
    'use strict';

    var crlf = '<br />';

    $l.ready(function() {
        prettyPrint();
    });

    // ajax - Making a GET request
    $l.ready(function() {
        var button = $l.web.id('button-ajax-get-request');
        var text = $l.web.id('text-ajax-get-request');

        $l.web.dom.setEvent(
            button,
            'click',
            function() {
            $l.ajax.fetch('test.json')
                .then(function (response) {
                    return response.json();

                }).then(function (json) {
                    $l.web.dom.replace($l.web.id('text-ajax-get-request'), json.testResponse);

                }).catch(function (error) {
                    $l.web.dom.replace(text, 'Error: ' + error.message);

                });

                return false;
            }
        );
    });

    // anim - Creating a variable animation
    $l.ready(function() {
        var button = $l.web.id('button-anim-var-animate');

        $l.web.dom.setEvent(
            button,
            'click',
            function() {
                $l.web.anim.set({
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
        var button = $l.web.id('button-anim-css-animate');
        var box = $l.web.id('div-anim-css-animate');

        $l.web.dom.setEvent(
            button,
            'click',
            function() {
                $l.web.anim.setCss({
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
        var button = $l.web.id('button-css-transition');
        var box = $l.web.id('div-css-transition');

        $l.web.css.setTransition(
            box,
            [
                'background-color',
                'width 1s linear'
            ]
        );

        $l.web.dom.setEvent(
            button,
            'click',
            function() {
                $l.web.css.toggleClass(
                    box,
                    'box-silver'
                );

                return false;
            }
        );
    });

    // intl - Dates
    $l.ready(function() {
        var button = $l.web.id('button-intl-dates');
        var text = $l.web.id('text-intl-dates');

        $l.web.dom.setEvent(
            button,
            'click',
            function() {
                var now = new Date();
                var yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);

                $l.web.dom.clear(text);

                $l.web.dom.append(text, '<div><strong>From yesterday to today:</strong></div>');
                $l.web.dom.append(text, $l.intl.parseEpoch(now.getTime() - yesterday.getTime()));

                $l.web.dom.append(text, '<div><strong>Short Date:</strong></div>');
                $l.web.dom.append(text, $l.intl.shortDate(now) + crlf);

                $l.web.dom.append(text, '<div><strong>Short Date + month names:</strong></div>');
                $l.web.dom.append(text, $l.intl.shortDate(now, true) + crlf);

                $l.web.dom.append(text, '<div><strong>Long Date:</strong></div>');
                $l.web.dom.append(text, $l.intl.longDate(now) + crlf);

                $l.web.dom.append(text, '<div><strong>Long Date + month names:</strong></div>');
                $l.web.dom.append(text, $l.intl.longDate(now, true) + crlf);

                $l.web.dom.append(text, '<div><strong>Custom Date:</strong></div>');
                $l.web.dom.append(text, $l.intl.customDate('dd/MM/yyyy HH:ss', now) + crlf);

                return false;
            }
        );
    });

    // dom - Clone
    $l.ready(function() {
        var button = $l.web.id('button-dom-clone');
        var target = $l.web.id('target-dom-clone');

        $l.web.dom.setEvent(
            button,
            'click',
            function() {
                $l.web.dom.clone(target.firstElementChild, $l.web.dom.cloneAppend);

                return false;
            }
        );
    });

    // events - Setting Events
    $l.ready(function() {
        var checkbox = $l.web.id('checkbox-events-setting-events');
        var text = $l.web.id('text-events-setting-events');

        $l.web.dom.setEvent(
            checkbox,
            'change',
            function(ev, element) {
                if (element.checked) {
                    $l.web.dom.replace(text, 'checked');
                } else {
                    $l.web.dom.replace(text, 'unchecked');
                }

                return false;
            }
        );
    });

    // forms - Serializing
    $l.ready(function() {
        var button = $l.web.id('button-forms-serializing');
        var target = $l.web.id('target-forms-serializing');
        var text = $l.web.id('text-forms-serializing');

        $l.web.dom.setEvent(
            button,
            'click',
            function() {
                var serialized = $l.web.forms.serialize(target);
                $l.web.dom.replace(text, JSON.stringify(serialized));

                return false;
            }
        );
    });

    // forms - Toggle Form Editing
    $l.ready(function() {
        var button = $l.web.id('button-forms-toggle');
        var target = $l.web.id('target-forms-toggle');

        $l.web.dom.setEvent(
            button,
            'click',
            function() {
                $l.web.forms.toggleFormEditing($l.web.id('target-forms-toggle'));

                return false;
            }
        );
    });

    // helpers - Helpers
    $l.ready(function() {
        var button = $l.web.id('button-helpers-helpers');
        var text = $l.web.id('text-helpers-helpers');

        $l.web.dom.setEvent(
            button,
            'click',
            function() {
                $l.web.dom.clear(text);

                $l.web.dom.append(text, '<div><strong>Unique Id Generator:</strong></div>');
                $l.web.dom.append(text, $l.getUniqueId() + crlf);
                $l.web.dom.append(text, $l.getUniqueId() + crlf);

                $l.web.dom.append(text, '<div><strong>Query String Generation:</strong></div>');
                $l.web.dom.append(text, $l.buildQueryString({pageId: 5, showAll: 'yes'}) + crlf);

                $l.web.dom.append(text, '<div><strong>Transform string into camel case:</strong></div>');
                $l.web.dom.append(text, $l.camelCase('text-align') + crlf);

                $l.web.dom.append(text, '<div><strong>Transform string back from camel case:</strong></div>');
                $l.web.dom.append(text, $l.antiCamelCase('textAlign') + crlf);

                $l.web.dom.append(text, '<div><strong>Encoding special characters:</strong></div>');
                $l.web.dom.append(text, $l.quoteAttr('<br clear="all" />') + crlf);

                $l.web.dom.append(text, '<div><strong>Generating random value:</strong></div>');
                $l.web.dom.append(text, $l.random(1, 15) + crlf);
                $l.web.dom.append(text, $l.random(1, 15) + crlf);

                $l.web.dom.append(text, '<div><strong>Getting values from a single column:</strong></div>');
                var arr = [{id: 1, count: 5}, {id: 2, count: 12}];
                $l.web.dom.append(text, JSON.stringify($l.column(arr, 'count')) + crlf);

                $l.web.dom.append(text, '<div><strong>Shuffling values:</strong></div>');
                $l.web.dom.append(text, $l.shuffle([1, 2, 3, 4, 5]) + crlf);

                $l.web.dom.append(text, '<div><strong>Merging objects:</strong></div>');
                $l.web.dom.append(text, JSON.stringify($l.merge({id: 1}, {name: 'eser', count: 5})) + crlf);

                $l.web.dom.append(text, '<div><strong>Getting count of elements:</strong></div>');
                $l.web.dom.append(text, $l.getLength({id: 1, name: 'eser', count: 5}) + crlf);

                $l.web.dom.append(text, '<div><strong>Getting elements with dot notation:</strong></div>');
                $l.web.dom.append(text, $l.getElement({id: 1, child: {a: 1, b: 2}}, 'child.a') + crlf);

                $l.web.dom.append(text, '<div><strong>Getting keys for dot notation:</strong></div>');
                $l.web.dom.append(text, JSON.stringify($l.getKeysRecursive({id: 1, child: {a: 1, b: 2}})) + crlf);

                return false;
            }
        );
    });

    // storyboard - Animation
    $l.ready(function() {
        var button = $l.web.id('button-storyboard-animation');
        var box = $l.web.id('div-storyboard-animation');

        $l.web.dom.setEvent(
            button,
            'click',
            function() {
                var step1action1 = function () {
                    $l.web.css.setProperty(box, 'background-color', 'blue');
                };

                var step1action2 = $l.web.anim.setCss({
                    object:   box,
                    property: 'left',
                    from:     0, // current value
                    to:       50,
                    time:     1200,
                    unit:     'px',
                    reset:    false
                });

                var step2 = function () {
                    var promise = $l.web.anim.setCss({
                        object:   box,
                        property: 'left',
                        from:     50, // current value
                        to:       0,
                        time:     600,
                        unit:     'px',
                        reset:    false
                    });

                    myStory.add('second-step', promise);
                };

                var step3 = function () {
                    $l.web.css.setProperty(box, 'background-color', 'red');
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
        var button = $l.web.id('button-keys-assign');
        var text = $l.web.id('text-keys-assign');
        var pressCount = 0;

        $l.web.dom.setEvent(
            button,
            'click',
            function(ev, element) {
                $l.web.dom.replace(text, 'Key is assigned, press F7 to trigger the event');

                $l.web.keys.assign({
                    target: document,
                    key: 'f7',
                    callback: function() {
                        $l.web.dom.replace(text, 'pressed: ' + ++pressCount);
                    }
                });

                return false;
            }
        );
    });

    // mvvm - Simple Model Binding
    $l.ready(function() {
        var textbox = $l.web.id('textbox-mvvm-simple');
        var myModel = new $l.types.observable({
            name: ''
        });

        $l.web.mvvm.init('mvvmsimple', myModel);

        $l.web.dom.setEvent(
            textbox,
            'keyup',
            function(ev, element) {
                myModel.name = element.value;

                return false;
            }
        );
    });

    // mvvm - Model Binding with Calculation
    $l.ready(function() {
        var myModel = new $l.types.observable({
            a: 3,
            b: 5,
            total: function() {
                return parseInt(this.a) + parseInt(this.b);
            }
        });

        $l.web.mvvm.init('mvvmcalculation', myModel);
    });

    // mvvm - Model Binding in two-way
    $l.ready(function() {
        var myModel = new $l.types.observable({
            text: 'initial'
        });

        $l.web.mvvm.init('mvvmtwoway', myModel);
    });

    // routes - Routing
    $l.ready(function() {
        var text = $l.web.id('text-routes-routing');
        var button1 = $l.web.id('button-routes-routing-1');
        var button2 = $l.web.id('button-routes-routing-2');
        var button3 = $l.web.id('button-routes-routing-3');

        $l.web.routes.add(
            'test/:name',
            function (name, trans) {
                $l.web.dom.clear(text);

                $l.web.dom.append(text, '<div><strong>Name:</strong></div>');
                $l.web.dom.append(text, name + crlf);

                $l.web.dom.append(text, '<div><strong>Transition Data:</strong></div>');
                $l.web.dom.append(text, JSON.stringify(trans) + crlf);
            }
        );
        $l.web.routes.reload();

        $l.web.dom.setEvent(button1, 'click', function () { $l.web.routes.go('test/route1'); });
        $l.web.dom.setEvent(button2, 'click', function () { $l.web.routes.go('test/route2'); });
        $l.web.dom.setEvent(button3, 'click', function () { $l.web.routes.go('test/route3'); });
    });

    // routes - Named Routing
    $l.ready(function() {
        var text = $l.web.id('text-routes-namedrouting');
        var button1 = $l.web.id('button-routes-namedrouting-1');
        var button2 = $l.web.id('button-routes-namedrouting-2');
        var button3 = $l.web.id('button-routes-namedrouting-3');

        $l.web.routes.addNamed(
            'test2',
            'testNamed/:name',
            function (name, trans) {
                $l.web.dom.clear(text);

                $l.web.dom.append(text, '<div><strong>Name:</strong></div>');
                $l.web.dom.append(text, name + crlf);

                $l.web.dom.append(text, '<div><strong>Transition Data:</strong></div>');
                $l.web.dom.append(text, JSON.stringify(trans) + crlf);
            }
        );
        $l.web.routes.reload();

        $l.web.dom.setEvent(button1, 'click', function () { $l.web.routes.goNamed('test2', { name: 'route1' }); });
        $l.web.dom.setEvent(button2, 'click', function () { $l.web.routes.goNamed('test2', { name: 'route2' }); });
        $l.web.dom.setEvent(button3, 'click', function () { $l.web.routes.goNamed('test2', { name: 'route3' }); });
    });

    // templates - Examples
    $l.ready(function() {
        var button = $l.web.id('button-templates-example');
        var text = $l.web.id('text-templates-example');
        var script = $l.web.id('script-templates-example');

        $l.web.dom.setEvent(
            button,
            'click',
            function() {
                var myModel = { name: { first: 'Jane', last: 'Doe' }, age: 25 };
                var result = $l.templates.apply(script, myModel);
                $l.web.dom.replace(text, result);
                return false;
            }
        );
    });

    // timers - Set
    $l.ready(function() {
        var button = $l.web.id('button-timers-set');
        var text = $l.web.id('text-timers-set');

        $l.web.dom.setEvent(
            button,
            'click',
            function() {
                $l.web.dom.replace(text, 'waiting...' + crlf);
                $l.timers.set({
                    'timeout': 500,
                    'reset': false,
                    'ontick': function() {
                        $l.web.dom.append(text, 'time\'s up');
                    }
                });

                return false;
            }
        );
    });

    // touch - Touch Events
    $l.ready(function() {
        var box = $l.web.id('div-touch-events');
        var target = $l.web.id('target-touch-events');

        $l.web.dom.setEvent(
            box,
            'tap',
            function(event) {
                var createdElement = $l.web.dom.createElement('LI', { }, 'tap');
                target.appendChild(createdElement);
            }
        );

        $l.web.dom.setEvent(
            box,
            'dbltap',
            function(event) {
                var createdElement = $l.web.dom.createElement('LI', { }, 'dbltap');
                target.appendChild(createdElement);
            }
        );

        $l.web.dom.setEvent(
            box,
            'longtap',
            function(event) {
                var createdElement = $l.web.dom.createElement('LI', { }, 'longtap');
                target.appendChild(createdElement);
            }
        );
    });

    // types - Examples
    $l.ready(function() {
        var button = $l.web.id('button-types-example');
        var text = $l.web.id('text-types-example');

        $l.web.dom.setEvent(
            button,
            'click',
            function() {
                var myModel = new $l.types.observable();
                myModel.set('id', 1);
                myModel.setRange({count: 15, name: 'eser'});

                $l.web.dom.clear(text);

                $l.web.dom.append(text, '<div><strong>Element with key \'id\':</strong></div>');
                $l.web.dom.append(text, myModel.get('id') + crlf);

                $l.web.dom.append(text, '<div><strong>Elements with keys \'id\' and \'name\':</strong></div>');
                $l.web.dom.append(text, JSON.stringify(myModel.getRange(['id', 'name'])) + crlf);

                $l.web.dom.append(text, '<div><strong>Keys:</strong></div>');
                $l.web.dom.append(text, JSON.stringify(myModel.keys()) + crlf);

                $l.web.dom.append(text, '<div><strong>Length:</strong></div>');
                $l.web.dom.append(text, JSON.stringify(myModel.length()) + crlf);

                $l.web.dom.append(text, '<div><strong>Check if it has element with key \'name\':</strong></div>');
                $l.web.dom.append(text, JSON.stringify(myModel.exists('name')) + crlf);

                return false;
            }
        );
    });

    // vars - Set / Read / Remove
    $l.ready(function() {
        var text = $l.web.id('text-vars');
        var select = $l.web.id('select-vars');
        var buttonSet = $l.web.id('button-vars-set');
        var buttonRead = $l.web.id('button-vars-read');
        var buttonRemove = $l.web.id('button-vars-remove');

        $l.web.dom.setEvent(
            buttonSet,
            'click',
            function() {
                var storage = select.options[select.selectedIndex].value;
                $l.vars.set(storage, 'demopage', 'a ' + storage + ' test');
                $l.web.dom.append(text, storage + ' set' + crlf);

                return false;
            }
        );

        $l.web.dom.setEvent(
            buttonRead,
            'click',
            function() {
                var storage = select.options[select.selectedIndex].value;
                var value = $l.vars.get(storage, 'demopage');
                if (value !== null) {
                    $l.web.dom.append(text, storage + '\'s value is: ' + value + crlf);
                } else {
                    $l.web.dom.append(text, 'you need to set a ' + storage + ' first' + crlf);
                }

                return false;
            }
        );

        $l.web.dom.setEvent(
            buttonRemove,
            'click',
            function() {
                var storage = select.options[select.selectedIndex].value;
                $l.vars.remove(storage, 'demopage');
                $l.web.dom.append(text, storage + ' is removed' + crlf);

                return false;
            }
        );
    });

})();
