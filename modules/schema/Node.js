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
