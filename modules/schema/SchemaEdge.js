import DomainAwareEntity from "./DomainAwareEntity.js";

export default class SchemaEdge extends DomainAwareEntity {
    constructor(fieldObj, nodeFrom, nodeTo, domain) {
        super();
        this.fieldSource = fieldObj;
        this.nodeFrom = nodeFrom;
        this.nodeTo = nodeTo;
        this.domainName = domain;
    }

    static clone(from) {
        return new SchemaEdge(from.fieldSource, from.nodeFrom, from.nodeTo, from.domainName);
    }

    get domain() {
        return this.domainName;
    }

    get source() {
        return this.nodeFrom;
    }

    get target() {
        return this.nodeTo;
    }

    /*
    This is necessary for the indexing of the d3 data, so that adding and removing edges doesn't happen randomly
    according to the array index value
     */
    get id() {
        return this.nodeFrom.id + this.fieldSource.name + this.nodeTo.id;
    }
}