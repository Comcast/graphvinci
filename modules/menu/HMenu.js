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

import * as d3 from "d3";
import BasicButton from "./BasicButton.js";
import ModeButton from "./ModeButton";
export const DEFAULTHEIGHT = 40;
export const DEFAULTWIDTH = 40;
const BORDER = 4;

export default class HMenu {
    constructor(parentDiv) {
        this.parentDiv = parentDiv;
        this.lastOffset = 0;
    }

    build() {
        this.parentDiv.selectAll('*').remove();
        this.svg = this.parentDiv.append('svg')
            .attr('height', this.data.height)
            .attr('width', this.data.width);

        let xOffset = 0;
        this.svg.selectAll('.menuEntry')
            .data(this.data.entries)
            .enter()
            .append('g')
            .attr('class', d => "menuEntry " + d.className)
            .attr("transform", d => {
                let translate = "translate(" + xOffset + ",0)";
                xOffset += d.width;
                return translate;
            });
        this._build_rows();
    }

    _build_rows() {
        let buttons = this.parentDiv.selectAll('.menuEntry').filter(d => d instanceof BasicButton || d instanceof ModeButton);
        this._build_basic(buttons);
        this.parentDiv.selectAll('.menuEntry')
            .filter(d => d instanceof Separator && d.type === "Group")
            .append('line')
            .attr('x1', d => d.width / 2)
            .attr('y1', 0)
            .attr('x2', d => d.width / 2)
            .attr('y2', d => d.height)
            .attr('stroke-width', d => (d.lineWidth) ? d.lineWidth : d.lineWidth);
        this.svg.append('rect')
            .attr('class', "ghost")
            .attr('rx', 6)
            .attr('height', DEFAULTHEIGHT)
            .attr('width', DEFAULTWIDTH)
            .attr('stroke', "#9a9a9a")
            .attr('stroke-width', 5)
            .attr('fill', "none")
            .attr("transform", () => {
                return "translate(" + this.lastOffset + ",0)";
            });
        this.update_state();
    }

    _build_basic(menuEntries) {
        let onColor = "#ffffff";
        let baseColor = "#f6f6f6";

        let bHeight = DEFAULTHEIGHT * 0.75;
        let bwidth = DEFAULTWIDTH * 0.75;
        menuEntries.append('rect')
            .attr('rx', 6)
            .attr('height', DEFAULTHEIGHT)
            .attr('width', DEFAULTWIDTH)
            .attr('fill', baseColor);


        menuEntries.append('rect')
            .attr('rx', 4)
            .attr('height', DEFAULTHEIGHT - BORDER)
            .attr('width', DEFAULTWIDTH - BORDER)
            .attr('class', "buttonborder")
            .attr('opacity', 0.8)
            .attr('x', BORDER / 2)
            .attr('y', BORDER / 2)
            .attr('fill', baseColor);


        menuEntries.append("svg:image")
            .attr("xlink:href", function (d) {
                return d.img;
            })
            .attr('class', "hmenuimg mousepointer")
            .attr("height", DEFAULTHEIGHT)
            .attr("width", DEFAULTWIDTH);
        menuEntries.append("svg:title")
            .text(d => d.alt);

        menuEntries
            .on('mouseenter', function (d) {
                d3.select(this).selectAll('.buttonborder')
                    .attr('fill', onColor)
            })
            .on('mouseleave', function (d) {
                d3.select(this).selectAll('.buttonborder')
                    .attr('fill', baseColor)
            });

        menuEntries
            .filter(d => typeof (d.func) === 'function' )
            .on('click', d => d.func());


    }

    update_state(state) {
        let found = false;
        let xOffset = 0;
        this.svg.selectAll('.menuEntry').each(d => {
            if (found) return;
            if (d instanceof ModeButton && d.type === state) {
                found = true;
                return;
            }
            xOffset += d.width;
        });
        this.lastOffset = xOffset;
        this.svg.selectAll('.ghost')
            .transition()
            .attr("transform", d => {
                return "translate(" + xOffset + ",0)";
            })
            .duration(350);
    }
}

export class Separator {
    constructor(width, height, type, lineWidth) {
        this.width = width;
        this.height = height;
        this.type = type;
        this.lineWidth = lineWidth;
    }
}

export class MenuData {
    constructor() {
        this.entries = [];
    }

    add_entry(dropDown) {
        this.entries.push(dropDown);
    }

    get height() {
        let height = 0;
        for (let entry of this.entries) {
            if (entry.height > height) {
                height = entry.height;
            }
        }
        return height;
    }

    get width() {
        let width = 0;
        for (let entry of this.entries) {
            width += entry.width;
        }
        return width;
    }
}
