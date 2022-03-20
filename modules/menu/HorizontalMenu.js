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

import SchemaButtons from "./SchemaButtons";
import ModeButton from "./ModeButton";
import SearchBar from "./SearchBar";
export const DEFAULTHEIGHT = 40;
export const DEFAULTWIDTH = 40;
import {states} from "../Constants"
import GlobalViz from "../GlobalViz";
import HMenu, {MenuData, Separator} from "./HMenu";
import QueryButtons from "./QueryButtons";

export default class HorizontalMenu extends HMenu {
    constructor(parentDiv) {
        super(parentDiv)
        this.rebuild = false;
        this.schemaButtons = new SchemaButtons(DEFAULTHEIGHT, DEFAULTWIDTH);
        this.queryButtons = new QueryButtons(DEFAULTHEIGHT, DEFAULTWIDTH);
        this.lastOffset = 0;
    }

    build() {
        GlobalViz.vis?.concierge_push.destroy();
        this._get_menu_data();
        super.build()

        if (GlobalViz.vis?.state === states.Schema) {
            this.searchBar = new SearchBar(this.parentDiv);
            this.searchBar.build();
        }
    }

    disable_play_button() {
        this.queryButtons.disable_play();
        Visualizer.horizontalMenu.build();
    }

    enable_play_button() {
        this.queryButtons.enable_play();
        Visualizer.horizontalMenu.build();
    }

    update_state() {
        super.update_state(GlobalViz.vis?.state)
    }

    _get_menu_data() {
        this.data = new MenuData();
        let self = this;
        this.data.add_entry(new Separator(8, DEFAULTHEIGHT, "Entity"));
        this.data.add_entry(new ModeButton(DEFAULTHEIGHT, DEFAULTWIDTH, states.Setup, "images/buttons/setup.png", "Setup Endpoint", () => self._switch_mode(states.Setup)));
        if (GlobalViz.vis?.config.schemaReady) {
            this.data.add_entry(new Separator(6, DEFAULTHEIGHT, "Entity"));
            this.data.add_entry(new ModeButton(DEFAULTHEIGHT, DEFAULTWIDTH, states.Schema, "images/buttons/schema.png", "Schema Browser", () => self._switch_mode(states.Schema)));
            this.data.add_entry(new Separator(6, DEFAULTHEIGHT, "Entity"));
            this.data.add_entry(new ModeButton(DEFAULTHEIGHT, DEFAULTWIDTH, states.Editor, "images/buttons/editor.png", "Query Builder", () => self._switch_mode(states.Editor)));
        }
        this.data.add_entry(new Separator(34, DEFAULTHEIGHT, "Group", 10));
        if (GlobalViz.vis?.state === states.Schema) {
            for (let button of this.schemaButtons.get_buttons()) {
                this.data.add_entry(button);
            }
        }
        if (GlobalViz.vis?.state === states.Editor) {
            for (let button of this.queryButtons.get_buttons()) {
                this.data.add_entry(button);
            }
        }

    }

    _switch_mode(mode) {
        GlobalViz.vis?.apply_current_schema(true);
        GlobalViz.vis?.set_state(mode);
        this.build();
    }
}
