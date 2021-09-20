import InputEnumVisManager from "../manager/InputEnumVisManager";

export default class SchemaEnum {
    constructor(id, enumEntity, parent, domain) {
        this.id = id;
        this.enum = enumEntity;
        this.parent = parent;
        this.domain = domain;
        this.nvm = new InputEnumVisManager(this);
    }
}