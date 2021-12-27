import {noDomain} from "../Constants";

export default class MetaMerger {
    constructor(nodes) {
        this.organizer = {};
        for (let node of nodes) {
            this._merge_node(node);
        }
    }

    _merge_node(node) {
        this._merge_domain_info(node.domainInfo);
        for (let fieldName of node.fieldKeys) {
            if (! node.propertyMask || ! node.propertyMask.has(fieldName)) {
                continue;
            }
            this._merge_domain_info(node.fields.get(fieldName).domainInfo);
        }
    }

    _merge_domain_info(domainInfo) {
        for (let category in domainInfo) {
            if (category === 'default') continue;
            this._merge_string(category, domainInfo[category]);
        }
    }

    _merge_string(category, data) {
        for (let entityString of data.split(" ")) {
            if (entityString === noDomain) continue;
            if (! this.organizer[category]) {
                this.organizer[category] = new Set();
            }
            this.organizer[category].add(entityString);
        }
    }
}
