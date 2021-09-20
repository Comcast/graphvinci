export default class SchemaInput {
    constructor(nodeObj, enumMap) {
        this.type = "InputObject";
        this.source = nodeObj;
        this.enumMap = enumMap;
    }

    get id() {
        return this.source.name;
    }

    get fields() {
        return this.source.inputFields;
    }
}