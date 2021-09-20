export default class InputTree {
    constructor() {
        this.dataSet = [];
        this.ids = new Set();
    }

    add(element) {
        this.dataSet.push(element);
        this.ids.add(element.id)
    }

    get_id(id, count) {
        if (typeof(count) === 'undefined' || count === null) {
            count = 0;
        }
        if (! this.ids.has(id)) {
            return id;
        }
        else {
            count++;
            return this.get_id(id, count)
        }
    }
}

