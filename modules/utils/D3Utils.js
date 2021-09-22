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
import ColorMapper from "./ColorMapper.js";

class D3Utils {
    constructor() {
        this.color = d3.scaleOrdinal(d3.schemeSet3);
        this.altColor = d3.scaleOrdinal(d3.interpolateSpectral)
        this.colorMapper = new ColorMapper();
    }

    /*
    Thanks to stack overflow.  Not using navigator.clipboard since this may not be HTTPS
     */
    copyTextToClipboard(text) {
        let textArea = document.createElement("textarea");
        textArea.value = text;

        // Avoid scrolling to bottom
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        document.execCommand('copy');
        document.body.removeChild(textArea);
    }

    get_node_color(node) {
        return (typeof(node.domain) === 'undefined' || node.domain == null) ? this.get_color(node.id) : this.get_color(node.domain);
        /*
        if (node.type === 'Entity') {
            return (typeof(node.domain) === 'undefined' || node.domain == null) ? this.get_color(node.id) : this.get_color(node.domain);
        }
        return "#ddd";

         */
    }

    get_color(value) {
        /*
        Switching to a more heavyweight color picker
         */
        return this.colorMapper.get_color(value);
    }
    
    get_closest_point(point, candidates) {

        /*
        Simple function for getting the closest point from a (SMALL - there are better ways of doing this against
        pathways/curves/things with large numbers of points) list of candidates
         */
        if (! point) {
           //return 0;
        }
        let min = null;
        let minDistance = null;
        for (let candidate of candidates) {
            let distance = Math.hypot(point.x - candidate.x,point.y - candidate.y);
            if (minDistance == null || distance < minDistance) {
                min = candidate;
                minDistance = distance;
            }
        }
        return min;
    }

    getXYFromTranslate(element) {
        let detail = element.getAttribute('transform');
        if (typeof (detail) === 'undefined' || detail == null || detail === "") return [0, 0];
        let split = detail.split(",");
        let x = ~~split[0].split("(")[1];
        let y = ~~split[1].split(")")[0];
        return [x, y];
    }

    get_circle_XY(circle) {
        //let coords = {x: 0, y: 0};
        return this._recursive_group_xy(circle.parentNode, {x: 1 * circle.getAttribute('cx'), y: 1 * circle.getAttribute('cy')})
    }

    /*
    I hate recursion.  And now I hate JavaScript
     */
    _recursive_group_xy(group, coords) {
        let [px, py] = this.getXYFromTranslate(group);
        coords.x = coords.x + px;
        coords.y = coords.y + py;
        if (group.parentNode instanceof SVGGElement && group.parentNode.getAttribute('stopHierarchy') !== "true") {
            return this._recursive_group_xy(group.parentNode, coords);
        }
        else {
            return coords;
        }
    }
}

export default new D3Utils();