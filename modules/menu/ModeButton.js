import MenuEntry from './MenuEntry.js';

export default class ModeButton extends MenuEntry {
    constructor(width, height, type, img, imgText, func) {
        super(width, height);
        this.clazz = "modeButton";
        this.type = type;
        this.img = img;
        this.alt = imgText;
        this.func = func;
    }

    get className() {
        return this.clazz;
    }

}