import InputObjectVisManager from "../manager/InputObjectVisManager";

export default class SchemaInputObject {
    constructor(id, parent, domain) {
        this._id = id;
        this.fields = [];
        this.parent = parent;
        this.domain = domain;
        this.nvm = new InputObjectVisManager(this);
    }

    get id() {
        return this._id;
    }

    add_field(field) {
        this.fields.push(field);
    }
}