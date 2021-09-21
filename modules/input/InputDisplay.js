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

import InputTree from "./InputTree";
import * as d3 from "d3";
import SchemaInputObject from "../schema/SchemaInputObject";
import SchemaEnum from "../schema/SchemaEnum";
import SchemaEdge from "../schema/SchemaEdge";
import '../styles/input-tree.css';


const OUTER_CLASS = "input-tree__outer";
const INNER_CLASS = "input-tree__inner";
const BC = "input-tree__remove";

const SPACER = 20;
const PADDING = 30;

export default class InputDisplay {
    constructor() {
        this.open = false;
    }

    /*
    Working with a single global builder for now - only one set of input visible
     */
    build(field) {
        if (this.open && this.field && field.name === this.field.name) {
            // toggle
            this.remove();
            return;
        }
        this.field = field;
        this.remove();
        this.open = true;
        this.ownerDiv = d3.select('body')
            .append('div')
            .attr('class', 'input-tree__outer')
        this.masterDiv = this.ownerDiv
            .append('div')
            .attr('class', 'input-tree__inner')

        this.parentSvg = this.masterDiv.append('svg')
            .style('width', '100%')
            .style('height', '100%')
        this.svg = this.parentSvg.append("g").attr("cursor", "grab").attr('stopHierarchy', "true");
        let arrows = [
            {id: 'inputtreearrow', class: 'inputline regulararrow', reverse: false}
        ];
        this.svg.selectAll('marker')
            .data(arrows)
            .enter()
            .append('marker')
            .attr('id', d => d.id)
            .attr('viewBox', '-0 -3 10 6')
            .attr('refX', d => (d.reverse) ? 0 : 10)
            .attr('refY', 0)
            .attr('orient', 'auto')
            .attr('markerWidth', 8)
            .attr('markerHeight', 8)
            .attr('xoverflow', 'visible')
            .append('svg:path')
            .attr('class', d => d.class)
            .attr('d', d => (d.reverse) ? 'M 10,-3 L 0 ,0 L 10,3' : 'M 0,-3 L 10 ,0 L 0,3');
        this.container = this.svg.append('g');
        let root = this._build_data();
        this.masterDiv.append('div')
            .attr('class', BC + " remove")
            .html("X")
            .on("click", () => {this.remove()});
        this._build_contents(root);
    }

    remove() {
        this.open = false;
        d3.selectAll('.' + OUTER_CLASS).remove();
    }

    _build_contents(root) {

        let nodeGroup =  this.container
            .append('g')
            .attr('class', 'inputNode');

        let nodes = nodeGroup.selectAll('.inode')
            .data(root.descendants())
            .enter()
            .append('g')
            .attr('class', 'inode')
            .each(function(d) {
                if (d.data.nvm) {
                    d.data.nvm.build(this);
                }
            });

        this.container
            .append('g')
            .attr('class', 'inputLink')
            .selectAll(".inputegeline")
            .data(this.links, d => d.id)
            .enter()
            .append("path")
            .attr('class', "inputegeline")
            .attr("stroke-width", 3)
            .attr("marker-end", 'url(#inputtreearrow)')
            .attr('fill', 'none');

        let sizing = this._get_sizing(root);

        let treemap = d3.tree()
            .size([sizing.height, sizing.width]);
        let treeNodes = treemap(root.sort(function(a, b) { return a.id.toLowerCase().localeCompare(b.id.toLowerCase()); }));
        for (let node of treeNodes.descendants()) {
            node.data.fx = node.y;
            node.data.fy = node.x;
            node.data.x = node.data.fx;
            node.data.y = node.data.fy;
        }

        nodes.attr("transform", function (d) {
            return "translate(" + d.y + "," + d.x + ")";
        });

        let links = d3.selectAll(".inputegeline");
        links.each(d => {
            let targetXY = {
                x: d.target.x,
                y: d.target.y
            };
            let fieldName = d.fieldSource.name;
            d.sourceCalc = d.source.nvm.getSourceConnectionPoint(fieldName, targetXY);
            //d.sourceCalc = d.source.nvm.getIncomingConnectionPoint(targetXY);
            if (d.source.type === 'Entity' || d.source.type === 'Domain') {
                d.targetCalc = d.target.nvm.getIncomingConnectionPoint(d.sourceCalc);
            } else {
                d.targetCalc = d.target.nvm.getEntityConnectionPoint(d.sourceCalc);
            }
        });

        links.attr("d", d => {
            let dr = 4000000;
            return "M" +
                d.sourceCalc.x + "," +
                d.sourceCalc.y + "A" +
                dr + "," + dr + " 0 0,1 " +
                d.targetCalc.x + "," +
                d.targetCalc.y;
        });

        this.container.attr("transform", "translate(" + sizing.boundingOffset + ",0)");

        this._apply_size_mask(sizing);

    }

    _apply_size_mask(sizing) {
        let self = this;
        let width = parseInt(d3.select('body').style('width'), 10);
        let height = parseInt(d3.select('body').style('height'), 10);

        let maxWidth = width / 2;
        let maxHeight = height / 2;
        let svgHeight = sizing.height;
        let svgWidth = sizing.boundingWidth;

        if (svgHeight > maxHeight) {
            let sf = svgHeight / maxHeight;
            svgHeight = maxHeight;
            svgWidth = svgWidth / sf;
        }
        if (svgWidth > maxWidth) {
            let sf = svgWidth / maxWidth;
            svgWidth = maxWidth;
            svgHeight = svgHeight / sf;
        }

        this.ownerDiv
            .style('width', svgWidth + "px")
            .style('height', svgHeight + "px");

        this.parentSvg
            .attr("viewBox", [0, 0, sizing.boundingWidth , sizing.height]);

        this.zoom = d3.zoom()
            .extent([[0, 0], [sizing.boundingWidth, sizing.height]])
            .scaleExtent([0.5, 4])
            .on("zoom", zoomed);

        this.parentSvg.call(this.zoom)
            .on("dblclick.zoom", null);

        function zoomed() {
            self.svg.attr("transform", d3.event.transform);
        }

    }

    _get_sizing(root) {
        // Get the width, by iterating through the levels, getting the widest level and then adding
        // padding
        let sizeMap = new Map();
        let heightMap = new Map();
        let initialXOffset = root.data.nvm.sizing.rowWidth / 2;
        let finalXOffset = 0;
        let nodeCount = 0;
        for (let node of root.descendants()) {
            nodeCount++;
            // Width
            let depth = node.depth;
            let current = (sizeMap.has(depth)) ? sizeMap.get(depth) : 0;
            let thisWidth = node.data.nvm.sizing.rowWidth;
            if (thisWidth > current) {
                sizeMap.set(depth, thisWidth);
            }
            finalXOffset = node.data.nvm.sizing.rowWidth / 2;
            // Height
            let ch = (heightMap.has(depth)) ? heightMap.get(depth) : 0;
            ch += node.data.nvm.sizing.totalHeight;
            heightMap.set(depth, ch);
        }
        let width = 0;
        let levels = 0;
        for(let depth of sizeMap.keys()) {
            width += sizeMap.get(depth);
            levels++;
        }
        levels--;
        width += (levels * SPACER);
        let maxHeight = 0;
        for (let depth of heightMap.keys()) {
            if (heightMap.get(depth) > maxHeight) {
                maxHeight = heightMap.get(depth);
            }
        }




        let height = maxHeight + (maxHeight * 0.7);
        /*
        Prevent really weird thin windows
        */
        if (width / height > 3) {
            height = width / 3;
        }

        let boundingWidth = width + initialXOffset + finalXOffset + (PADDING * 2);
        let boundingOffset = initialXOffset + PADDING;
        if (nodeCount === 1) {
            boundingWidth -= finalXOffset;
            boundingWidth -= initialXOffset;
        }

        return {
            initialXOffset: initialXOffset,
            initialYOffset: 0,
            height: height,
            width: width,
            boundingWidth: boundingWidth,
            boundingOffset: boundingOffset
        };
    }

    _build_data() {
        this.links = [];
        let tree = new InputTree();
        let domain = this.field.domain;
        this._add_object(this.field.args, "Input Tree for " + this.field.name, tree, null, domain, null);
        return d3.stratify()
            .id(d => d.id)
            .parentId(d => {
                return (typeof(d.parent) !== 'undefined' && d.parent !== null) ? d.parent.id : null
            })
            (tree.dataSet);
    }

    _add_object(fields, name, tree, parent, domain, field) {
        let id = tree.get_id(name);
        let object = new SchemaInputObject(id, parent, domain);
        if (parent) {
            this.links.push(new SchemaEdge(field, parent, object, domain));
        }
        tree.add(object);
        for (let field of fields) {
            field.definition =  this._recursive_def(field.type);
            let typing = this._get_arg_type(field);
            field.rootKind = typing.kind;
            field.rootName = typing.name;
            object.add_field(field);
            if (field.rootKind === 'INPUT_OBJECT') {
                let child = this.field.inputMap.get(field.rootName);
                this._add_object(child.fields, field.rootName, tree, object, domain, field);
            }
            if (field.rootKind === 'ENUM') {
                let id = tree.get_id(field.rootName);
                let child = new SchemaEnum(id, this.field.enumMap.get(field.rootName), object, domain);
                this.links.push(new SchemaEdge(field, object, child, domain));
                tree.add(child);
            }
        }
    }

    _get_arg_type(arg) {
        return this._recursive_typer(arg.type);
    }

    _recursive_typer(type) {
        if ("ofType" in type && type.ofType !== null) {
            return this._recursive_typer(type.ofType);
        }
        else {
            return {kind: type.kind, name: type.name};
        }
    }

    _recursive_def(type) {
        if (typeof(type) === 'undefined') return "";
        if (typeof(type.ofType) === 'undefined' || type.ofType == null) return type.name;
        switch(type.kind) {
            case "NON_NULL":
                return this._recursive_def(type.ofType) + "!";
            case "LIST":
                return "[" + this._recursive_def(type.ofType) + "]";
        }
    }
}

