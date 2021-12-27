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

import GlobalViz from "../GlobalViz";

const storage_key = "Graphvinci.historysearch.v1";

export default class QueryHistoryWindow {

    constructor() {
        this.current_search = localStorage.getItem(storage_key);
    }

    build(container, filter) {
        filter = (filter) ? filter : this.current_search;
        let self = this;
        this.visible = true;
        container.selectAll('*').remove();
        this.maindiv = container.append('div')
            .attr('class', "vizhistory")

        this.title = this.maindiv.append('div')
            .attr('class', "vhtitle")
            .html('Query History')

        this.search = this.title.append('input')
            .attr('class', "historysearch")
            .attr('type', "text")
            .attr('placeholder', "Search...")
            .property('value', this.current_search)
            .on('keyup', function() {
                self._save_search(this.value)
                self._rebuild_list(this.value)
            });

        this.contents = this.maindiv.append('div')
            .attr('class', "vhcontents")
        this._rebuild_list(filter);
    }

    _save_search(search) {
        this.current_search = search;
        localStorage.setItem(storage_key, search);
    }

    _rebuild_list(filter) {
        this.contents.selectAll('*').remove();
        // This is pretty lazy.  I should do this dynamically
        let index = 0;
        for (let d of GlobalViz.vis?.history_manager.get_history(filter)) {
            this.contents.append('div')
                .attr('class', (d, index) => (index % 2) ? 'mousepointer vhentry vhentry-odd' : 'mousepointer vhentry vhentry-even')
                .html(d.preview)
                .on('mouseover', () => {
                    GlobalViz.vis?.query_window.swap(d);
                })
                .on('mouseout', () => {
                    GlobalViz.vis?.query_window.unswap();
                })
                .on('click', () => {
                    GlobalViz.vis?.history_manager.update_last_reference(d);
                    GlobalViz.vis?.query_window.unstash();
                })
            this.contents.append('div')
                .attr('class', 'mousepointer vhentry-delete')
                .html('&nbsp')
                .on('click', () => {
                    GlobalViz.vis?.history_manager.delete(d);
                    GlobalViz.vis?.query_top_window.update_on_save();
                })
            index++;
        }
    }

    update(nodeEdgeData) {
        // This only covers updates from the AST
    }

    refresh() {
        this._rebuild_list(this.current_search);
    }

}
