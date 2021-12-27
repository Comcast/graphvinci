/*
 * Copyright 2018 The GraphVinci Authors
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

import ResultNodeVisManager from "../manager/ResultNodeVisManager";
import noDomain from "../config/DomainMetaManager"

export default class ResultNode {
    constructor(name, schemaNode) {
        this.name = name;
        this.schemaNode = schemaNode;
        this.links = [];
        this.properties = [];
        this.properties = [];
        this.nvm = new ResultNodeVisManager(this);
    }

    add_link(name, id) {
        let domain = this.schemaNode.domain || noDomain;
        let field = this.schemaNode.fields.get(name);
        if (field) {
            domain = field.domain;
        }
        this.links.push(new ResultLink(name, id, domain));
    }

    add_property(fieldName, value) {
        let domain = this.schemaNode.domain || noDomain;
        let field = this.schemaNode.fields.get(name);
        if (field) {
            domain = field.domain;
        }
        this.properties.push(new ResultProperty(fieldName, value, domain));
    }

    get id() {
        return this.name;
    }

    get domain() {
        return this.schemaNode.domain;
    }

    static clone(from, newName) {
        let newNode = new ResultNode(newName, from.schemaNode);
        newNode.links = from.links;
        newNode.properties = from.properties;
        newNode.treeParent = from.treeParent;
        return newNode;
    }
}

class ResultLink {
    constructor(name, id, domain) {
        this.rootKind = "LINK";
        this.domain = domain;
        this.name = name;
        this.id = id;
    }
}

class ResultProperty {
    constructor(name, value, domain) {
        this.rootKind = "PROPERTY";
        this.name = name;
        this.value = value;
        this.domain = domain;
    }

    /*
    Not great hack so that I can use the same ClassNodeSizer for everything
     */
    get definition() {
        return this.value;
    }
}