(function() {
    'use strict';

    $l.ready(function() {
        var source = $l.id('markdown-text');
        var target = $l.id('markdown-render-target');
        $l.dom.append(target, marked(source.textContent));
    });

})();
