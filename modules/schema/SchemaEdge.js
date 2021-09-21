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
