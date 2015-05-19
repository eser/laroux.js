class Laroux {
    hello() {
        console.log('hello back');
    }
}

var laroux = new Laroux();
/* @if ENV=='web' */
global.$l = laroux;
/* @endif */
export default laroux;
