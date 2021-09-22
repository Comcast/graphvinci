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

import {CONTRASTCOLOR} from "./VerticalMenu.js";
import StackableElementWithButtons from "./StackableElementWithButtons";
import GlobalViz from "../GlobalViz";
const MAX_CHARS = 13;

export default class AuthConfig extends StackableElementWithButtons  {
    constructor(width, height, auth) {
        super(width, height, "SchemaConfig", true);
        this.auth = auth;
        this.add_button_details(
            {
                altText: "Delete " + auth.name,
                position: 1,
                img: "images/buttons/delete_red.png",
                fillColor: "#f5f5f5",
                strokeColor: "#acacac",
                clickFunction: function(d){
                    GlobalViz.vis?.config.delete_auth(auth)
                    GlobalViz.vis?.config_manager.verticalMenu.set_open_to(GlobalViz.vis?.config.get_fallback_auth(), true)
                    GlobalViz.vis?.config_manager.render({})
                }
            }
        )
        this.add_button_details(
            {
                altText: "Clone " + auth.name,
                position: 2,
                img: "images/buttons/clone.png",
                fillColor: "#f5f5f5",
                strokeColor: "#acacac",
                clickFunction: function(d){
                    let cloned = GlobalViz.vis?.config.clone_auth(auth);
                    GlobalViz.vis?.config_manager.verticalMenu.set_open_to(cloned)
                    GlobalViz.vis?.config_manager.render({})
                }
            }
        )

    }

    get id() {
        return this.auth.name;
    }

    buildFunction(group) {
        group.on('mouseleave', d => {
            this.reset(group)
        })
        let schema = this.auth;
        let text = group.append('text')
            .text(this.auth.name)
            .attr('x', d => d.height * 0.7 )
            .attr('y', d => d.height / 2)
            .attr('alignment-baseline', 'middle')
            .attr('text-anchor', 'start')
            .attr('stroke', CONTRASTCOLOR)
            .attr('font-size', "0.9em")

        let rect = group.append('rect')
            .attr('width', d => this.width)
            .attr('height', d => this.height)
            .attr('opacity', 0)
            .attr('fill', "#fff")
            .classed('mousepointer', true)
            .on('click', d => {
                GlobalViz.vis?.config_manager.verticalMenu.set_open_to(this.auth)
                GlobalViz.vis?.config_manager.update()
            })
        if (this.auth.name.length > MAX_CHARS) {
            let abbreviated = this.auth.name.slice(0,MAX_CHARS) + "...";
            text.text(abbreviated)
            rect.append("svg:title")
                .text(this.auth.name);
        }
        this.add_buttons(group, true)
    }

}
