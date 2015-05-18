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

                ).then(function (response) {
                    $l.dom.replace(text, response.testResponse);

                }).on('error', function (error) {
                    $l.dom.replace(text, 'Error: ' + error.message);

                }).start();

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
                }).start();

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
                }).start();

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

                $l.dom.append(text, '<div><strong>Merging two arrays:</strong></div>');
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
                    fnc: function() {
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
        var myModel = new $l.stack({
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
        var myModel = new $l.stack({
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
        var myModel = new $l.stack({
            text: 'initial'
        });

        $l.mvc.init('mvctwoway', myModel);
    });

    // stack - Examples
    $l.ready(function() {
        var button = $l.id('button-stack-example');
        var text = $l.id('text-stack-example');

        $l.dom.setEvent(
            button,
            'click',
            function() {
                var stack = new $l.stack();
                stack.set('id', 1);
                stack.setRange({count: 15, name: 'eser'});

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
                $l.dom.append(text, JSON.stringify(stack._data) + crlf);

                return false;
            }
        );
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
                var model = { name: { first: 'Jane', last: 'Doe' }, age: 25 };
                $l.templates.replace(script, model, text);
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

    // triggers - Set
    $l.ready(function() {
        var button1 = $l.id('button-triggers-set-1');
        var button2 = $l.id('button-triggers-set-2');
        var buttonReset = $l.id('button-triggers-set-reset');
        var text = $l.id('text-triggers-set');

        $l.dom.append(text, 'click both buttons in any order' + crlf);

        var resetFunc = function() {
            // $l.triggers.set(
            //     ['condition1', 'condition2'],
            //     function() {
            //         $l.dom.append(text, 'all set' + crlf);
            //         $l.dom.attr(buttonReset, 'disabled', null);
            //     }
            // );

            $l.dom.attr(buttonReset, 'disabled', 'disabled');
        };
        resetFunc();

        $l.dom.setEvent(
            button1,
            'click',
            function() {
                $l.dom.append(text, 'button1 clicked...' + crlf);
                $l.triggers.ontrigger('condition1');

                return false;
            }
        );

        $l.dom.setEvent(
            button2,
            'click',
            function() {
                $l.dom.append(text, 'button2 clicked...' + crlf);
                $l.triggers.ontrigger('condition2');

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

    // vars - Cookie
    $l.ready(function() {
        var text = $l.id('text-vars-cookies');
        var buttonSet = $l.id('button-vars-cookies-set');
        var buttonRead = $l.id('button-vars-cookies-read');
        var buttonRemove = $l.id('button-vars-cookies-remove');

        $l.dom.setEvent(
            buttonSet,
            'click',
            function() {
                $l.vars.setCookie('demopage', 'a cookie test');
                $l.dom.append(text, 'cookie set' + crlf);

                return false;
            }
        );

        $l.dom.setEvent(
            buttonRead,
            'click',
            function() {
                var value = $l.vars.getCookie('demopage');
                if (value !== null) {
                    $l.dom.append(text, 'cookie\'s value is: ' + value + crlf);
                } else {
                    $l.dom.append(text, 'you need to set a cookie first' + crlf);
                }

                return false;
            }
        );

        $l.dom.setEvent(
            buttonRemove,
            'click',
            function() {
                $l.vars.removeCookie('demopage');
                $l.dom.append(text, 'cookie is removed' + crlf);

                return false;
            }
        );
    });

    // vars - Local Storage
    $l.ready(function() {
        var text = $l.id('text-vars-local');
        var buttonSet = $l.id('button-vars-local-set');
        var buttonRead = $l.id('button-vars-local-read');
        var buttonRemove = $l.id('button-vars-local-remove');

        $l.dom.setEvent(
            buttonSet,
            'click',
            function() {
                $l.vars.setLocal('demopage', 'a local storage test');
                $l.dom.append(text, 'local storage variable set' + crlf);

                return false;
            }
        );

        $l.dom.setEvent(
            buttonRead,
            'click',
            function() {
                var value = $l.vars.getLocal('demopage');
                if (value !== null) {
                    $l.dom.append(text, 'local storage variable\'s value is: ' + value + crlf);
                } else {
                    $l.dom.append(text, 'you need to set a local storage variable first' + crlf);
                }

                return false;
            }
        );

        $l.dom.setEvent(
            buttonRemove,
            'click',
            function() {
                $l.vars.removeLocal('demopage');
                $l.dom.append(text, 'local storage variable is removed' + crlf);

                return false;
            }
        );
    });

    // vars - Session Storage
    $l.ready(function() {
        var text = $l.id('text-vars-session');
        var buttonSet = $l.id('button-vars-session-set');
        var buttonRead = $l.id('button-vars-session-read');
        var buttonRemove = $l.id('button-vars-session-remove');

        $l.dom.setEvent(
            buttonSet,
            'click',
            function() {
                $l.vars.setSession('demopage', 'a session storage test');
                $l.dom.append(text, 'session storage variable set' + crlf);

                return false;
            }
        );

        $l.dom.setEvent(
            buttonRead,
            'click',
            function() {
                var value = $l.vars.getSession('demopage');
                if (value !== null) {
                    $l.dom.append(text, 'session storage variable\'s value is: ' + value + crlf);
                } else {
                    $l.dom.append(text, 'you need to set a session storage variable first' + crlf);
                }

                return false;
            }
        );

        $l.dom.setEvent(
            buttonRemove,
            'click',
            function() {
                $l.vars.removeSession('demopage');
                $l.dom.append(text, 'session storage variable is removed' + crlf);

                return false;
            }
        );
    });

})();
