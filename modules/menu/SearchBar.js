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
import GlobalViz from "../GlobalViz";

export default class SearchBar {
    constructor(parentDiv) {
        this.parentDiv = parentDiv;
        this.needsClearing = false;
    }

    build() {
        /*
        Disabling search until it can be worked some more
         */
        return;
        let self = this;
        this.searchContainer = this.parentDiv.append('div')
            .attr('class', "textsearch")
            .append('input')
            .attr('class', "searchtext")
            .attr('type', "text")
            .attr('placeholder', "Search the graph")
            .on('keyup', function() {
                if (this.value.length < 2) {
                    self.clear(false);
                }
                else {
                    self.needsClearing = true;
                    self.filter(this.value);
                }
            });
    }

    filter(textString) {
        let needsKick = false;
        d3.selectAll('.nodeEntry')
            .classed('quiet', d => {
                let hasString = this._filter_node(d, textString);
                d.isTextFiltered = hasString;
                if (d.nvm.open !== !hasString) {
                    needsKick = true;
                    d.nvm.open = !hasString;
                    d.nvm.build();
                }
                return hasString;
            });
        d3.selectAll('.edgeline')
            .classed('quiet', () => {
                return true;
            });
        if (needsKick) {
            GlobalViz.vis?.graph.kick();
        }
    }

    clear(clearText) {
        if (! this.needsClearing) return;
        this.needsClearing = false;
        if (clearText) {
            this.searchContainer.each(function() {
                this.value = "";
            })
        }
        let needsKick = false;
        d3.selectAll('.nodeEntry')
            .classed('quiet', d => {
                d.isTextFiltered = false;
                if (d.nvm.open !== false) {
                    needsKick = true;
                    d.nvm.open = false;
                    d.nvm.build();
                }
                return false;
            });
        d3.selectAll('.edgeline')
            .classed('quiet', () => {
                return false;
            });
        if (needsKick) {
            GlobalViz.vis?.graph.kick();
        }
    }

    _filter_node(node, textString) {
        let normString = textString.toUpperCase();
        if (node.id.toUpperCase().includes(normString)) {
            return false;
        }
        if (typeof(node.fieldKeys) === 'undefined' || node.fieldKeys === null) {
            return true;
        }
        for (let field of node.fieldKeys) {
            if (field.toUpperCase().includes(normString)) {
                return false;
            }
        }
        return true;
    }

}
