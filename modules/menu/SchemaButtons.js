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

import BasicButton from "./BasicButton";
import Visualizer from "../Visualizer";
import * as d3 from "d3";
import {states} from "../config/DomainState";
import {Separator} from "./HMenu";

export default class SchemaButtons {
    constructor(height, defaultWidth) {
        this.height = height;
        this.defaultWidth = defaultWidth;
    }

    get_buttons() {
        let data = [];
        data.push(new BasicButton(this.height, this.defaultWidth, "reset", "images/buttons/reset.png", "Reset gee-viz", this.reset));
        data.push(new Separator(20, this.height, "Group"));
        data.push(new BasicButton(this.height, this.defaultWidth, "stick", "images/buttons/stick.png", "Pin all entities", this.stick));
        data.push(new Separator(6, this.height, "Entity"));
        data.push(new BasicButton(this.height, this.defaultWidth, "unstick", "images/buttons/unstick.png", "Release all entities", this.unstick));
        data.push(new Separator(20, this.height, "Group"));
        data.push(new BasicButton(this.height, this.defaultWidth, "kaboom", "images/buttons/showhide.png", "Explode the graph", this.kaboom));
        data.push(new Separator(6, this.height, "Entity"));
        data.push(new BasicButton(this.height, this.defaultWidth, "unkaboom", "images/buttons/ungrenade.png", "Return to domain view", this.unkaboom));
        data.push(new Separator(6, this.height, "Entity"));
        data.push(new BasicButton(this.height, this.defaultWidth, "nothing", "images/buttons/nothingness.png", "Remove all domains", this.nothing));
        data.push(new Separator(20, this.height, "Group"));
        data.push(new BasicButton(this.height, this.defaultWidth, "position", "images/buttons/views.png", "Save This View", this.position));
        data.push(new Separator(6, this.height, "Entity"));
        data.push(new BasicButton(this.height, this.defaultWidth, "grenadesave", "images/buttons/saveglobal.png", "Set the default kaboom for this endpoint", this.grenadesave));
        if (Visualizer.concierge.default_is_override()) {
            data.push(new Separator(6, this.height, "Entity"));
            data.push(new BasicButton(this.height, this.defaultWidth, "grenadesave", "images/buttons/clearglobal.png", "Remove the default kaboom for this endpoint", this.cleardefault));
        }
        data.push(new Separator(20, this.height, "Group"));

        return data;
    }

    position() {
        Visualizer.concierge_push.flip('Regular');
    }

    grenadesave() {
        Visualizer.concierge_push.flip('Grenade');
    }

    cleardefault() {
        Visualizer.concierge.clearDefault();
    }

    reset() {
        Visualizer.reset_viz();
    }

    image() {
        let style = "\n";
        let requiredSheets = ['app.css']; // list of required CSS
        for (let i = 0; i < document.styleSheets.length; i++) {
            let sheet = document.styleSheets[i];
            if (sheet.href) {
                let sheetName = sheet.href.split('/').pop();
                if (requiredSheets.indexOf(sheetName) != -1) {
                    let rules = sheet.rules;
                    if (rules) {
                        for (let j = 0; j < rules.length; j++) {
                            style += (rules[j].cssText + '\n');
                        }
                    }
                }
            }
        }

        let svg = Visualizer.graph.parentSvg;
        let img = new Image();
        let serializer = new XMLSerializer();
        svg.insert('defs', ":first-child");
        d3.select("svg defs")
            .append('style')
            .attr('type', 'text/css')
            .html(style);


        // generate IMG in new tab
        let svgStr = serializer.serializeToString(svg.node());
        img.src = 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(svgStr)));
        window.open().document.write('<img modules="' + img.src + '"/>');
    }

    stick() {
        Visualizer.graph.stick();
    }

    unstick() {
        Visualizer.graph.unstick();
    }

    kaboom() {
        Visualizer.domainState.clear_excluded_nodes();
        Visualizer.graph.re_parent();
        Visualizer.graph.unstick();
        for (let domain of Visualizer.domainState.domain_list) {
            Visualizer.domainState.set_domain_state(domain, states.NODES);
        }
        let data = Visualizer.concierge.retrieve("ALL", "DVIEW");
        if (data) {
            setTimeout(() => Visualizer.graph.update_viz(data), 2500);
        }
    }

    unkaboom() {
        Visualizer.graph.reset_zoom();
        Visualizer.domainState.clear_excluded_nodes();
        for (let domain of Visualizer.domainState.domain_list) {
            Visualizer.domainState.set_domain_state(domain, states.MINIMIZED);
        }
    }

    nothing() {
        Visualizer.domainState.clear_excluded_nodes();
        for (let domain of Visualizer.domainState.domain_list) {
            Visualizer.domainState.set_domain_state(domain, states.REMOVED);
        }
    }

}
