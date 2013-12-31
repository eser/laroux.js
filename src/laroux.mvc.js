(function(laroux) {
    "use strict";

    // mvc
    laroux.mvc = {
        bindings: [],

        init: function() {
            var apps = laroux.dom.select('*[lr-app]');
            for (var app in apps) {
                laroux.mvc.bindings.push([apps[app].getAttribute('lr-app'), apps[app]]);
            }

            // console.log(laroux.mvc.bindings);
        },

        update: function() {
            for (var binding in laroux.mvc.bindings) {
                var selectedBinding = laroux.mvc.bindings[binding];

                laroux.mvc.updateElement(selectedBinding[1], window[selectedBinding[0]]);
            }
        },

        updateElement: function(element, controller) {
            var scope = {};
            controller(scope);

            // element.textContent = scope.hello;

            console.log(scope);
        }

    };

    laroux.ready(laroux.mvc.init);

})(this.laroux);
