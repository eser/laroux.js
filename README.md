# laroux.js

[This project](https://github.com/larukedi/laroux.js/) is a jquery substitute for modern browsers.

[![Build Status](https://travis-ci.org/larukedi/laroux.js.png?branch=master)](https://travis-ci.org/larukedi/laroux.js)
[![Scrutinizer Quality Score](https://scrutinizer-ci.com/g/larukedi/laroux.js/badges/quality-score.png?s=0a36236d23cac2919f7aafff510a636d9437abec)](https://scrutinizer-ci.com/g/larukedi/laroux.js/)


## Documentation

See [wiki page](https://github.com/larukedi/laroux.js/wiki) for documentation.


## Installation
Download [laroux.min.js](https://github.com/larukedi/laroux.js/blob/master/dist/laroux.min.js) and [laroux.min.css](https://github.com/larukedi/laroux.js/blob/master/dist/laroux.min.css) and include them in your web project.


## Sample Usage

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


## Dev Installation

**Alternative 1: Zip Package**

Download [the package](https://github.com/larukedi/laroux.js/archive/master.zip) and launch `npm install`.

**Alternative 2: Git**

On Terminal or Command Prompt:
``` bash
git clone https://github.com/larukedi/laroux.js project
cd project
npm install
```


## Dev Requirements

* NPM (https://npmjs.org)
* Grunt (http://gruntjs.com)


## License

See [LICENSE](LICENSE)


## Contributing

It is publicly open for any contribution. Bugfixes and suggestions are welcome.

* Fork the repo, push your changes to your fork, and submit a pull request.
* If something does not work, please report it using GitHub issues.
