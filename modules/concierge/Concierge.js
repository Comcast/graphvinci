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

import Visualizer from "../Visualizer";

export default class Concierge {

    constructor() {
        let self = this;
        this.grenadeKey = "GRENADE";
        this.helperMap = new Map();
    }

    get_stored() {
        let schema = Visualizer.config.get_current_schema();
        if (schema && schema.savedViews) {
            return schema.savedViews;
        }
        return {};
    }

    default_is_override() {
        let stored = this.get_stored();
        let domainSelector = this._get_domain_selector();
        return (stored &&
            stored[domainSelector] &&
            stored[domainSelector][this.grenadeKey] &&
            stored[domainSelector][this.grenadeKey].override);

    }

    clearDefault() {
        let domainSelector = this._get_domain_selector();
        let stored = this.get_stored();
        if (stored &&
            stored[domainSelector] &&
            stored[domainSelector][this.grenadeKey]) {
            delete stored[domainSelector][this.grenadeKey];
            Visualizer.config.save();
            Visualizer.horizontalMenu.build();
        }
    }

    _build(data) {
        for (let entry of data) {
            this.add(entry.name, entry.category, entry);
        }
    }

    get_current_list() {
        let domainSelector = this._get_domain_selector();
        let current = [];
        let stored = this.get_stored();
        if (!stored || !stored[domainSelector]) {
            return current;
        }
        let working = stored[domainSelector];
        for (let category in working) {
            if (category === this.grenadeKey) {
                continue;
            }
            for (let name in working[category]) {
                current.push(working[category][name])
            }
        }
        return current;
    }

    get_current_category_list() {
        let domainSelector = this._get_domain_selector();
        let current = [];
        let stored = this.get_stored();
        if (!stored || !stored[domainSelector]) {
            current.push("demo")
            return current;
        }
        let working = stored[domainSelector];
        for (let category in working) {
            if (category === this.grenadeKey) {
                continue;
            }
            let children = 0;
            for (let name in working[category]) {
                children++;
            }
            if (children > 0) {
                current.push(category);
            }
        }
        if (! current[0]) current.push("demo")
        return current;
    }

    retrieve(name, category) {
        let domainSelector = this._get_domain_selector();
        let stored = this.get_stored();

        if (name === 'ALL' && category === 'DVIEW') {
            if (stored &&
                stored[domainSelector] &&
                stored[domainSelector][this.grenadeKey]) {
                return stored[domainSelector][this.grenadeKey];
            }
            return null;
        }
        let ss = stored[domainSelector][category][name];
        if (stored &&
            stored[domainSelector] &&
            stored[domainSelector][category] &&
            stored[domainSelector][category][name]
        ) {
            return stored[domainSelector][category][name];
        }
        return null;
    }

    save(name, category, posData) {
        this._store(name, category, posData);
    }

    save_default(posData, override) {
        posData.override = override;
        this._store(this.grenadeKey, undefined, posData);
        Visualizer.horizontalMenu.build();
    }

    remove(name, category) {
        let domainSelector = this._get_domain_selector();
        let stored = this.get_stored();
        if (!(domainSelector in stored)) {
            return;
        }
        if (category && !(category in stored[domainSelector])) {
            return;
        }
        let empty = true;
        let newCat = {};
        let working = stored[domainSelector][category];
        for (let customViewName in working) {
            if (customViewName === name) {
                continue;
            } else {
                empty = false;
                newCat[customViewName] = working[customViewName];
            }
        }
        stored[domainSelector][category] = newCat;
        Visualizer.config.save();
    }

    _store(name, category, posData) {
        let domainSelector = this._get_domain_selector();
        let stored = this.get_stored();
        // Store by URL, and then by domain selection, and finally category.  I wish JS supported autovivification
        if (! stored) {
            stored = {};
        }
        if (!(domainSelector in stored)) {
            stored[domainSelector] = {};
        }
        if (category) {
            if (!(category in stored[domainSelector])) {
                stored[domainSelector][category] = {};
            }
            stored[domainSelector][category][name] = posData;
        } else {
            stored[domainSelector][name] = posData;
        }
        Visualizer.config.get_current_schema().savedViews = stored;
        Visualizer.config.save();
    }

    _get_domain_selector() {
        return "CMT"; // Hard coded for now
    }

}
