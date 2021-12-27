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

const SPACER = 100;
export default class TreeWindow {
    constructor() {

    }

    build(container) {
        this.visible = true;
        this.parentDiv = container;
        this.parentDiv.selectAll('*').remove();
        let self = this;
        this.parentSvg = this.parentDiv.append("svg")
            .attr("width", '100%')
            .attr("height", '100%');
        this.parentSvg.attr("viewBox", [0, 0, this.current_width , this.current_height]);
        this.svg = this.parentSvg.append("g").attr("cursor", "grab").attr('stopHierarchy', "true");

        this.zoom = d3.zoom()
            .extent([[0, 0], [this.current_width, this.current_height]])
            .scaleExtent([0.5, 4])
            .on("zoom", zoomed);

        this.parentSvg.call(this.zoom)
            .on("dblclick.zoom", null);



        function zoomed() {
            self.currentZoom = d3.event.transform;
            self.svg.attr("transform", d3.event.transform);
        }

        this.simulation = d3.forceSimulation();
        let arrows = [
            {id: 'arrowhead', class: 'linkline regulararrow', reverse: false},
            {id: 'qarrowhead', class: 'linkline queryarrow', reverse: false},
            {id: 'marrowhead', class: 'linkline mutationarrow', reverse: false},
            {id: 'rarrowhead', class: 'linkline regulararrow', reverse: true}
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

        this.linkGroup = this.svg.append("g")
            .attr("class", "link");

        this.nodeGroup = this.svg.append("g")
            .attr("class", "node");

    }

    get_sizing(root) {
        // Get the width, by iterating through the levels, getting the widest level and then adding
        // padding
        let sizeMap = new Map();
        let initialXOffset = root.data.nvm.sizing.rowWidth;
        let finalXOffset = 0;
        for (let node of root.descendants()) {
            let depth = node.depth;
            let current = (sizeMap.has(depth)) ? sizeMap.get(depth) : 0;
            let thisWidth = node.data.nvm.sizing.rowWidth;
            if (thisWidth > current) {
                sizeMap.set(depth, thisWidth);
            }
            finalXOffset = node.data.nvm.sizing.rowWidth;
        }

        let width = 0;
        let previousWidth = 0;
        let cumulativeWidth = 0;
        let xOffset = 0;
        let xOffsetMap = {};
        for(let depth of sizeMap.keys()) {
            width += sizeMap.get(depth) + SPACER;
            if (depth === 0) {
                xOffsetMap[depth] = 0;
                continue;
            }
            let currentTier = sizeMap.get(depth);
            let previousTier = sizeMap.get(depth - 1);
            let previousOffset = xOffsetMap[depth - 1];
            let myOffset = (previousTier / 2) + SPACER + (currentTier / 2);
            xOffsetMap[depth] = previousOffset + myOffset;
        }
        let ratio = this.current_height / this.current_width;
        let height = width * ratio;
        height = (height < this.current_height) ? this.current_height : height;

        let vizWidth = width + initialXOffset + finalXOffset;
        let vizHeight = vizWidth * ratio;

        //this.parentSvg
        //    .attr("viewBox", [initialXOffset, 0, vizWidth, vizHeight])

        vizWidth = (vizWidth > this.current_width) ? vizWidth : this.current_width;
        vizHeight = (vizHeight > this.current_height) ? vizHeight : this.current_height;

        return {
            initialXOffset: initialXOffset,
            initialYOffset: 0,
            height: height,
            width: width,
            vizHeight: vizHeight,
            vizWidth: vizWidth,
            xOffsetMap: xOffsetMap
        };
    }

    get current_height() {
        return parseInt(this.parentSvg.style('height'), 10);
    }

    get current_width() {
        return parseInt(this.parentSvg.style('width'), 10);
    }
}