// replace the 'target-element' with your target element's id
var target = $l.web.id('target-element');

// set the class name
var className = 'in';

// set the delay
var delay = 500;

$l.timers.set({
    'timeout': delay,
    'reset': false,
    'ontick': function() {
        $l.web.css.removeClass(target, className);
    }
});