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

import SchemaNode from './SchemaNode.js';
import SchemaInput from './SchemaInput.js';
import SchemaDomain from './SchemaDomain.js';
import {states} from '../config/DomainState.js';
import SchemaEntryPoint from "./SchemaEntryPoint";
import { noDomain } from '../Constants'
import SchemaField from "./SchemaField";
import domainMetaManager from '../config/DomainMetaManager';
import SchemaEnumNode from "./SchemaEnumNode";

const SCHEMANAME = "__schema";
const DATANAME = "data";
const TYPESNAME = "types";

export default class Schema {

    constructor(schemaJson, skipInternals) {
        if (typeof(skipInternals) === 'undefined') {
            this.skipInternals = true;
        }
        else {
            this.skipInternals = skipInternals;
        }
        this.schemaJson = schemaJson;
        this._enums = new Map();
        this._input = new Map();
        this._nodes = new Map();
        this._domains = new Map();
        this._enumDefaultDomain = new Map();
        this._edges = [];
        this._parse();
    }

    get_node_by_name(name) {
        if (this._nodes.has(name)) {
            return this._nodes.get(name);
        }
        return null;
    }

    get_edge_by_name(node, name) {
        for (let edge of this._edges) {
            if (edge.nodeFrom.trueName === node.trueName &&
                edge.fieldSource &&
                edge.fieldSource.name === name &&
                edge.nodeTo instanceof SchemaNode) {
                return edge;
            }
        }
        return null;
    }

    get_node_domain(id) {
        return this._nodes.get(id).domain;
    }

    nodes_and_edges(domainState, conciergeState) {
        let restrictedNodes = new Map();
        for (let node of this._nodes.values()) {
            if (conciergeState) {
                if (conciergeState.nodes[node.id]) restrictedNodes.set(node.id, node);
            }
            else {
                if (!domainState.is_node_excluded(node)) restrictedNodes.set(node.id, node);
            }
        }
        let restrictedEdges = [];
        for (let edge of this._edges) {
            if (conciergeState) {
                if (restrictedNodes.has(edge.source.id) &&
                    restrictedNodes.has(edge.target.id) &&
                    conciergeState.edges[edge.id]
                ) restrictedEdges.push(edge);
            }
            else {
                if (restrictedNodes.has(edge.source.id) && restrictedNodes.has(edge.target.id)) restrictedEdges.push(edge);
            }

        }
        restrictedEdges = this._bd_domain_filter(restrictedEdges);
        if (conciergeState) {
            // Apply positional and expansion information to nodes and edges
            this._apply_positional_info(restrictedNodes.values(), restrictedEdges.values(), conciergeState);
            // Write back the domain state from the concierge
            this._write_back_domain_state(restrictedNodes.values(), domainState);
        }
        return {nodes: Array.from(restrictedNodes.values()), edges: restrictedEdges};
    }


    _apply_positional_info(nodes, edges, conciergeState) {
        for (let node of nodes) {
            //node.nvm.open = true; //!!(conciergeState.nodes[node.id].open);
            node.posX = conciergeState.nodes[node.id].posX;
            node.posY = conciergeState.nodes[node.id].posY;
        }

        for (let edge of edges) {
            if (! conciergeState.edges[edge.id]) {
                console.log("An edge doesn't map to the concierge state.  The concierge state should probably be updated")
                continue;
            }
            edge.x1 = conciergeState.edges[edge.id].x1;
            edge.y1 = conciergeState.edges[edge.id].y1;
            edge.x2 = conciergeState.edges[edge.id].x2;
            edge.y2 = conciergeState.edges[edge.id].y2;
        }
    }

    _write_back_domain_state(nodes, domainState) {
        let stateMap = new Map();
        let presence = new Set();
        for (let node of nodes) {
            presence.add(node.id);
            if (node instanceof SchemaDomain) {
                stateMap.set(node.domain, states.MINIMIZED);
            }
            else if (node instanceof SchemaNode) {
                stateMap.set(node.domain, states.NODES);
            }
        }
        for (let domain of domainState.domain_list) {
            if (stateMap.has(domain)) {
                domainState.set_domain_state(domain, stateMap.get(domain), true);
            }
            else {
                domainState.set_domain_state(domain, states.REMOVED, true);
            }
        }
        /*
        Every node in a domain that is now visible gets removed
         */
        for (let node of this._nodes.values()) {
            if (! presence.has(node.id) &&
                node.domain &&
                !(node instanceof SchemaDomain) &&
                domainState.get_domain_state(node.domain) !== states.REMOVED) {
                domainState.exclude_node(node.id);
            }
        }
    }

    /*
    Aggregate 2 domain edges in opposite directions into a single edge
     */
    _bd_domain_filter(edges) {
        let deDup = new Map();
        let dMap = new Set();
        /*
        Pass one - check for bidirectionality
         */
        for (let edge of edges) {
            let source = edge.source.id;
            let target = edge.target.id;
            dMap.add(source + target);
        }
        let restrictedEdges = [];
        for (let edge of edges) {
            if (edge.source instanceof SchemaDomain && edge.target instanceof SchemaDomain) {
                let source = edge.source.id;
                let target = edge.target.id;
                let key = (source.localeCompare(target) < 0) ? source + target : target + source;
                if (! deDup.has(key)) {
                    deDup.set(key, edge);
                    restrictedEdges.push(edge);
                    if (dMap.has(source + target) && dMap.has(target + source)) {
                        edge.biDirectional = true;
                    }
                }
            }
            else {
                restrictedEdges.push(edge);
            }
        }
        return restrictedEdges;
    }

    get nodes() {
        return Array.from(this._nodes.values()).filter(node => ! node.disabled);
    }

    get edges() {
        return this._edges;
    }

    get domains() {
        let domains = new Set();
        for (let node of this._nodes.values()) {
            domains.add(node.domain);
        }
        return domains;
    }

    _parse() {
        if (! this.schemaJson) return;
        if (!(DATANAME in this.schemaJson)) return;
        if (!(SCHEMANAME in this.schemaJson[DATANAME])) return;
        if (!(TYPESNAME in this.schemaJson[DATANAME][SCHEMANAME])) return;
        let rawTypes = this.schemaJson[DATANAME][SCHEMANAME][TYPESNAME];
        if (!Array.isArray(rawTypes)) return;
        /*
        The first pass maps enums/inputs by name, so that they can be directly mapped inside SchemaNode objects, rather
        than edging to them.  Type filtering is done within the methods, for no particularly compelling reason.
         */
        for (let type of rawTypes) {
            this._parse_enum(type);
            this._parse_input(type);
        }
        /*
        The second pass maps Nodes with basic properties and enums, and skips query and mutation
         */
        for (let type of rawTypes) {
            this._parse_node(type);
        }
        /*
        The third pass maps interfaces and unions, which must be aware of existing types
        */
        for (let type of rawTypes) {
            this._parse_interface(type)
            this._parse_union(type)
        }
        /*
        Parse query and mutation, now that we can determine connected domain
         */
        for (let type of rawTypes) {
            this._parse_qm(type);
        }

        /*
        Parse out enum nodes, now that we can get additional domain info
        */
        this._parse_node_enums();
        for (let type of rawTypes) {
            this._parse_enum_nodes(type);
        }

        /*
        Now add the domain entities into the mix
         */
        for (let domain of this.domains) {
            let dNode = new SchemaDomain(domain);
            this._domains.set(dNode.name, dNode);
            this._nodes.set(dNode.id, dNode);
        }
        /*
        Assign parentage, so that the children of the domain objects can appear at the same point as their
        parent in a visually pleasing manner
         */
        for (let node of this.nodes) {
            if (!(node instanceof SchemaDomain)) {
                node.set_parent(this._domains.get(node.domain));
            }
        }
        /*
        This adds an implementation field for each implementation of an interface/union
         */
        this._parse_interfaces();
        this._parse_unions();
        /*
        Now we gather all of the edges, which link directly to the mapped nodes, hence why it's easier to parse out
        the objects before running this stage, then pass the map by name
         */
        for (let node of this.nodes) {
            this._edges.push(...node.get_edges(this._nodes, this._domains));
        }
        /*
        This is a little ugly, but if an enum is only present on inputs we remove it as a node.  Theres probably
        a better, cleaner and faster way to do this but its getting late
         */
        let objectEnums = new Set();
        for (let edge of this._edges) {
            if (edge.nodeTo instanceof SchemaEnumNode) {
                objectEnums.add(edge.nodeTo.id)
            }
        }
        this._nodes.forEach(node => {
            if (node instanceof SchemaEnumNode && ! objectEnums.has(node.id)) {
                node.disabled = true;
            }
        })


    }

    /*
    If an enum has no assigned domain info, then we pick the first entity that uses it as its default domain
     */
    _parse_node_enums() {
        for (let node of this.nodes) {
            if (! node.fields) continue;
            node.fields.forEach(field => {
                if (field.rootKind === 'ENUM') {
                    if (! this._enumDefaultDomain.has(field.rootName)) {
                        this._enumDefaultDomain.set(field.rootName, node.domainInfo);
                    }
                }
            })
        }
    }

    _parse_unions() {
        for (let node of this.nodes) {
            if (! node.source || ! (node.source.kind === 'UNION')) continue;
            if (node.source && node.source.possibleTypes) {
                let count = 0;
                for (let type of node.source.possibleTypes) {
                    count++;
                    let field = new SchemaField(this._get_placeholder_field("Type " + count, type.name), node.enumMap, node.id, node.domainInfo);
                    field.set_union();
                    node.add_field(field);
                }
            }
        }
    }

    _parse_interfaces() {
        let iMap = new Map();
        /*
            First, get a mapping of the interface -> types
         */
        for (let node of this.nodes) {
            if (! node.source ||
                !("interfaces" in node.source) ||
                !(Array.isArray(node.source.interfaces)) ||
                node.source.interfaces.length === 0)
                  continue;
            for (let iface of node.source.interfaces) {
                if (! iMap.has(iface.name)) {
                    iMap.set(iface.name, []);
                }
                iMap.get(iface.name).push(node)
            }
        }
        /*
        Next, add a (fake) property that forces an edge creation
         */
        for (let node of this.nodes) {
            if (! node.source || ! (node.source.kind === 'INTERFACE')) continue;
            let impls = iMap.get(node.id)
            let count = 0;
            for (let obj of impls) {
                count++;
                let field = new SchemaField(this._get_placeholder_field("Implementation " + count, obj.id), node.enumMap, node.id, node.domainInfo);
                field.set_interface()
                node.add_field(field);
            }
        }
    }

    _get_placeholder_field(name, typeName) {
        return {
            args: [],
            deprecationReason: null,
            description: null,
            isDeprecated: false,
            name: name,
            type: {
                kind: 'OBJECT',
                name: typeName,
                ofType: null
            }

        }
    }

    _parse_node(nodeObj) {
        if (!("kind" in nodeObj) ||!(nodeObj.kind === "OBJECT")) return;
        if (!("name" in nodeObj)) return;
        if (this.skipInternals && nodeObj.name.startsWith("__")) return;
        if (nodeObj.name.toUpperCase() === "QUERY" || nodeObj.name.toUpperCase() === "MUTATION" || nodeObj.name.toUpperCase() === "SUBSCRIPTION") {
            return;
        }
        let domainInfo = domainMetaManager.parse_node_metadata(nodeObj);
        this._nodes.set(nodeObj.name, new SchemaNode(nodeObj, this._enums, this._input, "Entity", domainInfo));
    }

    _parse_interface(nodeObj) {
        if (!("kind" in nodeObj) ||!(nodeObj.kind === "INTERFACE")) return;
        if (!("name" in nodeObj)) return;
        if (this.skipInternals && nodeObj.name.startsWith("__")) return;
        let domainInfo = domainMetaManager.parse_node_metadata(nodeObj);
        this._nodes.set(nodeObj.name, new SchemaNode(nodeObj, this._enums, this._input, "Entity", domainInfo));
    }

    _parse_union(nodeObj) {
        if (!("kind" in nodeObj) ||!(nodeObj.kind === "UNION")) return;
        if (!("name" in nodeObj)) return;
        if (this.skipInternals && nodeObj.name.startsWith("__")) return;
        let domainInfo = domainMetaManager.parse_node_metadata(nodeObj);
        this._nodes.set(nodeObj.name, new SchemaNode(nodeObj, this._enums, this._input, "Entity", domainInfo));
    }

    _parse_input(nodeObj) {
        if (!("kind" in nodeObj) ||!(nodeObj.kind === "INPUT_OBJECT")) return;
        if (!("name" in nodeObj)) return;
        this._input.set(nodeObj.name, new SchemaInput(nodeObj, this._enums));
    }

    /*
    We separate out queries and mutations into their individual fields, otherwise the single query schema becomes a giant
    sticky blob that detracts from visualization understanding
     */
    _parse_qm(nodeObj) {
        if (!(nodeObj.name.toUpperCase() === "QUERY" || nodeObj.name.toUpperCase() === "MUTATION")) {
            return;
        }
        let type = nodeObj.name.toUpperCase();
        let masterNode = new SchemaNode(nodeObj, this._enums, this._input, type);
        for (let field of masterNode.fields.values()) {
            let localNode = this._nodes.get(field.rootName);
            /*
            Normally, we pick the default domain info from the parent, but in this case the Query and Mutation
            definitions have no parents, and cannot be linked to a single domain, so we reach down to the destination
            (if it is defined as a type) and use that as our default.  This can still be overridden by field level
            domain info
             */
            let domainInfo = noDomain;

            if (localNode) {
                domainInfo = this._nodes.get(field.rootName).domainInfo;
            }
            if (field.name && field.name.startsWith("_ignore")) {
                continue;
            }
            let ep = new SchemaEntryPoint(field, this._input, type, domainInfo);
            this._nodes.set(ep.id, ep);
        }
    }

    _parse_enum(enumObj) {
        if (!("kind" in enumObj) ||!(enumObj.kind === "ENUM")) return;
        if (!("name" in enumObj)) return;
        if (!("enumValues" in enumObj) ||!(Array.isArray(enumObj.enumValues))) return;
        if (this.skipInternals && enumObj.name.startsWith("__")) return;
        this._enums.set(enumObj.name, enumObj);
    }

    _parse_enum_nodes(enumObj) {
        if (!("kind" in enumObj) ||!(enumObj.kind === "ENUM")) return;
        if (!("name" in enumObj)) return;
        if (!("enumValues" in enumObj) ||!(Array.isArray(enumObj.enumValues))) return;
        if (this.skipInternals && enumObj.name.startsWith("__")) return;
        if (! this._enumDefaultDomain.get(enumObj.name)) return;
        let domainInfo = domainMetaManager.parse_node_metadata(enumObj, this._enumDefaultDomain.get(enumObj.name));
        this._nodes.set(enumObj.name, new SchemaEnumNode(enumObj, domainInfo));
    }

    get_qm_name(type, name) {
        return type.toUpperCase() + " - " + name;
    }
}

