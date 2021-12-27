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
import QueryTreeWindow from "./QueryTreeWindow";
import ASTConverter from "../schema/ASTConverter";
import GlobalViz from "../GlobalViz";
import {topStates} from "../menu/QueryMenu"
import QueryMetaWindow from "./QueryMetaWindow";
import QueryHistoryWindow from "./QueryHistoryWindow";

export default class QueryTopWindow extends FlippableWindow {

    constructor() {
        let views = [{
            name: "tree",
            image: "images/buttons/tree.png",
            description: "Query Tree View",
            type: topStates.Tree,
            instance: new QueryTreeWindow()
        }, {
            name: "meta",
            image: "images/buttons/json.png",
            description: "Query Meta Data",
            type: topStates.Meta,
            instance: new QueryMetaWindow()
        }, {
            name: "saved",
            image: "images/buttons/history.png",
            description: "Saved Searches",
            type: topStates.Saved,
            instance: new QueryHistoryWindow()
        }]
        super(views);
        this.astConverter = new ASTConverter();
    }

    build(container) {
        super.build(container);
    }

    update_results_from_ast(currentAst) {
        this.currentTreeData = this.astConverter.nodes_and_edges(currentAst, GlobalViz.vis?.schema);
        super.update(this.currentTreeData)
    }

    update_history_if_shown() {
        super.refresh();
    }

    update_on_save(revert_millis) {
        this.flip_to(topStates.Saved, revert_millis)
    }
}
