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
import {CONTRASTCOLOR} from "./VerticalMenu.js";
import Visualizer from "../Visualizer";

export default class ExpandableStack extends StackableElement  {
    constructor(width, height, type, text, menu_update_func) {
        super(width, height, type, true);
        this.menu_update_func = menu_update_func;
        this.text = text;
    }

    get id() {
        return this.type;
    }

    buildFunction(group) {
        group.append('text')
            .text(this.text)
            .attr('x', d => d.width / 2)
            .attr('y', d => d.height / 2)
            .attr('alignment-baseline', 'middle')
            .attr('text-anchor', 'middle')
            .attr('stroke', CONTRASTCOLOR)

        group.append('rect')
            .attr('width', d => this.width)
            .attr('height', d => this.height)
            .attr('opacity', 0)
            .attr('fill', "#fff")
            .classed('mousepointer', true)
            .on('click', d => {
                let current = d.expanded;
                Visualizer.graph.verticalMenu.set_open_to(null);
                if (current) {
                    d.contract();
                }
                else {
                    d.expand();
                }
                this.menu_update_func();
            })
    }

}
