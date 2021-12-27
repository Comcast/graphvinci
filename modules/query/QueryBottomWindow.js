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

import FlippableWindow from "./FlippableWindow";
import ResultsTreeWindow from "./ResultsTreeWindow";
import QueryConverter from "./QueryConverter";
import {bottomStates} from "../menu/QueryMenu";
import ResponseJsonWindow from "./ResponseJsonWindow";
import GlobalViz from "../GlobalViz";
import {buildClientSchema, printSchema} from "graphql";

export default class QueryBottomWindow extends FlippableWindow {

    constructor() {
        let views = [{
            name: "tree",
            image: "images/buttons/tree.png",
            description: "Response Tree View",
            type: bottomStates.Tree,
            instance: new ResultsTreeWindow()
        }, {
            name: "json",
            image: "images/buttons/json.png",
            description: "Response JSON",
            type: bottomStates.Json,
            instance: new ResponseJsonWindow()
        }]
        super(views);
        this.converter = new QueryConverter();
    }

    build(container) {
        super.build(container);
    }

    play() {
        let self = this;
        let queryInfo = GlobalViz.vis?.query_window.contents;
        let queryGraph = GlobalViz.vis?.query_top_window.currentTreeData;
        if (! GlobalViz.vis?.config.is_search_possible()) {
            let message = "Querying is disabled for this endpoint.  Create a new endpoint to unlock"
            let errorData = self.converter.error(queryGraph, queryInfo.schema, message)
            self.update_results(errorData)
            self.flip_to(bottomStates.Json)
            return;
        }
        if (!queryInfo.error) {
            GlobalViz.vis?.history_manager.save(queryInfo);
            GlobalViz.vis?.query_top_window.update_history_if_shown()
            let query = queryInfo.query;
            let variables = queryInfo.variables || {};
            GlobalViz.vis?.horizontalMenu.disable_play_button();
            GlobalViz.vis?.proxy_manager.send_query(query, variables).then(data => {
                let nodeEdgeData = self.converter.nodes_and_edges(queryGraph, queryInfo.schema, data);
                self.update_results(nodeEdgeData);
                if (data["errors"] && data["errors"][0]) {
                    self.flip_to(bottomStates.Json)
                }
                GlobalViz.vis?.horizontalMenu.enable_play_button();
            }).catch(error => {
                let errorData = self.converter.error(queryGraph, queryInfo.schema, error.message)
                self.update_results(errorData)
                GlobalViz.vis?.horizontalMenu.enable_play_button();
                self.flip_to(bottomStates.Json)
                console.log(error);
            });
        }

    }

    update_results(nodeEdgeData) {
        this.currentTreeData = nodeEdgeData;
        super.update(this.currentTreeData)
    }

}
