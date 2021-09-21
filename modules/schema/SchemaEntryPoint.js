/*
 * Copyright 2018 The GraphVini Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import SchemaEdge from './SchemaEdge.js';
import EntryPointVisManager from '../manager/EntryPointVisManager.js';
import Node from "./Node.js";

export default class SchemaEntryPoint extends Node {
    constructor(schemaField, inputMap, type, domain) {
        super(type, domain);
        this._name = type + " - " + schemaField.name;
        this.linkCount = 0;
        this.schemaField = schemaField;
        this.inputMap = inputMap;
        this.nvm = new EntryPointVisManager(this);
        this.fields = new Map();
        this.fields.set(this.schemaField.name, schemaField);
    }

    fix() {
        this.fx = this.x;
        this.fy = this.y;
    }

    unfix() {
        delete this.fx;
        delete this.fx;
    }

    get id() {
        return this._name;
    }

    get name() {
        return this.id;
    }

    get trueName() {
        return this.schemaField.name;
    }

    get fieldKeys() {
        return this.fields.keys();
    }

    get_edges(nodeMap) {
        let deDup = new Set();
        let edges = [];
            if (this.schemaField.rootKind === "OBJECT" || this.schemaField.rootKind === "INTERFACE" || this.schemaField.rootKind === "UNION") {
                edges.push(new SchemaEdge(this.schemaField, this, nodeMap.get(this.schemaField.rootName), this.schemaField.domain));
                /*
                Add a domain to domain edge
                 */
                let domainSource = this.parent;
                let domainTarget = nodeMap.get(this.schemaField.rootName).parent;
                if (domainSource !== domainTarget) {
                    let identifier = "From" + domainSource.id + "To" + domainTarget.id;
                    if (!deDup.has(identifier)) {
                        deDup.add(identifier);
                        edges.push(new SchemaEdge(this.schemaField, domainSource, domainTarget, this.domain));
                    }
                }
                /*
                Add the Entity to domain edge, and the reverse
                 */
                edges.push(new SchemaEdge(this.schemaField, this, domainTarget, this.schemaField.domain));
                edges.push(new SchemaEdge(this.schemaField, domainSource, nodeMap.get(this.schemaField.rootName), this.schemaField.domain));
            }

        return edges;
    };

    set_property_mask(propMask) {
        this.propertyMask = propMask;
    }

    _is_present(value) {
        if (typeof(value) === 'undefined') return false;
        if (value == null) return false;
        if (Array.isArray(value) && value.length == 0) {
            return false;
        }
        return true;
    }
}
