(function() {
    'use strict';

    var crlf = '<br />';

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
                code += ('    ' + splitted[item]).replace(/~+$/, '') + '\n';
            }
            code += '\n});';
        } else {
            code = lastLoaded;
        }

        var pre = $l.dom.createElement('PRE', { class: 'prettyprint' }, code);
        snippetArea.appendChild(pre);

        prettyPrint();
    }

    function loadSnippet(ev, element) {
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
        var snippetList = $l.id('snippet-list');

        $l.dom.setEvent(checkboxExecSnippetOnLoad, 'change', drawSnippet);

        $l.ajax.getJson(
            'snippets.json',
            null,
            function(response) {
                for (var item in response) {
                    var li = $l.dom.createElement('LI');
                    snippetList.appendChild(li);

                    var a = $l.dom.createElement('A', { 'href': 'javascript:;', 'data-file': response[item].file }, response[item].name);
                    $l.dom.setEvent(a, 'click', loadSnippet);
                    li.appendChild(a);
                }
            }
        );
    });
})();
