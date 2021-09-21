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

import DomainAwareEntity from "./DomainAwareEntity.js";
import Visualizer from "../Visualizer";

export default class SchemaField extends DomainAwareEntity {
    constructor(field, enumMap, parentName, parentDomain) {
        super(Visualizer.domain_meta_manager.parse_field_metadata(field, parentName, parentDomain));
        this.parentName = parentName;
        this.enumMap = enumMap;
        this.rootKind = "UNKNOWN";
        this.rootName = "UNKNOWN";
        this.name = "UNKNOWN";
        this.hasArgs = false;
        this.isInterface = false;
        this.isUnion = false;
        this._get_field_type(field);
    }

    get args() {
        return this.source.args;
    }

    set_interface() {
        this.isInterface = true;
    }

    set_union() {
        this.isUnion = true;
    }

    set_enum(enumObj) {
        this.rootEnum = enumObj;
    }

    get has_input() {
        return this.hasArgs;
    }

    add_inputs(inputMap) {
        this.inputMap = inputMap;
        this.hasArgs = true;
    }

    _get_field_type(field) {
        this.source = field;
        this.name = field.name;
        this.rootName = field.name;
        if (!("type" in field) ||!(typeof(field.type) === "object")) return;
        if (!("kind" in field.type)) return;
        return this._recursive_typer(field.type);
    }

    _recursive_typer(type) {
        if ("ofType" in type && type.ofType !== null) {
            return this._recursive_typer(type.ofType);
        }
        else {
            this.rootKind = type.kind;
            this.rootName = type.name;
        }
    }

    get definition() {
        let iType = this.source.type;
        return this._recursive_def(iType);
    }

    _recursive_def(type) {
        if (typeof(type) === 'undefined') return "";
        if (typeof(type.ofType) === 'undefined' || type.ofType == null) return type.name;
        switch(type.kind) {
            case "NON_NULL":
                return this._recursive_def(type.ofType) + "!";
                break;
            case "LIST":
                return "[" + this._recursive_def(type.ofType) + "]";
                break;
        }
    }
}
