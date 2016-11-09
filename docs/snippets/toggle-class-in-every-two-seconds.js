// replace the 'target-element' with your target element's id
var target = $l.web.id('target-element');

// set the class name
var className = 'in';

// set the delay
var delay = 200;

$l.timers.set({
    'timeout': delay,
    'reset': true,
    'ontick': function() {
        $l.web.css.toggleClass(target, className);
    }
});