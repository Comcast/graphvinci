import DomainAwareEntity from "./DomainAwareEntity.js";

export default class Node extends DomainAwareEntity {
    constructor(type, domain) {
        super(domain);
        this._type = (typeof(type) === 'undefined') ? "Entity" : type;

        if (this.constructor === Node) {
            throw new TypeError('Abstract class "Node" cannot be instantiated directly.');
        }
    }

    get_edges() {
        throw new TypeError('Classes extending the Node abstract class must have a get_edges method');
    };

    get id() {
        throw new TypeError('Classes extending the Node abstract class must have an id property');
    };

    get name() {
        throw new TypeError('Classes extending the Node abstract class must have a name property');
    };
    get type() {
        return this._type;
    };

    set_parent(parent) {
        this.parent = parent;
    }

}