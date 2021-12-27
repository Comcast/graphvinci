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

import ResultNode from "./ResultNode";
import ResultEdge from "./ResultEdge";

export default class QueryConverter {

    constructor() {

    }

    error(queryGraph, schema, error) {
        let rc = new ResultsContainer(schema, {status: "error", error: error});
        rc.set_error(error);
        return rc;
    }

    nodes_and_edges(queryGraph, schema, results) {
        let rc = new ResultsContainer(schema, results);
        let root = queryGraph.root;
        let name = root.name;
        this.crawl_query(name, root, queryGraph, rc, results.data, null, null, null);
        return rc;
    }

    crawl_query(levelName, schemaNode, queryGraph, rc, results, parent, linkId, uniqueLinkId) {
        let node = new ResultNode(levelName, schemaNode);
        node.treeParent = parent;
        node = rc.add_node(node);
        if (parent && linkId) {
            rc.add_edge(new ResultEdge(parent, node, linkId, uniqueLinkId))
        }
        for (let name of schemaNode.fieldKeys) {
            if (! results || ! (results[name])) continue;
            let childResult = results[name];
            let field = schemaNode.fields.get(name);
            let child = queryGraph.get_child(schemaNode, field);
            if (child) {
                let count = 0;
                // Recursively process the tree
                if (Array.isArray(childResult)) {
                    for (let p of childResult) {
                        let id = (count > 0) ? field.name + " - " + count : field.name;
                        node.add_link(field.name, id);
                        this.crawl_query(id, child, queryGraph, rc, p, node, field.name, id);
                        count++;
                    }
                }
                else {
                    let id = (count > 0) ? field.name + " - " + count : field.name;
                    node.add_link(field.name, id);
                    this.crawl_query(id, child, queryGraph, rc, results[name], node, field.name, id)
                }

            }
            else {
                if (Array.isArray(childResult)) {
                    for (let f of childResult) {
                        node.add_property(field.name, f);
                    }
                }
                else {
                    node.add_property(field.name, childResult);
                }
            }
        }
    }

}



class ResultsContainer {
    constructor(schema, rawResults) {
        this.schema = schema;
        this.rawResults = rawResults;
        this._nodes = new Map();
        this._edges = [];
    }

    set_error(error) {
        this.error = error;
    }

    add_node(node) {
        if (this._nodes.size === 0) {
            this.root = node;
        }
        if (! this._nodes.has(node.id)) {
            this._nodes.set(node.id, node);
            return node;
        }
        else {
            let newName = this.get_name(node);
            let clone = ResultNode.clone(node, newName);
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
        this._edges.push(edge);
    }

    get nodes() {
        return Array.from(this._nodes.values());
    }

    get edges() {
        return this._edges;
    }

}

