var laroux = require('../build/dist/base/laroux.js');

laroux.extendNs(laroux, 'hello', {
    world: function () {
        console.log('hello back');
    }
});

laroux.hello.world();
