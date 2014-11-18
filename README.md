# laroux.js

[![laroux.js logo](https://larukedi.github.io/laroux.js/assets/images/logo-medium.png)](https://larukedi.github.io/laroux.js/)

[This project](https://github.com/larukedi/laroux.js) is a jquery substitute for modern browsers. But instead of offering some wrappers and own dynamics, it simply provides helper functions to achieve the same objectives with jquery or zepto.

Even though keeping compactness is the primary concern of this library, lightweight versions of some concepts/components including some UI helpers and MVC.

So far, it has [Ajax](https://github.com/larukedi/laroux.js/wiki/ajax), [Anim](https://github.com/larukedi/laroux.js/wiki/anim), [CSS](https://github.com/larukedi/laroux.js/wiki/css), [Date](https://github.com/larukedi/laroux.js/wiki/date), [DOM](https://github.com/larukedi/laroux.js/wiki/dom), [Events](https://github.com/larukedi/laroux.js/wiki/events), [Forms](https://github.com/larukedi/laroux.js/wiki/forms), [Helpers](https://github.com/larukedi/laroux.js/wiki/helpers), [MVC](https://github.com/larukedi/laroux.js/wiki/mvc), [Stack](https://github.com/larukedi/laroux.js/wiki/stack), [Templates](https://github.com/larukedi/laroux.js/wiki/templates), [Timers](https://github.com/larukedi/laroux.js/wiki/timers), [Triggers](https://github.com/larukedi/laroux.js/wiki/triggers), [UI](https://github.com/larukedi/laroux.js/wiki/ui) and [Vars](https://github.com/larukedi/laroux.js/wiki/vars) components.


[![Build Status](https://travis-ci.org/larukedi/laroux.js.png?branch=master)](https://travis-ci.org/larukedi/laroux.js)
[![Scrutinizer Quality Score](https://scrutinizer-ci.com/g/larukedi/laroux.js/badges/quality-score.png?s=0a36236d23cac2919f7aafff510a636d9437abec)](https://scrutinizer-ci.com/g/larukedi/laroux.js/)


## For Users

`laroux.js` is right for you if you:

- Complain people who do not know the difference between jQuery and Javascript.
- Love working with more compact, organized libraries in smaller sizes (26K).
- Want working with native DOM objects instead of wrappers.
- Get pace with debug console's autocomplete/fluent typing.

### Demos

See [GitHub Page](https://larukedi.github.io/laroux.js/) for feature demonstrations and benchmarks.


### Documentation

See [wiki page](https://github.com/larukedi/laroux.js/wiki) for documentation.


### Installation
Download the latest version for [releases page](https://github.com/larukedi/laroux.js/releases), and include `laroux.min.js` and `laroux.min.css` in your web project.


### Sample Usage

```js

$l.ready(function() {
    var buttons = $l(['.confirm-action']);

    $l.css.setProperty(buttons, 'background-color', 'crimson');
    $l.dom.setEvent(
        buttons,
        'click',
        function(event, element) {
            if (!confirm('Are you sure to do it?')) {
                return false; // cancel event
            }
        }
    );
});
```


## For Developers Want To Contribute

### Installation

**Alternative 1: Zip Package**

Download [the package](https://github.com/larukedi/laroux.js/archive/master.zip) and launch `npm install`.

**Alternative 2: Git**

On Terminal or Command Prompt:
``` bash
git clone https://github.com/larukedi/laroux.js project
cd project
npm install
```


### Requirements

* NPM (https://npmjs.org)
* Grunt (http://gruntjs.com)


## License

See [LICENSE](LICENSE)


## Thanks to

- Burak 'burky' Babir
- Sevket Bulamaz
- Yalcin Ceylan


## Contributing

It is publicly open for any contribution. Bugfixes and suggestions are welcome.

* Fork the repo, push your changes to your fork, and submit a pull request.
* If something does not work, please report it using GitHub issues.
