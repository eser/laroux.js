(function() {
    'use strict';

    var crlf = '<br />';

    var snippetList = $l.web.id('snippet-list');
    var snippetDescription = $l.web.id('snippet-description');
    var snippetArea = $l.web.id('snippet-area');
    var checkboxExecSnippetOnLoad = $l.web.id('checkbox-exec-snippet-on-load');
    var lastLoaded = null;

    function drawSnippet() {
        $l.web.dom.clear(snippetArea);

        if (lastLoaded === null) {
            return;
        }

        var code;

        if (checkboxExecSnippetOnLoad.checked) {
            var splitted = lastLoaded.split('\n')

            code = '$l.ready(function() {\n\n';
            for (var item in splitted) {
                code += $l.quoteAttr(('    ' + splitted[item]).replace(/~+$/, '')) + '\n';
            }
            code += '\n});';
        } else {
            code = $l.quoteAttr(lastLoaded);
        }

        var pre = $l.web.dom.createElement('PRE', { class: 'prettyprint' }, code);
        snippetArea.appendChild(pre);

        prettyPrint();

        $l.web.css.addClass(snippetArea, 'in');
    }

    function loadSnippet(ev, element) {
        $l.web.css.removeClass(snippetArea, 'in');

        $l.web.css.removeClass($l(['li'], snippetList), 'active');
        $l.web.css.addClass(element.parentElement, 'active');

        $l.web.dom.replace(
            $l('div', snippetDescription),
            element.getAttribute('title')
        );
        $l.web.css.addClass(snippetDescription, 'in');

        $l.ajax.get(
            'snippets/' + element.getAttribute('data-file')
        ).done(function (response) {
            lastLoaded = response;
            drawSnippet();
        });

        return false;
    }

    $l.ready(function() {
        prettyPrint();

        $l.web.dom.setEvent(checkboxExecSnippetOnLoad, 'change', drawSnippet);

        $l.ajax.getJson(
            'snippets.json'
        ).done(function (response) {
            for (var item in response) {
                if (typeof response[item].onload != 'undefined' && response[item].onload) {
                    checkboxExecSnippetOnLoad.removeAttribute('disabled');
                } else {
                    checkboxExecSnippetOnLoad.setAttribute('disabled', 'disabled');
                }

                var li = $l.web.dom.createElement('LI');
                snippetList.appendChild(li);

                var a = $l.web.dom.createElement(
                    'A',
                    {
                        href:          'javascript:;',
                        'data-file':   response[item].file,
                        title:         response[item].description
                    },
                    response[item].name
                );

                $l.web.dom.setEvent(a, 'click', loadSnippet);
                li.appendChild(a);
            }
        });
    });
})();
