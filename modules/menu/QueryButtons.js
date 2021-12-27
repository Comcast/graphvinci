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

import BasicButton from "./BasicButton";
import GlobalViz from "../GlobalViz";
import {Separator} from "./HMenu";

export default class QueryButtons {
    constructor(height, defaultWidth) {
        this.height = height;
        this.defaultWidth = defaultWidth;
        this.play_disabled = false;
    }

    get_buttons() {
        let data = [];
        data.push(new BasicButton(this.height, this.defaultWidth, "reset", "images/buttons/reset.png", "Reset Query", this.reset));
        data.push(new Separator(20, this.height, "Group"));
        if (this.play_disabled) {
            data.push(new BasicButton(this.height, this.defaultWidth, "run", "images/buttons/pending.png", "Query is pending", this.do_nothing));
        }
        else {
            data.push(new BasicButton(this.height, this.defaultWidth, "run", "images/buttons/play.png", "Run the query", this.run));
        }
        data.push(new Separator(6, this.height, "Entity"));
        data.push(new BasicButton(this.height, this.defaultWidth, "prettify", "images/buttons/prettify.png", "Prettify the query", this.prettify));
        data.push(new Separator(6, this.height, "Entity"));
        data.push(new BasicButton(this.height, this.defaultWidth, "vars", "images/buttons/json.png", "Add vars", this.add_vars));
        data.push(new Separator(20, this.height, "Group"));
        data.push(new BasicButton(this.height, this.defaultWidth, "save", "images/buttons/history.png", "Save the query", this.add_search));
        return data;
    }

    add_search() {
        let current = GlobalViz.vis?.query_window.contents;
        GlobalViz.vis?.history_manager.save(current);
        GlobalViz.vis?.query_top_window.update_on_save();
    }

    delete_search() {

    }

    disable_play() {
        this.play_disabled = true;
    }

    enable_play() {
        this.play_disabled = false;
    }

    do_nothing() {
        console.log("Play button is disabled awaiting query response")
    }

    reset() {
        GlobalViz.vis?.reset_viz();
    }

    add_vars() {
        GlobalViz.vis?.toggle_vars();
    }

    prettify() {
        GlobalViz.vis?.query_window.prettify();
    }
    run() {
        GlobalViz.vis?.query_bottom_window.play();
    }
}
