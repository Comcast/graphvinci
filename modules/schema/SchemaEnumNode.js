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

import SchemaField from './SchemaField.js';
import Node from "./Node.js";
import EnmVisManager from "../manager/EnmVisManager";

export default class SchemaEnumNode extends Node {
    constructor(enumObj, domain) {
        super("Entity", domain);
        this.source = enumObj;
        this.enum = enumObj;
        this.nvm = new EnmVisManager(this);
        this.fields = new Map();
        this.superType = "ENUM";
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
        return this.source.name;
    }

    get name() {
        return this.source.name;
    }

    get trueName() {
        return this.source.name;
    }

    get fieldKeys() {
        return [];
    }

    get_edges(nodeMap) {
        return [];
    };

    set_property_mask(propMask) {
        this.propertyMask = propMask;
    }

    add_field(field) {
        this.fields.set(field.name, field);
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
