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

import StackableElement from "./StackableElement";
import {BORDER, DURATION, MENURIGHT} from "./VerticalMenu";
import * as d3 from "d3";

export default class StackableElementWithButtons extends StackableElement {
    constructor(width, height, type, noprune) {
        super(width, height, type, noprune)
        this.buttonDetails = [];
    }

    add_button_details(buttonDetails) {
        this.buttonDetails.push(buttonDetails)
    }

    add_buttons(group, protect) {
        let miniMenuWidth = 0;
        for (let button of this.buttonDetails) {
            miniMenuWidth += this.height;
            this._add_minimenu_button({group: group, buttonDetails: button});
        }
        this.miniMenuWidth = miniMenuWidth;
        if (protect) {
            let mask = group.append('g')
                .attr("transform", d => {
                    return "translate(" + ~~(d.width - miniMenuWidth) + ",0)"
                })
                .attr('class', "mousepointer removeX")

            mask.append('rect')
                .attr('class', "sliderX")
                .attr('width', miniMenuWidth)
                .attr('height', d => d.height)
                .attr('fill', "white")
                .attr('stroke', "#fff")
                .attr('stroke-width', 1)
                .style('opacity', 0.8)
                .on('click', function () {
                    d3.select(this)
                        .transition()
                        .attr('width', 0)
                        .duration(DURATION)
                })
        }
    }

    reset(group) {
        group.selectAll('.sliderX')
            .transition()
            .attr('width', this.miniMenuWidth)
            .duration(DURATION)
    }

    _add_minimenu_button({group, buttonDetails}) {
        let {altText, position, img, fillColor, strokeColor, clickFunction} = buttonDetails;
        let button = group.append('g')
            .attr("transform", d => {
                let xOffset = position * d.height;
                return "translate(" + ~~(d.width - xOffset) + ",0)"
            })
            .attr('class', "mousepointer")

        button.append('rect')
            .attr('width', d => d.height)
            .attr('height', d => d.height)
            .attr('fill', "#fff")
            .attr('opacity', 0)

        let image = button.append("svg:image")
            .attr("xlink:href", img)
            .attr('class', "mousepointer")
            .attr("x", BORDER / 2)
            .attr("y", BORDER / 2)
            .attr("height", this.height)
            .attr("width", this.height);

        button.append("svg:title")
            .text(altText);

        button
            .on('mouseenter', function() {
                d3.select(this).selectAll('rect').attr('opacity', 0.3)
            })
            .on('mouseleave', function() {
                d3.select(this).selectAll('rect').attr('opacity', 0)
            })
            .on('click', d => {
            image.transition()
                .style('opacity', 0)
                .duration(DURATION / 2)
                .on("end", () => {
                    image.transition()
                        .style('opacity', 1)
                        .duration(DURATION / 2)
                        .on("end", () => {
                            clickFunction(d)
                        })
                })
        })



    }
}
