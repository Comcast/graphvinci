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

import SchemaNode from "./SchemaNode";
import SchemaEdge from "./SchemaEdge";

export default class ASTConverter {

    constructor() {

    }

    nodes_and_edges(ast, schema) {
        let rc = new FilteredContainer(schema);
        if (! (ast.kind === 'Document')) return;
        if (! (Array.isArray(ast.definitions))) return;
        let initialDefinition = ast.definitions[0];
        let initialSelection = initialDefinition.selectionSet.selections[0];
        let initialField = initialSelection.name.value;
        let startingPoint = schema.get_qm_name(initialDefinition.operation, initialField);
        this._process_selection_set(startingPoint, initialSelection, schema, rc, null, null);
        return rc;
    }

    _process_selection_set(name, selection, schema, container, parent, fromEdge) {
        let propMask = new Set();
        let node = schema.get_node_by_name(name);
        if (node !== null) {
            node = container.add_node(node);
        }
        if (parent !== null) {
            node.treeParent = parent;
        }
        if (fromEdge !== null) {
            if (node.cloned) {
                fromEdge = SchemaEdge.clone(fromEdge);
                fromEdge.nodeTo = node;
            }
            container.add_edge(fromEdge);
        }
        if (typeof(selection.selectionSet) !== 'undefined') {
            let edge = schema.get_edge_by_name(node, selection.name.value);
            propMask.add(selection.name.value);
            if (node.cloned) {
                edge = SchemaEdge.clone(fromEdge);
                edge.nodeFrom = node;
            }
            this._process_selection_set(edge.nodeTo.id, selection.selectionSet, schema, container, node, edge);
        }
        let selections = selection.selections;
        if (typeof(selections) !== 'undefined' && Array.isArray(selections)) {
            for (let subSelect of selections) {
                if (typeof(subSelect.selectionSet) !== 'undefined') {
                    let edge = schema.get_edge_by_name(node, subSelect.name.value);
                    if (node.cloned) {
                        edge = SchemaEdge.clone(edge);
                        edge.nodeFrom = node;
                    }
                    propMask.add(subSelect.name.value);
                    this._process_selection_set(edge.nodeTo.id, subSelect.selectionSet, schema, container, node, edge);
                }
                else {
                    propMask.add(subSelect.name.value);
                }
            }
        }
        if (node) {
            node.set_property_mask(propMask);
        }

    }

}

class FilteredContainer {
    constructor(schema) {
        this.schema = schema;
        this._nodes = new Map();
        this._edges = new Map();
    }

    get_child(node, field) {
        for (let edge of this.edges) {
            if (edge.nodeFrom === node && (edge.fieldSource === field || edge.fieldSource.name === field.name)) {
                return edge.nodeTo;
            }
        }
    }

    add_node(node) {
        if (this._nodes.size === 0) {
            this.root = node;
        }
        if (! this._nodes.has(node.id)) {
            node.nvm.open = true;
            this._nodes.set(node.id, node);
            return node;
        }
        else {
            let newName = this.get_name(node);
            let clone = SchemaNode.clone(node, newName);
            clone.nvm.open = true;
            this._nodes.set(newName, clone);
            return clone;
        }
    }

    get_name(node){
        let count = 1;
        while (count < 100) {
            let newName = node.id + "(" + count + ")";
            if (! this._nodes.has(newName)) {
                return newName;
            }
            count++;
        }
        console.log("Either you are creating the world's most complex query, or something has gone horribly wrong.  Either way, good luck...");
    }

    add_edge(edge) {
        if (! this._edges.has(edge.id)) {
            this._edges.set(edge.id, edge);
        }
    }

    get nodes() {
        return Array.from(this._nodes.values());
    }

    get edges() {
        return Array.from(this._edges.values());
    }

}

