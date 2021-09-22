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

import ClassNodeSizer from './ClassNodeSizer.js';
import * as d3 from "d3";
import VisManager from './VisManager.js';
import d3utils from "../utils/D3Utils";
import GlobalViz from "../GlobalViz";

export default class EntryPointVisManager extends VisManager {
    constructor(node) {
        super(node);
        this.switch = false;
        this.open = false;
    }

    build(group, hideX) {
        let self = this;
        if (typeof (group) !== 'undefined') {
            this.group = group;
        }
        this.fieldArray = this.get_array();
        this.previousSizing = this.sizing;
        this.sizing = new ClassNodeSizer(this.fieldArray);

        // Create the master container, if it doesn't already exist using a single-element array
        d3.select(this.group)
            .selectAll('.masterGroup')
            .data(['master'])
            .enter()
            .append('g')
            .attr('class', "masterGroup");

        // Select the master, whether it was created or not in this round
        let master = d3.select(this.group).select('.masterGroup');

        // Append the "subdermal" color layer
        master.selectAll('.subgroup')
            .data(['subdermis'])
            .enter()
            .append('g')
            .attr('class', "subgroup")
            .append('rect')
            .attr('class', "subdermis")
            .attr('width', this.initialSizer.rowWidth)
            .attr('height', 0)
            .attr('fill', d3utils.get_node_color(this.node));

        // Remove and re-create the incoming attachment points
        this._append_incoming_group(master);

        this._manage_rows(master);

        master.selectAll('.overlay').remove();
        // Apply the "epidermis" top layer
        master.append('g')
            .attr('class', "overlay")
            .append('rect')
            .attr('class', "epidermis")
            .attr('width', this.initialSizer.rowWidth)
            .attr('height', this.initialSizer.tableHeight)
            .attr('stroke', d3utils.get_node_color(this.node))
            .attr('stroke-width', 4)
            .attr('rx', 4)
            .attr('fill', "none");

        if (! hideX) {
            // Add the remove button
            let remButton = master.selectAll('.remove')
                .data(['removebutton'])
                .enter()
                .append('g')
                .attr('class', "remove")
                .attr("transform", () => {
                    return "translate(" + this.initialSizer.closerXPosition + ",0)";
                })
                .on("click", d => {
                    GlobalViz.vis.domainState.exclude_node(this.node.id);
                    GlobalViz.vis.graph.update_viz();
                });

            remButton.append('rect')
                .attr('class', "removebutton")
                .attr('width', this.sizing.xWidth)
                .attr('height', this.sizing.xHeight)
                .attr('rx', 4)
                .attr('fill', "#fff")
                .attr('stroke', d3utils.get_node_color(this.node))
                .attr('stroke-width', 4);
            remButton.append('text')
                .text('X')
                .attr('class', "removeX")
                .attr('x', this.initialSizer.xWidth / 2)
                .attr('y', (this.initialSizer.xHeight / 2) + 2)
                .attr('alignment-baseline', 'middle')
                .attr('text-anchor', 'middle');
        }

        let decBuf = 16;
        let sizing = this.sizing.rowHeight  + decBuf;
        let hs = sizing / 2;
        let clazz = "dectype";
        master.selectAll('.decorator').remove();
        let decorator = master.append('g')
            .attr('class', "decorator")
            .attr("transform", d => {
                return "translate(-" + ((decBuf / 2) + hs * 2)+ ",-" + (decBuf / 2) + ")";
            });

        decorator.append("path")
            .attr('class', "decorated")
            .attr('d', this.get_chunker(sizing, hs))
            .attr('transform', "rotate(-45 " + hs + " " + hs + ")")
            .attr("stroke", "none")
            .attr("fill", "#575757")
        decorator.append("text")
            .text((d) => {
                let text = "U";
                switch(this.node.type) {
                    case "QUERY":
                        text =  "Q";
                        break;
                    case "MUTATION":
                        text = "M";
                        break;
                }
                d.decoratorSize = GlobalViz.vis.d3text_sizer.get_sizing("Q", clazz);
                return text;
            })
            .attr('class', clazz)
            .attr('x', d => (d.decoratorSize.width / 2) + (decBuf / 2))
            .attr('y', d => (d.decoratorSize.height / 2) + 3)
            .attr('alignment-baseline', 'middle')
            .attr('text-anchor', 'middle');

         // Apply transitions
        this._manage_transitions(master);


    }

    get initialSizer() {
        if (typeof(this.previousSizing) !== 'undefined') return this.previousSizing;
        return this.sizing;
    }

    /*
    Sometimes things that look hard are easy.  This is not one of those times
     */
    _manage_transitions(master) {
        let self = this;
        let rows = master.selectAll('.rows');
        let easeType = d3.easeBounce;
        let transitionDuration = 1500;
        master.transition()
            .attr("transform", d => {
                return "translate(-" + self.sizing.rowWidth / 2 + ",-" + self.sizing.tableHeight / 2 + ")";
            })
            .duration(transitionDuration).ease(easeType);

        master.selectAll(".remove")
            .transition()
            .attr("transform", () => {
                return "translate(" + self.sizing.closerXPosition + ",0)";
            })
            .duration(transitionDuration).ease(easeType);

        master.selectAll('.subdermis')
            .transition()
            .attr('width', this.sizing.rowWidth)
            .attr('height', this.sizing.tableHeight)
            .duration(transitionDuration).ease(easeType);

        master.selectAll('.epidermis')
            .transition()
            .attr('width', this.sizing.rowWidth)
            .attr('height', this.sizing.tableHeight)
            .duration(transitionDuration).ease(easeType);

        rows.transition()
            .attr("transform", function (d, i) {
                let x = 0;
                let y = i * self.sizing.fullHeight;
                return "translate(" + x + "," + y + ")";
            })
            .duration(transitionDuration).ease(easeType);

        rows.selectAll('.headerText')
            .transition()
            .attr('x', self.sizing.centerTextAnchorX)
            .attr('y', self.sizing.rowMidPoint)
            .duration(transitionDuration).ease(easeType);

        rows.selectAll('.leftText')
            .transition()
            .attr('x', self.sizing.leftTextAnchorX)
            .attr('y', self.sizing.rowMidPoint)
            .duration(transitionDuration).ease(easeType);

        rows.selectAll('.rightText')
            .transition()
            .attr('x', self.sizing.rightTextAnchorX)
            .attr('y', self.sizing.rowMidPoint)
            .duration(transitionDuration).ease(easeType);

        rows.selectAll('rect')
            .transition()
            .attr("width", this.sizing.rowWidth)
            .attr("height", this.sizing.rowHeight)
            .duration(transitionDuration).ease(easeType);

        master.selectAll('.incomingSelector')
            .transition()
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .duration(transitionDuration).ease(easeType);


        rows.selectAll('.sourceSelector')
            .transition()
            .attr('cx', d => {
                if (d.side === "left") return 0;
                return self.sizing.rowWidth;
            })
            .attr('cy', self.sizing.rowMidPoint)
            .duration(transitionDuration).ease(easeType);

        rows.selectAll('.entitySelector')
            .transition()
            .attr('cx', d => {
                if (d.side === "left") return -(self.sizing.marginX / 2);
                return self.sizing.rowWidth + (self.sizing.marginX / 2);
            })
            .attr('cy', self.sizing.rowMidPoint)
            .duration(transitionDuration).ease(easeType);
    }

    _manage_rows(master) {
        let self = this;
        let rows = master.selectAll('.rows');
        rows = rows.data(this.fieldArray);
        let rowEnter = rows.enter();
        let rowGroup = rowEnter.append('g')
            .attr('class', 'rows')
            .attr('filterName', d => d.name);

        /*
        Add domain based override for type extension
         */
        rowGroup.filter(d => d.domain !== null && d.rootKind !== "Header")
            .append('rect')
            .attr("width", this.initialSizer.rowWidth)
            .attr("height", this.initialSizer.rowHeight)
            .attr('fill', d => d3utils.get_node_color(this.node))
            .attr('rx', 3);

        rowGroup.append('rect')
            .attr("width", this.initialSizer.rowWidth)
            .attr("height", this.initialSizer.rowHeight)
            .attr('fill', "white")
            .attr('rx', 3)
            .style("opacity", function(d,i) {
                switch(d.rootKind) {
                    case("Header"):
                        return 0.2;
                    case("OBJECT"):
                    case("INTERFACE"):
                    case("UNION"):
                        return (i % 2) ? 0.4 : 0.5;
                    default:
                        return (i % 2) ? 0.8 : 0.9;
                }
            });

        rowGroup.filter(d => d.rootKind === 'Header')
            .append('text')
            .text(d => d.name)
            .attr('class', "headerText")
            .attr('x', self.initialSizer.centerTextAnchorX)
            .attr('y', self.initialSizer.rowMidPoint)
            .attr('alignment-baseline', 'middle')
            .attr('text-anchor', 'middle');

        let header = rowGroup.filter(d => d.rootKind === 'Header');

        header.selectAll('.entitySelector')
            .data([{side: "left"},{side:"right"}])
            .enter()
            .append('circle')
            .attr('class', 'entitySelector')
            .attr("r", 0)
            .attr('cx', d => {
                return (d.side === "left") ? 0 : self.initialSizer.rowWidth;
            })
            .attr('cy', self.initialSizer.rowMidPoint)
            .attr("fill", function (d) {
                return "black";
            });

        let fieldRows = rowGroup.filter(d => d.rootKind !== 'Header');

        fieldRows.append('text')
            .text(d => d.name)
            .attr('class', "leftText")
            .attr('x', self.initialSizer.leftTextAnchorX)
            .attr('y', self.initialSizer.rowMidPoint)
            .attr('alignment-baseline', 'middle');

        fieldRows.append('text')
            .text(d => d.definition)
            .attr('class', "rightText")
            .attr('x', self.initialSizer.rightTextAnchorX)
            .attr('y', self.initialSizer.rowMidPoint)
            .attr('alignment-baseline', 'middle')
            .attr('text-anchor', 'end');

        fieldRows.filter(d => ['OBJECT','INTERFACE','UNION'].includes(d.rootKind))
            .selectAll('.sourceSelector')
            .data([{side: "left"},{side:"right"}])
            .enter()
            .append('circle')
            .attr('class', 'sourceSelector')
            .attr("r", 0)
            .attr('cx', d => {
                return (d.side === "left") ? 0 : self.initialSizer.rowWidth;
            })
            .attr('cy', self.initialSizer.rowMidPoint)
            .attr("fill", function (d) {
                return "white";
            });

        fieldRows.selectAll('rect')
            .filter(d => ['OBJECT','INTERFACE','UNION'].includes(d.rootKind))
            .attr('stroke',"#444")
            .attr('stroke-width', 3);

        this.add_input_decoration(rowGroup);

        rows.exit().remove();
    }

    _append_incoming_group(master) {

        master.selectAll('.incomingSelector')
            .data(this.sizing.targetPoints)
            .enter()
            .append('circle')
            .attr('class', "incomingSelector")
            .attr("r", 0)
            .attr("cx", d => 0)
            .attr("cy", d => 0)
            .attr("fill", function (d) {
                return "black";
            });

    }

    get_array() {
        // Create array copy
        let rowsArray = [{rootKind: "Header", name: this.node.trueName}];

        for (let field of this.node.fields.values()) {
            rowsArray.push(field);
        }
        if (! this.open) {
            rowsArray = rowsArray.filter(d => !(d.rootKind !== 'Header' && ! ['OBJECT','INTERFACE','UNION'].includes(d.rootKind) ));
        }
        rowsArray.sort((a, b) => {
            if (a.rootKind === 'Header') return -1; // Always first
            if (b.rootKind === 'Header') return 1;
            if (a.rootKind !== b.rootKind) {
                if (['OBJECT','INTERFACE','UNION'].includes(a.rootKind)) {
                    return 1;
                }
                else {
                    return -1;
                }
            }
            return a.name.localeCompare(b.name);
        });

        return rowsArray;
    }

    getSourceConnectionPoint(fieldName, destination) {
        let selector = d3.select(this.group)
            .selectAll('.sourceSelector')
            .filter(function(d) {
                return d3.select(this.parentNode).attr('filterName') === fieldName;
            });
        let candidates = this.getCandidates(selector);
        return d3utils.get_closest_point(destination, candidates);
    }

    getIncomingConnectionPoint(source) {
        let selector = d3.select(this.group)
            .selectAll('.incomingSelector');
        let candidates = this.getCandidates(selector);
        return d3utils.get_closest_point(source, candidates);
    }

    getEntityConnectionPoint(source) {
        let selector = d3.select(this.group)
            .selectAll('.entitySelector');
        let candidates = this.getCandidates(selector);
        return d3utils.get_closest_point(source, candidates);
    }

}
