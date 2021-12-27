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

import * as d3 from "d3";
import ASTConverter from "../schema/ASTConverter";
import SchemaDomain from "../schema/SchemaDomain";
import TreeWindow from "./TreeWindow";

export default class QueryTreeWindow extends TreeWindow {

    constructor() {
        super();
        this.astConverter = new ASTConverter();
        this.nodeCount = 0;
    }

    build(container) {
        super.build(container);
    }

    update(nodeEdgeData) {
        this.simulation.alphaTarget(0.01).restart();
        this.currentTreeData = nodeEdgeData;
        let nodeData = nodeEdgeData.nodes;
        let edgeData = nodeEdgeData.edges;

        let node = this.nodeGroup
            .selectAll(".nodeEntry")
            .data(nodeData, d => d.id);

        node.exit().remove();
        node = node.enter()
            .append("g")
            .attr('class', "nodeEntry");

        d3.selectAll('.nodeEntry').each(function (d) {
            d.nvm.build(this, true);
        });

        let root = d3.stratify()
            .id(d => d.id)
            .parentId(d => (typeof(d.treeParent) !== 'undefined') ? d.treeParent.id : null)
            (nodeData);

        let sizing = this.get_sizing(root);

        this.parentSvg
            .attr("viewBox", [-sizing.initialXOffset, sizing.initialYOffset, sizing.vizWidth, sizing.vizHeight])

        let treemap = d3.tree()
            .size([sizing.height, sizing.width]);

        let treeNodes = treemap(root.sort(function(a, b) { return a.id.toLowerCase().localeCompare(b.id.toLowerCase()); }));
        let lastNode = null;
        let graphBase = 0;
        let yOffset = 0;
        for (let node of treeNodes.descendants()) {
            let tableOffset = node.data.nvm.sizing.totalHeight / 2;
            yOffset = node.data.nvm.sizing.height * 2;
            node.data.top = node.x - tableOffset;
            node.data.bottom = node.x + tableOffset;
            node.data.fx = sizing.xOffsetMap[node.depth];
            node.data.fy = node.x;
            node.data.x = node.data.fx;
            node.data.y = node.data.fy;
            if (lastNode && node.depth === lastNode.depth && (node.data.top - lastNode.data.bottom) < yOffset) {
                let newY = lastNode.data.bottom + tableOffset + node.data.nvm.sizing.height;
                node.data.fy = newY;
                node.data.y = newY;
                node.data.bottom = newY + tableOffset;
            }
            graphBase = (graphBase < node.data.bottom) ? node.data.bottom : graphBase;
            lastNode = node;
        }
        if (graphBase > sizing.vizHeight) {
            sizing.vizHeight = graphBase + yOffset;
            this.parentSvg
                .attr("viewBox", [-sizing.initialXOffset, sizing.initialYOffset, sizing.vizWidth, sizing.vizHeight])
        }
        node.attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            });

        d3.selectAll(".nodeEntry")
            .transition()
            .attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            })
            .duration(1000)
            .on("end", () => {
                this.simulation.alphaTarget(0);
            });

        let link = this.linkGroup
            .selectAll(".edgeline")
            .data(edgeData, d => d.id);
        link.exit().remove();

        link.enter()
            .append("path")
            .attr('class', "edgeline")
            .attr("stroke-width", d => {
                return (d.source.type === 'Entity') ? 2 : 3;
            })
            .attr("marker-end", d => {
                switch (d.source.type) {
                    case "Query":
                        return 'url(#qarrowhead)';
                    case "Mutation":
                        return 'url(#marrowhead)';
                    default:
                        return 'url(#arrowhead)';
                }
            })
            .attr("marker-start", d => {
                return (d.biDirectional) ? 'url(#rarrowhead)' : "none";
            })
            .attr('fill', 'none');

        this.simulation.nodes(nodeData).on("tick", () => this.ticked());
        this.simulation.force("link", d3.forceLink().links(edgeData));

    }

    _add_debug_to_svg(sizing) {
        console.log(sizing);
        this.svg.selectAll('.debugRuler').remove()
        this.svg.append('rect')
            .attr('class', "debugRuler")
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', 1)
            .attr('height', sizing.height)
            .style('fill', "red")
        for (let depth in sizing.xOffsetMap) {
            this.svg.append('rect')
                .attr('class', "debugRuler")
                .attr('x', sizing.xOffsetMap[depth])
                .attr('y', 0)
                .attr('width', 1)
                .attr('height', sizing.height)
                .style('fill', "green")
        }
    }

    ticked() {
        let links = d3.selectAll(".edgeline");
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
            let dr = (d.source instanceof SchemaDomain && d.target instanceof SchemaDomain) ? 6000 : 4000000;
            return "M" +
                d.sourceCalc.x + "," +
                d.sourceCalc.y + "A" +
                dr + "," + dr + " 0 0,1 " +
                d.targetCalc.x + "," +
                d.targetCalc.y;
        });
    }

    refresh() {
        // Use update instead...
    }
}
