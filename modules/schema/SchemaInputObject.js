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

import InputObjectVisManager from "../manager/InputObjectVisManager";

export default class SchemaInputObject {
    constructor(id, parent, domain) {
        this._id = id;
        this.fields = [];
        this.parent = parent;
        this.domain = domain;
        this.nvm = new InputObjectVisManager(this);
    }

    get id() {
        return this._id;
    }

    add_field(field) {
        this.fields.push(field);
    }
}
