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

import TreeWindow from "./TreeWindow";
import QueryConverter from "./QueryConverter";
import * as d3 from "d3";
import SchemaDomain from "../schema/SchemaDomain";

export default class ResultsTreeWindow extends TreeWindow {

    constructor() {
        super();
        this.converter = new QueryConverter();
    }

    build(container) {
        this.container = container;
        super.build(container);
    }

    update(nodeEdgeData) {
        super.build(this.container);
        let nodeData = nodeEdgeData.nodes;
        let edgeData = nodeEdgeData.edges;
        if (nodeData === undefined || nodeData.length == 0) {
            return;
        }
        let node = this.nodeGroup
            .selectAll(".resultEntry")
            .data(nodeData, d => d.id);
        node.exit().remove();
        node = node.enter()
            .append("g")
            .attr('class', "resultEntry");

        d3.selectAll('.resultEntry').each(function (d) {
            d.nvm.build(this);
        });

        let root = d3.stratify()
            .id(d => d.id)
            .parentId(d => {
                let pid = (typeof(d.treeParent) !== 'undefined' && d.treeParent !== null) ? d.treeParent.id : null;
                return pid;
            })
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

        d3.selectAll(".resultEntry")
            .transition()
            .attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            })
            .duration(1000)
            .on("end", () => {
                this.simulation.alphaTarget(0);
            });

        let link = this.linkGroup
            .selectAll(".redgeline")
            .data(edgeData, d => d.id);
        link.exit().remove();

        link.enter()
            .append("path")
            .attr('class', "redgeline")
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

    ticked() {
        let links = d3.selectAll(".redgeline");
        links.each(d => {
            let targetXY = {
                x: d.target.x,
                y: d.target.y
            };
            let fieldName = d.originId;
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

}
