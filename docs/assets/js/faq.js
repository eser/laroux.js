(function() {
    'use strict';

    $l.ready(function() {
        var source = $l.web.id('markdown-text');
        var target = $l.web.id('markdown-render-target');
        $l.web.dom.append(target, marked(source.textContent));
    });

})();
