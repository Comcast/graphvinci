import DomainVisManager from '../manager/DomainVisManager.js';
import Node from "./Node.js";

export default class SchemaDomain extends Node {
    constructor(name) {
        super("Domain", name);
        this.nvm = new DomainVisManager(this);
    }

    get id() {
        return "Domain" + this.domain;
    }

    get name() {
        return this.domain;
    }

    get_edges(nodeMap, domainMap) {
        /*
        Edges are actually built between domains by the other nodes and the "parent" property
         */
        return [];
    };

}