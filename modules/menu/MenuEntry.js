
/*
JavaScript behaving like Java.  What could go wrong?  This is basically an abstract class that cannot
be instantiated directly, and sets various required fields/methods that a menuentry must have
 */
export default class MenuEntry {
    constructor(width, height) {
        this.elementWidth = width;
        this.elementHeight = height;
        this.scale = 1;

        if (this.constructor === MenuEntry) {
            throw new TypeError('Abstract class "MenuEntry" cannot be instantiated directly.');
        }

    }

    /*
    This is pointless I think - easier to just use instanceof
     */
    get className() {
        throw new TypeError('Classes extending the MenuEntry abstract class must have a className');
    }

    scale(scaleFactor) {
        this.scale = scaleFactor;
    }

    get width() {
        return this.elementWidth;
    }

    get scaledWidth() {
        return this.scale * this.elementWidth;
    }

    get height() {
        return this.elementHeight;
    }

    get scaledHeight() {
        return this.scale * this.elementHeight;
    }
}