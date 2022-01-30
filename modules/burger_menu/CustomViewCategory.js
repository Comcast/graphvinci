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

import StackableElement from "./StackableElement.js";
import {BORDER, CONTRASTCOLOR, DURATION} from "./VerticalMenu";
import * as d3 from "d3";
import GlobalViz from "../GlobalViz";

export default class CustomViewCategory extends StackableElement {
    constructor(width, height, type, category) {
        super(width, height, type);
        this.category = category;
    }

    get id() {
        return "CustomViewCategory_" + this.category;
    }

    get_children_count(group) {
        let data = group?.data()[0];
        if (data && data.children && Array.isArray(data.children)) {
            return data.children.length;
        }
        return 0;
    }

    buildFunction(group) {
        let data = group?.data()[0];
        let child_count = (data && data.children && Array.isArray(data.children)) ? data.children.length : 0;
        group.append('text')
            .text(this.category)
            .attr('x', d => d.width / 2)
            .attr('y', d => d.height / 2)
            .attr('alignment-baseline', 'middle')
            .attr('text-anchor', 'middle')
            .attr('stroke', CONTRASTCOLOR)

        if (child_count < 2) {
            return;
        }
        let button = group.append('g')
            .attr("transform", d => {
                return "translate(" + (d.width - d.height) + ",0)"
            })
            .attr('class', "mousepointer")

        let rect = button.append('rect')
            .attr('class', "cycleshader")
            .attr('width', d => d.height)
            .attr('height', d => d.height)
            .attr('fill', "#f00")
            .attr('opacity', () => {
                return (GlobalViz.vis.cycle) ? 0.3 : 0;
            })

        let image = button.append("svg:image")
            .attr("xlink:href", "images/buttons/cycle.png")
            .attr('class', "mousepointer")
            .attr("x", BORDER / 2)
            .attr("y", BORDER / 2)
            .attr("height", this.height)
            .attr("width", this.height);

        button.append("svg:title")
            .text("Cycle through the views in this category");

        button
            .on('click', d => {
                image.transition()
                    .style('opacity', 0)
                    .duration(DURATION / 2)
                    .on("end", () => {
                        image.transition()
                            .style('opacity', 1)
                            .duration(DURATION / 2)
                            .on("end", () => {
                                if (GlobalViz.vis.cycle) {
                                    GlobalViz.vis.stop_cycle();
                                } else {
                                    rect.attr('opacity', 0.3)
                                    GlobalViz.vis?.graph.re_parent();
                                    let cycle = [];
                                    for (let cv of d.children) {
                                        cycle.push(GlobalViz.vis?.concierge.retrieve(cv.name, cv.category))
                                    }
                                    if (cycle.length > 0) {
                                        GlobalViz.vis?.graph.cycle_viz(cycle)
                                    }
                                }

                            })
                    })
            })
    }
    
}
