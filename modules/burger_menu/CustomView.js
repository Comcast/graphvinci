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

import StackableElement from "./StackableElement.js";
import {CONTRASTCOLOR, MENURIGHT, BORDER, DURATION} from "./VerticalMenu";
import Visualizer from "../Visualizer";
import * as d3 from "d3";
import d3utils from "../utils/D3Utils";

export default class CustomView extends StackableElement {
    constructor(width, height, type, category, name) {
        super(width, height, type, false);
        this.category = category;
        this.name = name;
        this.miniMenuWidth = MENURIGHT / 3;
    }

    get id() {
        return "CustomView_" + this.category + "_" + this.name;
    }

    stateFunction(group) {
        group.selectAll('.sliderX')
            .transition()
            .attr('width', MENURIGHT - BORDER)
            .duration(DURATION)
    }

    buildFunction(group) {
        let self = this;
        group.on('mouseleave', () => {
            this.stateFunction(group)
        })
        let fGroup = group.append('g')
            .on('click', (d) => {
                Visualizer.graph.re_parent();
                let data = Visualizer.concierge.retrieve(d.name, d.category);
                if (data) {
                    Visualizer.graph.update_viz(data);
                }
            })


        fGroup.append('rect')
            .attr('width', d => d.width)
            .attr('height', d => d.height)
            .attr('class', 'mousepointer')
            .attr('fill', '#fff')
            .style('opacity', 0);

        fGroup.append('text')
            .text(this.name)
            .attr('class', 'mousepointer')
            .attr('x', d => d.width / 2 - (MENURIGHT / 2))
            .attr('y', d => d.height / 2)
            .attr('alignment-baseline', 'middle')
            .attr('text-anchor', 'middle')
            .attr('stroke', CONTRASTCOLOR)

        this.add_minimenu_button(group, "Delete",this.miniMenuWidth, "images/buttons/delete.png", "#ff9393", "#ff0000",function (d) {
            Visualizer.concierge.remove(d.name, d.category);
            self.pruned = true;
            Visualizer.graph.verticalMenu.update_state();
        })
        this.add_minimenu_button(group, "Save current state",this.miniMenuWidth * 2, "images/buttons/save.png", "#f5f5f5", "#acacac",function (d) {
            let posData = Visualizer.graph.posData();
            posData.name = d.name;
            posData.category = d.category;
            Visualizer.concierge.save(posData.name, posData.category, posData);
            Visualizer.graph.verticalMenu.update_state();
        })
        this.add_minimenu_button(group, "Copy to clipboard", this.miniMenuWidth * 3, "images/buttons/export.png", "#f5f5f5", "#acacac", function (d) {
            d3utils.copyTextToClipboard(btoa(JSON.stringify(Visualizer.graph.posData(), null, 2)))
        })

        let mask = group.append('g')
            .attr("transform", d => {
                return "translate(" + ~~(d.width - MENURIGHT) + ",0)"
            })
            .attr('class', "mousepointer removeX")

        mask.append('rect')
            .attr('class', "sliderX")
            .attr('width', this.miniMenuWidth - BORDER)
            .attr('height', d => d.height - BORDER)
            .attr('rx', BORDER / 2)
            .attr('x', BORDER / 2)
            .attr('y', BORDER / 2)
            .attr('fill', "white")
            .attr('stroke', "#fff")
            .attr('stroke-width', 1)
            .style('opacity', 0.8)
            .on('click', function (d) {
                d3.select(this)
                    .transition()
                    .attr('width', 0)
                    .duration(DURATION)
            })


    }

    add_minimenu_button(group, altText, xOffset, img, fillColor, strokeColor, clickFunction) {
        let x = '\u2716';
        let button = group.append('g')
            .attr("transform", d => {
                return "translate(" + ~~(d.width - xOffset) + ",0)"
            })
            .attr('class', "mousepointer ")

        button.append('rect')
            .attr('width', this.miniMenuWidth - BORDER)
            .attr('height', d => d.height - BORDER)
            .attr('rx', BORDER / 2)
            .attr('x', BORDER / 2)
            .attr('y', BORDER / 2)
            .attr('fill', fillColor)
            .attr('stroke', strokeColor)
            .attr('stroke-width', 1)

        let bwidth = this.miniMenuWidth - BORDER;
        let image = button.append("svg:image")
            .attr("xlink:href", img)
            .attr('class', "mousepointer")
            .attr("x", BORDER / 2)
            .attr("y", BORDER / 2)
            .attr("height", (d) => d.height - BORDER)
            .attr("width", bwidth);

        button.append("svg:title")
            .text(altText);

        button.on('click', d => {
            image.transition()
                .style('opacity', 0)
                .duration(500)
                .on("end", () => {
                    image.transition()
                        .style('opacity', 1)
                        .duration(200)
                        .on("end", () => {
                            clickFunction(d)
                        })
                })
        })


    }

}
