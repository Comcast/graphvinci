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
