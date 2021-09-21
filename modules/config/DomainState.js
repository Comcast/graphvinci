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

import Visualizer from "../Visualizer.js";


export const states = {
    MINIMIZED: 0,
    NODES: 1,
    EXPANDED: 2,
    REMOVED: 3
};

export default class DomainState {
    constructor(schema) {
        this.schema = schema;
        this.reset();

    }

    /*
    Gets the signature for what is currently visible.  Really wish JS had some in-built hashing
     */
    get_key() {
        let visible = [];
        for (let domain of this.domains.keys()) {
            if (this.get_domain_state(domain) !== states.REMOVED) {
                visible.push(domain);
            }
        }
        return visible.sort().join("-").toUpperCase();
    }

    clear_excluded_nodes() {
        this.excludeNodes = new Set();
    }

    include_node(id) {
        this.excludeNodes.delete(id);
    }

    remove_domain_excluded_nodes(domain) {
        let count = 0;
        for (let node of this.excludeNodes) {
            if (Visualizer.schema.get_node_domain(node) === domain) {
                this.excludeNodes.delete(node);
                count++;
            }
        }
        return count;
    }

    exclude_node(id) {
        this.excludeNodes.add(id);
    }

    cycle_domain(domain) {
        let state = this.domains.get(domain);
        let newVal = (state >= Object.keys(states).length - 1) ? 0 : ++state;
        this.set_domain_state(domain, newVal);
        return newVal;
    }

    get domain_list() {
        return Array.from( this.domains.keys() );
    }

    get_domain_state(domain) {
        return this.domains.get(domain);
    }

    set_domain_state(domain, state, menusOnly) {
        let currentState = this.domains.get(domain);
        let readdCount = this.remove_domain_excluded_nodes(domain);
        if (readdCount === 0 && currentState === state) return;
        if (menusOnly) {
            this.domains.set(domain, state);
            this._menus_only_update();
            return;
        }
        if ((currentState === states.EXPANDED || currentState === states.NODES)
            && (state === states.EXPANDED || state === states.NODES)) {
            let exState = (state === states.EXPANDED);
            this.domains.set(domain, state);
            if (readdCount > 0) {
                this._noisy_update(domain, exState);
            }
            else {
                this._quiet_update(domain, exState);
            }
        }
        else {
            let exState = (state === states.EXPANDED);
            this.domains.set(domain, state);
            this._noisy_update(domain, exState);
        }
    }

    _menus_only_update() {
        Visualizer.graph.verticalMenu.update_state();
        Visualizer.horizontalMenu.update_state();
    }

    _quiet_update(domain, state) {
        Visualizer.graph.re_parent();
        Visualizer.set_domain_expansion(domain, state);
        Visualizer.graph.verticalMenu.update_state();
        Visualizer.horizontalMenu.update_state();
        Visualizer.graph.kick();
    }

    _noisy_update(domain, state) {
        Visualizer.graph.re_parent();
        Visualizer.graph.update_viz();
        Visualizer.graph.verticalMenu.update_state();
        Visualizer.horizontalMenu.update_state();
        Visualizer.set_domain_expansion(domain, state);
    }

    reset() {
        this.excludeNodes = new Set();
        this.domains = new Map();
        this._init_domains(this.schema.domains);
    }

    is_node_excluded(node) {
        if (this.excludeNodes.has(node.id)) return true;
        switch (node.type) {
            case "Domain":
                return !(this.domains.get(node.name) === states.MINIMIZED);
            default:
                let state = this.domains.get(node.domain);
                if (state === states.NODES) return false;
                if (state === states.EXPANDED) return false;
                return true;
        }
    }

    _init_domains(domains) {
        for (let domain of domains) {
            this.domains.set(domain, states.MINIMIZED);
        }
    }
}
