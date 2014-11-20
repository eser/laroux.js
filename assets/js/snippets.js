(function() {
    'use strict';

    var crlf = '<br />';

    var snippetList = $l.id('snippet-list');
    var snippetDescription = $l.id('snippet-description');
    var snippetArea = $l.id('snippet-area');
    var checkboxExecSnippetOnLoad = $l.id('checkbox-exec-snippet-on-load');
    var lastLoaded = null;

    function drawSnippet() {
        $l.dom.clear(snippetArea);

        if (lastLoaded === null) {
            return;
        }

        var code;

        if (checkboxExecSnippetOnLoad.checked) {
            var splitted = lastLoaded.split('\n')

            code = '$l.ready(function() {\n\n';
            for (var item in splitted) {
                code += $l.helpers.quoteAttr(('    ' + splitted[item]).replace(/~+$/, '')) + '\n';
            }
            code += '\n});';
        } else {
            code = $l.helpers.quoteAttr(lastLoaded);
        }

        var pre = $l.dom.createElement('PRE', { class: 'prettyprint' }, code);
        snippetArea.appendChild(pre);

        prettyPrint();

        $l.css.addClass(snippetArea, 'in');
    }

    function loadSnippet(ev, element) {
        $l.css.removeClass($l(['li'], snippetList), 'active');
        $l.css.addClass(element.parentElement, 'active');

        $l.dom.replace(
            $l('div', snippetDescription),
            element.getAttribute('title')
        );
        $l.css.addClass(snippetDescription, 'in');

        $l.ajax.get(
            'snippets/' + element.getAttribute('data-file'),
            null,
            function(response) {
                lastLoaded = response;
                drawSnippet();
            }
        );

        return false;
    }

    $l.ready(function() {
        $l.dom.setEvent(checkboxExecSnippetOnLoad, 'change', drawSnippet);

        $l.ajax.getJson(
            'snippets.json',
            null,
            function(response) {
                for (var item in response) {
                    if (typeof response[item].onload != 'undefined' && response[item].onload) {
                        checkboxExecSnippetOnLoad.removeAttribute('disabled');
                    } else {
                        checkboxExecSnippetOnLoad.setAttribute('disabled', 'disabled');
                    }

                    var li = $l.dom.createElement('LI');
                    snippetList.appendChild(li);

                    var a = $l.dom.createElement(
                        'A',
                        {
                            href:          'javascript:;',
                            'data-file':   response[item].file,
                            title:         response[item].description
                        },
                        response[item].name
                    );

                    $l.dom.setEvent(a, 'click', loadSnippet);
                    li.appendChild(a);
                }
            }
        );
    });
})();
