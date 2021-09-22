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

import {CONTRASTCOLOR} from "./VerticalMenu.js";
import StackableElementWithButtons from "./StackableElementWithButtons";
import GlobalViz from "../GlobalViz";

export default class SchemaStack extends StackableElementWithButtons  {
    constructor(width, height) {
        super(width, height, "SchemaStack", true);
        this.add_button_details(
            {
                altText: "Create New",
                position: 1,
                img: "images/buttons/create.png",
                fillColor: "#f5f5f5",
                strokeColor: "#acacac",
                clickFunction: function(){
                    let endpoint = GlobalViz.vis?.config.add_new_blank_schema();
                    GlobalViz.vis?.config.set_current_schema(endpoint.name)
                    GlobalViz.vis?.config_manager.verticalMenu.set_open_to(endpoint)
                    GlobalViz.vis?.config_manager.render({})
                }
            }
        )
    }

    get id() {
        return this.type;
    }

    buildFunction(group) {
        group.append('text')
            .text("Schemas")
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
                GlobalViz.vis?.config_manager.verticalMenu.set_open_to(null)
                if (current) {
                    d.contract();
                }
                else {
                    d.expand();
                }
                GlobalViz.vis?.config_manager.update({});
            })
        this.add_buttons(group, false)
    }

}
